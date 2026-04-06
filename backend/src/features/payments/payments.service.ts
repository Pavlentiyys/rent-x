import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Commitment,
  Connection,
  ParsedTransactionWithMeta,
} from '@solana/web3.js';
import { Repository } from 'typeorm';
import { RentsService } from '../rents/rents.service';
import { RentEvent } from '../rents/entities/rent-event.entity';
import { Rent, RentStatus } from '../rents/entities/rent.entity';

type RentPaymentField =
  | 'paymentTxSignature'
  | 'depositTxSignature'
  | 'returnTxSignature';

type TransferRequirement = {
  actorWallet: string;
  expectedMint: string;
  minAmount: number;
  maxAmount?: number;
};

type ParsedTransfer = {
  program: string;
  mint: string | null;
  amount: number;
  authority: string | null;
  source: string | null;
  destination: string | null;
};

@Injectable()
export class PaymentsService {
  private readonly connection: Connection;
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    configService: ConfigService,
    private readonly rentsService: RentsService,
    @InjectRepository(Rent)
    private readonly rentsRepository: Repository<Rent>,
    @InjectRepository(RentEvent)
    private readonly rentEventsRepository: Repository<RentEvent>,
  ) {
    this.connection = new Connection(
      configService.get<string>('SOLANA_RPC_URL', 'https://api.devnet.solana.com'),
      configService.get<string>('SOLANA_COMMITMENT', 'confirmed') as Commitment,
    );
  }

  async verifyRentPayment(
    rentId: number,
    signature: string,
    actorUserId: number,
    actorWallet: string,
  ) {
    const rent = await this.rentsService.findOne(rentId, actorUserId);

    if (rent.renterId !== actorUserId) {
      throw new ConflictException('Only the renter can attach rent payment transactions');
    }

    if (![RentStatus.Approved, RentStatus.Paid].includes(rent.status)) {
      throw new ConflictException(
        'Rent payment can only be attached to approved or paid rents',
      );
    }

    return this.attachVerifiedTransaction(
      rent,
      'paymentTxSignature',
      signature,
      actorUserId,
      {
        actorWallet,
        expectedMint: rent.currencyMint,
        minAmount: Number(rent.rentAmount),
      },
      'payment.rent_verified',
    );
  }

  async verifyDepositPayment(
    rentId: number,
    signature: string,
    actorUserId: number,
    actorWallet: string,
  ) {
    const rent = await this.rentsService.findOne(rentId, actorUserId);

    if (rent.renterId !== actorUserId) {
      throw new ConflictException(
        'Only the renter can attach deposit payment transactions',
      );
    }

    if (![RentStatus.Approved, RentStatus.Paid].includes(rent.status)) {
      throw new ConflictException(
        'Deposit payment can only be attached to approved or paid rents',
      );
    }

    if (Number(rent.depositAmount) <= 0) {
      throw new ConflictException('This rent does not require a deposit payment');
    }

    return this.attachVerifiedTransaction(
      rent,
      'depositTxSignature',
      signature,
      actorUserId,
      {
        actorWallet,
        expectedMint: rent.currencyMint,
        minAmount: Number(rent.depositAmount),
      },
      'payment.deposit_verified',
    );
  }

  async verifyReturnPayment(
    rentId: number,
    signature: string,
    actorUserId: number,
    actorWallet: string,
  ) {
    const rent = await this.rentsService.findOne(rentId, actorUserId);

    if (rent.ownerId !== actorUserId) {
      throw new ConflictException('Only the owner can attach return payment transactions');
    }

    if (![RentStatus.Active, RentStatus.Disputed, RentStatus.Completed].includes(rent.status)) {
      throw new ConflictException(
        'Return payment can only be attached after the rent becomes active',
      );
    }

    if (Number(rent.depositAmount) <= 0) {
      throw new ConflictException('This rent does not require a return payment');
    }

    return this.attachVerifiedTransaction(
      rent,
      'returnTxSignature',
      signature,
      actorUserId,
      {
        actorWallet,
        expectedMint: rent.currencyMint,
        minAmount: 0.000001,
        maxAmount: Number(rent.depositAmount),
      },
      'payment.return_verified',
    );
  }

  async inspectTransaction(signature: string, actorWallet: string) {
    const transaction = await this.fetchSuccessfulTransaction(signature);
    const signerWallets = this.extractSignerWallets(transaction);

    if (!signerWallets.includes(actorWallet)) {
      throw new BadRequestException('Authenticated wallet is not a signer of this transaction');
    }

    this.logger.log(
      JSON.stringify({
        event: 'payment.transaction_inspected',
        signature,
        actorWallet,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        signerWallets,
      }),
    );

    return this.toVerificationResponse(signature, transaction);
  }

  private async attachVerifiedTransaction(
    rent: Rent,
    field: RentPaymentField,
    signature: string,
    actorUserId: number,
    requirement: TransferRequirement,
    eventType: string,
  ) {
    if (rent[field]) {
      throw new ConflictException(`Transaction for ${field} is already attached`);
    }

    await this.assertSignatureUnused(signature);

    const transaction = await this.fetchSuccessfulTransaction(signature);
    const signerWallets = this.extractSignerWallets(transaction);

    if (!signerWallets.includes(requirement.actorWallet)) {
      throw new BadRequestException('Authenticated wallet is not a signer of this transaction');
    }

    const matchedTransfer = this.findMatchingTransfer(transaction, requirement);

    if (!matchedTransfer) {
      throw new BadRequestException(
        'Transaction does not contain the expected token transfer for this rent',
      );
    }

    rent[field] = signature;
    await this.rentsRepository.save(rent);
    await this.rentEventsRepository.save(
      this.rentEventsRepository.create({
        rentId: rent.id,
        type: eventType,
        payload: {
          actorUserId,
          signature,
          slot: transaction.slot,
          blockTime: transaction.blockTime,
          signerWallets,
          field,
          matchedTransfer,
        },
      }),
    );

    this.logger.log(
      JSON.stringify({
        event: eventType,
        rentId: rent.id,
        actorUserId,
        field,
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        signerWallets,
        matchedTransfer,
      }),
    );

    return {
      rent: await this.rentsService.findOne(rent.id, actorUserId),
      verification: this.toVerificationResponse(signature, transaction),
    };
  }

  private async fetchSuccessfulTransaction(signature: string) {
    const transaction = await this.connection.getParsedTransaction(signature, {
      maxSupportedTransactionVersion: 0,
      commitment: 'confirmed',
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found on configured Solana RPC');
    }

    if (transaction.meta?.err) {
      throw new ConflictException('Transaction failed on chain');
    }

    return transaction;
  }

  private extractSignerWallets(transaction: ParsedTransactionWithMeta) {
    return transaction.transaction.message.accountKeys
      .filter((account) => account.signer)
      .map((account) => account.pubkey.toBase58());
  }

  private async assertSignatureUnused(signature: string) {
    const existingRent = await this.rentsRepository.findOne({
      where: [
        { paymentTxSignature: signature },
        { depositTxSignature: signature },
        { returnTxSignature: signature },
      ],
    });

    if (existingRent) {
      throw new ConflictException('Transaction signature is already attached to another rent');
    }
  }

  private toVerificationResponse(
    signature: string,
    transaction: ParsedTransactionWithMeta,
  ) {
    return {
      signature,
      slot: transaction.slot,
      blockTime: transaction.blockTime,
      signerWallets: this.extractSignerWallets(transaction),
      accountKeys: transaction.transaction.message.accountKeys.map((account) => ({
        wallet: account.pubkey.toBase58(),
        signer: account.signer,
        writable: account.writable,
      })),
    };
  }

  private findMatchingTransfer(
    transaction: ParsedTransactionWithMeta,
    requirement: TransferRequirement,
  ) {
    const transfers = this.extractTransfers(transaction);

    return transfers.find((transfer) => {
      if (transfer.mint !== requirement.expectedMint) {
        return false;
      }

      if (transfer.amount < requirement.minAmount) {
        return false;
      }

      if (
        requirement.maxAmount !== undefined &&
        transfer.amount > requirement.maxAmount
      ) {
        return false;
      }

      if (transfer.authority && transfer.authority !== requirement.actorWallet) {
        return false;
      }

      return true;
    });
  }

  private extractTransfers(transaction: ParsedTransactionWithMeta): ParsedTransfer[] {
    return transaction.transaction.message.instructions.flatMap((instruction) => {
      if (!('parsed' in instruction) || !instruction.parsed) {
        return [];
      }

      if (!['spl-token', 'spl-token-2022'].includes(instruction.program)) {
        return [];
      }

      const parsed = instruction.parsed as {
        type?: string;
        info?: Record<string, unknown>;
      };

      if (!['transfer', 'transferChecked'].includes(parsed.type ?? '')) {
        return [];
      }

      const info = parsed.info ?? {};
      const amount = this.extractTransferAmount(info);

      if (amount === null) {
        return [];
      }

      return [
        {
          program: instruction.program,
          mint: typeof info.mint === 'string' ? info.mint : null,
          amount,
          authority: this.extractAuthority(info),
          source: typeof info.source === 'string' ? info.source : null,
          destination: typeof info.destination === 'string' ? info.destination : null,
        },
      ];
    });
  }

  private extractTransferAmount(info: Record<string, unknown>) {
    const tokenAmount = info.tokenAmount as
      | { uiAmountString?: string; uiAmount?: number }
      | undefined;

    if (typeof tokenAmount?.uiAmountString === 'string') {
      return Number(tokenAmount.uiAmountString);
    }

    if (typeof tokenAmount?.uiAmount === 'number') {
      return tokenAmount.uiAmount;
    }

    if (typeof info.amount === 'string' || typeof info.amount === 'number') {
      return Number(info.amount);
    }

    return null;
  }

  private extractAuthority(info: Record<string, unknown>) {
    const authorityFields = ['authority', 'owner', 'sourceOwner', 'multisigAuthority'];

    for (const field of authorityFields) {
      const value = info[field];

      if (typeof value === 'string') {
        return value;
      }
    }

    return null;
  }
}

import {
  BadRequestException,
  ConflictException,
  Injectable,
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

@Injectable()
export class PaymentsService {
  private readonly connection: Connection;

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
      actorWallet,
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

    return this.attachVerifiedTransaction(
      rent,
      'depositTxSignature',
      signature,
      actorUserId,
      actorWallet,
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

    return this.attachVerifiedTransaction(
      rent,
      'returnTxSignature',
      signature,
      actorUserId,
      actorWallet,
      'payment.return_verified',
    );
  }

  async inspectTransaction(signature: string, actorWallet: string) {
    const transaction = await this.fetchSuccessfulTransaction(signature);
    const signerWallets = this.extractSignerWallets(transaction);

    if (!signerWallets.includes(actorWallet)) {
      throw new BadRequestException('Authenticated wallet is not a signer of this transaction');
    }

    return this.toVerificationResponse(signature, transaction);
  }

  private async attachVerifiedTransaction(
    rent: Rent,
    field: RentPaymentField,
    signature: string,
    actorUserId: number,
    actorWallet: string,
    eventType: string,
  ) {
    if (rent[field]) {
      throw new ConflictException(`Transaction for ${field} is already attached`);
    }

    await this.assertSignatureUnused(signature);

    const transaction = await this.fetchSuccessfulTransaction(signature);
    const signerWallets = this.extractSignerWallets(transaction);

    if (!signerWallets.includes(actorWallet)) {
      throw new BadRequestException('Authenticated wallet is not a signer of this transaction');
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
        },
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
}

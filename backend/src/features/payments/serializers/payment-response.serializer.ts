import {
  serializeRent,
  RentResponseDto,
} from '../../rents/serializers/rent-response.serializer';
import { Rent } from '../../rents/entities/rent.entity';

export class TransactionAccountKeyResponseDto {
  wallet: string;
  signer: boolean;
  writable: boolean;
}

export class TransactionVerificationResponseDto {
  signature: string;
  slot: number;
  blockTime: number | null;
  signerWallets: string[];
  accountKeys: TransactionAccountKeyResponseDto[];
}

export class VerifiedRentPaymentResponseDto {
  rent: RentResponseDto;
  verification: TransactionVerificationResponseDto;
}

export function serializeVerifiedRentPayment(result: {
  rent: Rent;
  verification: TransactionVerificationResponseDto;
}): VerifiedRentPaymentResponseDto {
  return {
    rent: serializeRent(result.rent),
    verification: serializeTransactionVerification(result.verification),
  };
}

export function serializeTransactionVerification(
  verification: TransactionVerificationResponseDto,
): TransactionVerificationResponseDto {
  return {
    signature: verification.signature,
    slot: verification.slot,
    blockTime: verification.blockTime,
    signerWallets: [...verification.signerWallets],
    accountKeys: verification.accountKeys.map((accountKey) => ({
      wallet: accountKey.wallet,
      signer: accountKey.signer,
      writable: accountKey.writable,
    })),
  };
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  serializeRent,
  RentResponseDto,
} from '../../rents/serializers/rent-response.serializer';
import { Rent } from '../../rents/entities/rent.entity';

export class TransactionAccountKeyResponseDto {
  @ApiProperty()
  wallet: string;
  @ApiProperty()
  signer: boolean;
  @ApiProperty()
  writable: boolean;
}

export class TransactionVerificationResponseDto {
  @ApiProperty()
  signature: string;
  @ApiProperty()
  slot: number;
  @ApiPropertyOptional({ nullable: true })
  blockTime: number | null;
  @ApiProperty({ type: [String] })
  signerWallets: string[];
  @ApiProperty({ type: [TransactionAccountKeyResponseDto] })
  accountKeys: TransactionAccountKeyResponseDto[];
}

export class VerifiedRentPaymentResponseDto {
  @ApiProperty({ type: RentResponseDto })
  rent: RentResponseDto;
  @ApiProperty({ type: TransactionVerificationResponseDto })
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

import { RentResponseDto } from '../../rents/serializers/rent-response.serializer';
import { Rent } from '../../rents/entities/rent.entity';
export declare class TransactionAccountKeyResponseDto {
    wallet: string;
    signer: boolean;
    writable: boolean;
}
export declare class TransactionVerificationResponseDto {
    signature: string;
    slot: number;
    blockTime: number | null;
    signerWallets: string[];
    accountKeys: TransactionAccountKeyResponseDto[];
}
export declare class VerifiedRentPaymentResponseDto {
    rent: RentResponseDto;
    verification: TransactionVerificationResponseDto;
}
export declare function serializeVerifiedRentPayment(result: {
    rent: Rent;
    verification: TransactionVerificationResponseDto;
}): VerifiedRentPaymentResponseDto;
export declare function serializeTransactionVerification(verification: TransactionVerificationResponseDto): TransactionVerificationResponseDto;

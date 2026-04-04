import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { PaymentsService } from './payments.service';
import { TransactionVerificationResponseDto, VerifiedRentPaymentResponseDto } from './serializers/payment-response.serializer';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    verifyRentPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<VerifiedRentPaymentResponseDto>;
    verifyDepositPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<VerifiedRentPaymentResponseDto>;
    verifyReturnPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<VerifiedRentPaymentResponseDto>;
    inspectTransaction(signature: string, currentUser: AuthenticatedUser): Promise<TransactionVerificationResponseDto>;
}

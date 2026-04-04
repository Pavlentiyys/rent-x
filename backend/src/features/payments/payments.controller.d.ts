import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { VerifyTransactionDto } from './dto/verify-transaction.dto';
import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    verifyRentPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<import("./serializers/payment-response.serializer").VerifiedRentPaymentResponseDto>;
    verifyDepositPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<import("./serializers/payment-response.serializer").VerifiedRentPaymentResponseDto>;
    verifyReturnPayment(id: number, dto: VerifyTransactionDto, currentUser: AuthenticatedUser): Promise<import("./serializers/payment-response.serializer").VerifiedRentPaymentResponseDto>;
    inspectTransaction(signature: string, currentUser: AuthenticatedUser): Promise<import("./serializers/payment-response.serializer").TransactionVerificationResponseDto>;
}

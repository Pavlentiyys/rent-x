"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const verify_transaction_dto_1 = require("./dto/verify-transaction.dto");
const payments_service_1 = require("./payments.service");
const payment_response_serializer_1 = require("./serializers/payment-response.serializer");
let PaymentsController = class PaymentsController {
    paymentsService;
    constructor(paymentsService) {
        this.paymentsService = paymentsService;
    }
    verifyRentPayment(id, dto, currentUser) {
        return this.paymentsService
            .verifyRentPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
            .then(payment_response_serializer_1.serializeVerifiedRentPayment);
    }
    verifyDepositPayment(id, dto, currentUser) {
        return this.paymentsService
            .verifyDepositPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
            .then(payment_response_serializer_1.serializeVerifiedRentPayment);
    }
    verifyReturnPayment(id, dto, currentUser) {
        return this.paymentsService
            .verifyReturnPayment(id, dto.signature, currentUser.userId, currentUser.wallet)
            .then(payment_response_serializer_1.serializeVerifiedRentPayment);
    }
    inspectTransaction(signature, currentUser) {
        return this.paymentsService
            .inspectTransaction(signature, currentUser.wallet)
            .then(payment_response_serializer_1.serializeTransactionVerification);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify and attach rent payment transaction' }),
    (0, swagger_1.ApiOkResponse)({ type: payment_response_serializer_1.VerifiedRentPaymentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)('rents/:id/rent'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verify_transaction_dto_1.VerifyTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyRentPayment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify and attach deposit payment transaction' }),
    (0, swagger_1.ApiOkResponse)({ type: payment_response_serializer_1.VerifiedRentPaymentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)('rents/:id/deposit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verify_transaction_dto_1.VerifyTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyDepositPayment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify and attach return payment transaction' }),
    (0, swagger_1.ApiOkResponse)({ type: payment_response_serializer_1.VerifiedRentPaymentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)('rents/:id/return'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, verify_transaction_dto_1.VerifyTransactionDto, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "verifyReturnPayment", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Inspect Solana transaction visible to current signer' }),
    (0, swagger_1.ApiOkResponse)({ type: payment_response_serializer_1.TransactionVerificationResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 404, 409),
    (0, common_1.Get)('transactions/:signature'),
    __param(0, (0, common_1.Param)('signature')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "inspectTransaction", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, swagger_1.ApiTags)('payments'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('payments'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [payments_service_1.PaymentsService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map
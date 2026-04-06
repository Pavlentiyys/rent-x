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
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifiedRentPaymentResponseDto = exports.TransactionVerificationResponseDto = exports.TransactionAccountKeyResponseDto = void 0;
exports.serializeVerifiedRentPayment = serializeVerifiedRentPayment;
exports.serializeTransactionVerification = serializeTransactionVerification;
const swagger_1 = require("@nestjs/swagger");
const rent_response_serializer_1 = require("../../rents/serializers/rent-response.serializer");
class TransactionAccountKeyResponseDto {
    wallet;
    signer;
    writable;
}
exports.TransactionAccountKeyResponseDto = TransactionAccountKeyResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionAccountKeyResponseDto.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TransactionAccountKeyResponseDto.prototype, "signer", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], TransactionAccountKeyResponseDto.prototype, "writable", void 0);
class TransactionVerificationResponseDto {
    signature;
    slot;
    blockTime;
    signerWallets;
    accountKeys;
}
exports.TransactionVerificationResponseDto = TransactionVerificationResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], TransactionVerificationResponseDto.prototype, "signature", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], TransactionVerificationResponseDto.prototype, "slot", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], TransactionVerificationResponseDto.prototype, "blockTime", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [String] }),
    __metadata("design:type", Array)
], TransactionVerificationResponseDto.prototype, "signerWallets", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [TransactionAccountKeyResponseDto] }),
    __metadata("design:type", Array)
], TransactionVerificationResponseDto.prototype, "accountKeys", void 0);
class VerifiedRentPaymentResponseDto {
    rent;
    verification;
}
exports.VerifiedRentPaymentResponseDto = VerifiedRentPaymentResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: rent_response_serializer_1.RentResponseDto }),
    __metadata("design:type", rent_response_serializer_1.RentResponseDto)
], VerifiedRentPaymentResponseDto.prototype, "rent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: TransactionVerificationResponseDto }),
    __metadata("design:type", TransactionVerificationResponseDto)
], VerifiedRentPaymentResponseDto.prototype, "verification", void 0);
function serializeVerifiedRentPayment(result) {
    return {
        rent: (0, rent_response_serializer_1.serializeRent)(result.rent),
        verification: serializeTransactionVerification(result.verification),
    };
}
function serializeTransactionVerification(verification) {
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
//# sourceMappingURL=payment-response.serializer.js.map
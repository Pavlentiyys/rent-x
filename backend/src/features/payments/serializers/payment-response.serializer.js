"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerifiedRentPaymentResponseDto = exports.TransactionVerificationResponseDto = exports.TransactionAccountKeyResponseDto = void 0;
exports.serializeVerifiedRentPayment = serializeVerifiedRentPayment;
exports.serializeTransactionVerification = serializeTransactionVerification;
const rent_response_serializer_1 = require("../../rents/serializers/rent-response.serializer");
class TransactionAccountKeyResponseDto {
    wallet;
    signer;
    writable;
}
exports.TransactionAccountKeyResponseDto = TransactionAccountKeyResponseDto;
class TransactionVerificationResponseDto {
    signature;
    slot;
    blockTime;
    signerWallets;
    accountKeys;
}
exports.TransactionVerificationResponseDto = TransactionVerificationResponseDto;
class VerifiedRentPaymentResponseDto {
    rent;
    verification;
}
exports.VerifiedRentPaymentResponseDto = VerifiedRentPaymentResponseDto;
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
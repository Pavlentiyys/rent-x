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
exports.VerifySiwsSignatureDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class VerifySiwsSignatureDto {
    wallet;
    message;
    signature;
}
exports.VerifySiwsSignatureDto = VerifySiwsSignatureDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '7YyZgM3j2g8G1V4qkQYJx9hQW3s9bL1u2x6R7t8p9Qa' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/),
    __metadata("design:type", String)
], VerifySiwsSignatureDto.prototype, "wallet", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'RentX wants you to sign in with your Solana account:\n...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 2000),
    __metadata("design:type", String)
], VerifySiwsSignatureDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '3WNw3tXgWQ4g3pM4z...' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(32, 256),
    __metadata("design:type", String)
], VerifySiwsSignatureDto.prototype, "signature", void 0);
//# sourceMappingURL=verify-siws-signature.dto.js.map
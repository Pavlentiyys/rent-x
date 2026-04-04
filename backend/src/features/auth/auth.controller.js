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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const auth_service_1 = require("./auth.service");
const current_user_decorator_1 = require("./decorators/current-user.decorator");
const generate_siws_message_dto_1 = require("./dto/generate-siws-message.dto");
const verify_siws_signature_dto_1 = require("./dto/verify-siws-signature.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const user_response_serializer_1 = require("../users/serializers/user-response.serializer");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    generateSiwsMessage(dto) {
        return this.authService.generateSiwsMessage(dto.wallet);
    }
    verifySiwsSignature(dto) {
        return this.authService.verifySignature(dto.wallet, dto.message, dto.signature);
    }
    async me(currentUser) {
        return (0, user_response_serializer_1.serializeCurrentUser)(await this.authService.getMe(currentUser.userId));
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Generate SIWS message for wallet sign-in' }),
    (0, swagger_1.ApiBody)({ type: generate_siws_message_dto_1.GenerateSiwsMessageDto }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            properties: {
                wallet: { type: 'string' },
                message: { type: 'string' },
                expiresAt: { type: 'string', format: 'date-time' },
            },
        },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401),
    (0, common_1.Post)('wallet/message'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_siws_message_dto_1.GenerateSiwsMessageDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "generateSiwsMessage", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Verify SIWS signature and issue JWT' }),
    (0, swagger_1.ApiBody)({ type: verify_siws_signature_dto_1.VerifySiwsSignatureDto }),
    (0, swagger_1.ApiOkResponse)({
        schema: { properties: { access_token: { type: 'string' } } },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401),
    (0, common_1.Post)('wallet/verify'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_siws_signature_dto_1.VerifySiwsSignatureDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "verifySiwsSignature", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.CurrentUserResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 404),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
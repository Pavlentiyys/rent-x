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
exports.RentsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const create_rent_dto_1 = require("./dto/create-rent.dto");
const dispute_rent_dto_1 = require("./dto/dispute-rent.dto");
const reject_rent_dto_1 = require("./dto/reject-rent.dto");
const rent_reason_dto_1 = require("./dto/rent-reason.dto");
const rents_service_1 = require("./rents.service");
const rent_response_serializer_1 = require("./serializers/rent-response.serializer");
let RentsController = class RentsController {
    rentsService;
    constructor(rentsService) {
        this.rentsService = rentsService;
    }
    create(dto, currentUser) {
        return this.rentsService.create(dto, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    findAll(currentUser) {
        return this.rentsService.findAll(currentUser.userId).then(rent_response_serializer_1.serializeRentList);
    }
    findOne(id, currentUser) {
        return this.rentsService.findOne(id, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    approve(id, currentUser) {
        return this.rentsService.approve(id, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    reject(id, dto, currentUser) {
        return this.rentsService
            .reject(id, dto.reason, currentUser.userId)
            .then(rent_response_serializer_1.serializeRent);
    }
    markPaid(id, currentUser) {
        return this.rentsService.markPaid(id, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    handover(id, currentUser) {
        return this.rentsService.handover(id, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    complete(id, currentUser) {
        return this.rentsService.complete(id, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    cancel(id, dto, currentUser) {
        return this.rentsService.cancel(id, dto.reason, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    dispute(id, dto, currentUser) {
        return this.rentsService.dispute(id, dto.reason, currentUser.userId).then(rent_response_serializer_1.serializeRent);
    }
    remove(id, currentUser) {
        return this.rentsService.remove(id, currentUser.userId);
    }
};
exports.RentsController = RentsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a rent request' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 404, 409),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rent_dto_1.CreateRentDto, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List current user rents' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto, isArray: true }),
    (0, common_1.Get)(),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get rent details by id' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Approve pending rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.Post)(':id/approve'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "approve", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Reject pending rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)(':id/reject'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reject_rent_dto_1.RejectRentDto, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "reject", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Mark approved rent as paid' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.Post)(':id/mark-paid'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "markPaid", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Confirm handover and activate rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.Post)(':id/handover'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "handover", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Complete active or disputed rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.Post)(':id/complete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "complete", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Cancel pending or approved rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)(':id/cancel'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, rent_reason_dto_1.RentReasonDto, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "cancel", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Open dispute for active rent' }),
    (0, swagger_1.ApiOkResponse)({ type: rent_response_serializer_1.RentResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.Post)(':id/dispute'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, dispute_rent_dto_1.DisputeRentDto, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "dispute", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete non-active rent record' }),
    (0, swagger_1.ApiOkResponse)({
        schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], RentsController.prototype, "remove", null);
exports.RentsController = RentsController = __decorate([
    (0, swagger_1.ApiTags)('rents'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('rents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [rents_service_1.RentsService])
], RentsController);
//# sourceMappingURL=rents.controller.js.map
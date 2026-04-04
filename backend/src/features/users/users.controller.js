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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_response_serializer_1 = require("./serializers/user-response.serializer");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    me(currentUser) {
        return this.usersService.findOne(currentUser.userId).then(user_response_serializer_1.serializeCurrentUser);
    }
    findAll() {
        return this.usersService.findAll().then((users) => users.map(user_response_serializer_1.serializeUserProfile));
    }
    findOne(id) {
        return this.usersService.findOne(id).then(user_response_serializer_1.serializeUserProfile);
    }
    updateMe(updateUserDto, currentUser) {
        return this.usersService
            .update(currentUser.userId, updateUserDto, currentUser.userId)
            .then(user_response_serializer_1.serializeCurrentUser);
    }
    removeMe(currentUser) {
        return this.usersService.remove(currentUser.userId, currentUser.userId);
    }
    update(id, updateUserDto, currentUser) {
        return this.usersService
            .update(id, updateUserDto, currentUser.userId)
            .then((user) => id === currentUser.userId ? (0, user_response_serializer_1.serializeCurrentUser)(user) : (0, user_response_serializer_1.serializeUserProfile)(user));
    }
    remove(id, currentUser) {
        return this.usersService.remove(id, currentUser.userId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current authenticated user profile' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.CurrentUserResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 404),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "me", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List public user profiles' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.UserProfileResponseDto, isArray: true }),
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get public user profile by id' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.UserProfileResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(404),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.CurrentUserResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete current user profile' }),
    (0, swagger_1.ApiOkResponse)({
        schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "removeMe", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update user profile by id (owner only)' }),
    (0, swagger_1.ApiOkResponse)({ type: user_response_serializer_1.CurrentUserResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user profile by id (owner only)' }),
    (0, swagger_1.ApiOkResponse)({
        schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map
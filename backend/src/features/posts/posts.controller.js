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
exports.PostsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const api_common_error_responses_decorator_1 = require("../../common/swagger/api-common-error-responses.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const post_action_dto_1 = require("./dto/post-action.dto");
const search_posts_dto_1 = require("./dto/search-posts.dto");
const create_post_dto_1 = require("./dto/create-post.dto");
const update_post_dto_1 = require("./dto/update-post.dto");
const posts_service_1 = require("./posts.service");
const post_response_serializer_1 = require("./serializers/post-response.serializer");
let PostsController = class PostsController {
    postsService;
    constructor(postsService) {
        this.postsService = postsService;
    }
    create(dto, currentUser) {
        return this.postsService.create(dto, currentUser.userId).then(post_response_serializer_1.serializePost);
    }
    findAll(query) {
        return this.postsService.findAll(query).then(post_response_serializer_1.serializePaginatedPosts);
    }
    findMine(currentUser, query) {
        return this.postsService
            .findMine(currentUser.userId, query)
            .then(post_response_serializer_1.serializePaginatedPosts);
    }
    findOne(id) {
        return this.postsService.findOne(id).then(post_response_serializer_1.serializePost);
    }
    update(id, dto, currentUser) {
        return this.postsService.update(id, dto, currentUser.userId).then(post_response_serializer_1.serializePost);
    }
    publish(id, currentUser) {
        return this.postsService.publish(id, currentUser.userId).then(post_response_serializer_1.serializePost);
    }
    pause(id, dto, currentUser) {
        return this.postsService.pause(id, currentUser.userId, dto.reason).then(post_response_serializer_1.serializePost);
    }
    archive(id, dto, currentUser) {
        return this.postsService
            .archive(id, currentUser.userId, dto.reason)
            .then(post_response_serializer_1.serializePost);
    }
    remove(id, currentUser) {
        return this.postsService.remove(id, currentUser.userId);
    }
};
exports.PostsController = PostsController;
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a rental post' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_post_dto_1.CreatePostDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Search active rental posts' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PaginatedPostsResponseDto }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_posts_dto_1.SearchPostsDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findAll", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'List current user posts' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PaginatedPostsResponseDto }),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Get)('mine'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, search_posts_dto_1.SearchPostsDto]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findMine", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get post by id' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(404),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update own post' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_post_dto_1.UpdatePostDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Publish a draft or paused post' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/publish'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "publish", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Pause a post' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/pause'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, post_action_dto_1.PostActionDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "pause", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Archive a post' }),
    (0, swagger_1.ApiOkResponse)({ type: post_response_serializer_1.PostResponseDto }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(400, 401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':id/archive'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, post_action_dto_1.PostActionDto, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "archive", null);
__decorate([
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a post' }),
    (0, swagger_1.ApiOkResponse)({
        schema: { properties: { id: { type: 'number' }, deleted: { type: 'boolean' } } },
    }),
    (0, api_common_error_responses_decorator_1.ApiCommonErrorResponses)(401, 403, 404, 409),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], PostsController.prototype, "remove", null);
exports.PostsController = PostsController = __decorate([
    (0, swagger_1.ApiTags)('posts'),
    (0, common_1.Controller)('posts'),
    __metadata("design:paramtypes", [posts_service_1.PostsService])
], PostsController);
//# sourceMappingURL=posts.controller.js.map
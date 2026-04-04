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
exports.PaginatedPostsResponseDto = exports.PostResponseDto = exports.PostImageResponseDto = exports.PostAttributeResponseDto = void 0;
exports.serializePost = serializePost;
exports.serializePaginatedPosts = serializePaginatedPosts;
const swagger_1 = require("@nestjs/swagger");
const user_response_serializer_1 = require("../../users/serializers/user-response.serializer");
class PostAttributeResponseDto {
    id;
    key;
    value;
    type;
}
exports.PostAttributeResponseDto = PostAttributeResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PostAttributeResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostAttributeResponseDto.prototype, "key", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostAttributeResponseDto.prototype, "value", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostAttributeResponseDto.prototype, "type", void 0);
class PostImageResponseDto {
    id;
    objectKey;
    url;
    sortOrder;
}
exports.PostImageResponseDto = PostImageResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PostImageResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostImageResponseDto.prototype, "objectKey", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostImageResponseDto.prototype, "url", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PostImageResponseDto.prototype, "sortOrder", void 0);
class PostResponseDto {
    id;
    title;
    description;
    category;
    pricePerDay;
    depositAmount;
    currencyMint;
    location;
    status;
    availableFrom;
    availableTo;
    owner;
    attributes;
    images;
    createdAt;
    updatedAt;
}
exports.PostResponseDto = PostResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PostResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "pricePerDay", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "depositAmount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "currencyMint", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], PostResponseDto.prototype, "location", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], PostResponseDto.prototype, "availableFrom", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], PostResponseDto.prototype, "availableTo", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: user_response_serializer_1.UserProfileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], PostResponseDto.prototype, "owner", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PostAttributeResponseDto] }),
    __metadata("design:type", Array)
], PostResponseDto.prototype, "attributes", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PostImageResponseDto] }),
    __metadata("design:type", Array)
], PostResponseDto.prototype, "images", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], PostResponseDto.prototype, "updatedAt", void 0);
class PaginatedPostsResponseDto {
    items;
    total;
    page;
    limit;
    totalPages;
}
exports.PaginatedPostsResponseDto = PaginatedPostsResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ type: [PostResponseDto] }),
    __metadata("design:type", Array)
], PaginatedPostsResponseDto.prototype, "items", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPostsResponseDto.prototype, "total", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPostsResponseDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPostsResponseDto.prototype, "limit", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PaginatedPostsResponseDto.prototype, "totalPages", void 0);
function serializePost(post) {
    return {
        id: post.id,
        title: post.title,
        description: post.description,
        category: post.category,
        pricePerDay: post.pricePerDay,
        depositAmount: post.depositAmount,
        currencyMint: post.currencyMint,
        location: post.location,
        status: post.status,
        availableFrom: post.availableFrom?.toISOString() ?? null,
        availableTo: post.availableTo?.toISOString() ?? null,
        owner: post.owner ? (0, user_response_serializer_1.serializeUserProfile)(post.owner) : null,
        attributes: [...(post.attributes ?? [])]
            .sort((a, b) => a.id - b.id)
            .map(serializePostAttribute),
        images: [...(post.images ?? [])]
            .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
            .map(serializePostImage),
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
    };
}
function serializePaginatedPosts(result) {
    return {
        items: result.items.map(serializePost),
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
    };
}
function serializePostAttribute(attribute) {
    return {
        id: attribute.id,
        key: attribute.key,
        value: attribute.value,
        type: attribute.type,
    };
}
function serializePostImage(image) {
    return {
        id: image.id,
        objectKey: image.objectKey,
        url: image.url,
        sortOrder: image.sortOrder,
    };
}
//# sourceMappingURL=post-response.serializer.js.map
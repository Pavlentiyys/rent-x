"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostResponseDto = exports.PostImageResponseDto = exports.PostAttributeResponseDto = void 0;
exports.serializePost = serializePost;
exports.serializePaginatedPosts = serializePaginatedPosts;
const user_response_serializer_1 = require("../../users/serializers/user-response.serializer");
class PostAttributeResponseDto {
    id;
    key;
    value;
    type;
}
exports.PostAttributeResponseDto = PostAttributeResponseDto;
class PostImageResponseDto {
    id;
    objectKey;
    url;
    sortOrder;
}
exports.PostImageResponseDto = PostImageResponseDto;
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
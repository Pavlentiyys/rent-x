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
exports.ReviewResponseDto = void 0;
exports.serializeReview = serializeReview;
exports.serializeReviewList = serializeReviewList;
const swagger_1 = require("@nestjs/swagger");
const user_response_serializer_1 = require("../../users/serializers/user-response.serializer");
class ReviewResponseDto {
    id;
    rentId;
    postId;
    rating;
    comment;
    author;
    targetUser;
    createdAt;
}
exports.ReviewResponseDto = ReviewResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReviewResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReviewResponseDto.prototype, "rentId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReviewResponseDto.prototype, "postId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], ReviewResponseDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ nullable: true }),
    __metadata("design:type", Object)
], ReviewResponseDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: user_response_serializer_1.UserProfileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], ReviewResponseDto.prototype, "author", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: user_response_serializer_1.UserProfileResponseDto, nullable: true }),
    __metadata("design:type", Object)
], ReviewResponseDto.prototype, "targetUser", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", String)
], ReviewResponseDto.prototype, "createdAt", void 0);
function serializeReview(review) {
    return {
        id: review.id,
        rentId: review.rentId,
        postId: review.postId,
        rating: review.rating,
        comment: review.comment,
        author: review.author ? (0, user_response_serializer_1.serializeUserProfile)(review.author) : null,
        targetUser: review.targetUser ? (0, user_response_serializer_1.serializeUserProfile)(review.targetUser) : null,
        createdAt: review.createdAt.toISOString(),
    };
}
function serializeReviewList(reviews) {
    return reviews.map(serializeReview);
}
//# sourceMappingURL=review-response.serializer.js.map
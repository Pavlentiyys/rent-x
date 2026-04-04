"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewResponseDto = void 0;
exports.serializeReview = serializeReview;
exports.serializeReviewList = serializeReviewList;
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
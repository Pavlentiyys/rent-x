import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { Review } from '../entities/review.entity';

export class ReviewResponseDto {
  id: number;
  rentId: number;
  postId: number;
  rating: number;
  comment: string | null;
  author: UserProfileResponseDto | null;
  targetUser: UserProfileResponseDto | null;
  createdAt: string;
}

export function serializeReview(review: Review): ReviewResponseDto {
  return {
    id: review.id,
    rentId: review.rentId,
    postId: review.postId,
    rating: review.rating,
    comment: review.comment,
    author: review.author ? serializeUserProfile(review.author) : null,
    targetUser: review.targetUser ? serializeUserProfile(review.targetUser) : null,
    createdAt: review.createdAt.toISOString(),
  };
}

export function serializeReviewList(reviews: Review[]) {
  return reviews.map(serializeReview);
}

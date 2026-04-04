import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { Review } from '../entities/review.entity';

export class ReviewResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  rentId: number;
  @ApiProperty()
  postId: number;
  @ApiProperty()
  rating: number;
  @ApiPropertyOptional({ nullable: true })
  comment: string | null;
  @ApiPropertyOptional({ type: UserProfileResponseDto, nullable: true })
  author: UserProfileResponseDto | null;
  @ApiPropertyOptional({ type: UserProfileResponseDto, nullable: true })
  targetUser: UserProfileResponseDto | null;
  @ApiProperty()
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

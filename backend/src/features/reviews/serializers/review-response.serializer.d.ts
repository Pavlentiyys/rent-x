import { UserProfileResponseDto } from '../../users/serializers/user-response.serializer';
import { Review } from '../entities/review.entity';
export declare class ReviewResponseDto {
    id: number;
    rentId: number;
    postId: number;
    rating: number;
    comment: string | null;
    author: UserProfileResponseDto | null;
    targetUser: UserProfileResponseDto | null;
    createdAt: string;
}
export declare function serializeReview(review: Review): ReviewResponseDto;
export declare function serializeReviewList(reviews: Review[]): ReviewResponseDto[];

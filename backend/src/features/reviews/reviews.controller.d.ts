import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, currentUser: AuthenticatedUser): Promise<import("./serializers/review-response.serializer").ReviewResponseDto>;
    findAll(): Promise<import("./serializers/review-response.serializer").ReviewResponseDto[]>;
    findOne(id: number): Promise<import("./serializers/review-response.serializer").ReviewResponseDto>;
    update(id: number, dto: UpdateReviewDto, currentUser: AuthenticatedUser): Promise<import("./serializers/review-response.serializer").ReviewResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

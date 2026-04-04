import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { ReviewResponseDto } from './serializers/review-response.serializer';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(dto: CreateReviewDto, currentUser: AuthenticatedUser): Promise<ReviewResponseDto>;
    findAll(): Promise<ReviewResponseDto[]>;
    findOne(id: number): Promise<ReviewResponseDto>;
    update(id: number, dto: UpdateReviewDto, currentUser: AuthenticatedUser): Promise<ReviewResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

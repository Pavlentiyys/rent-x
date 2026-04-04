import { PostStatus } from '../entities/post.entity';
export declare class SearchPostsDto {
    category?: string;
    location?: string;
    search?: string;
    status?: PostStatus;
    minPricePerDay?: number;
    maxPricePerDay?: number;
    availableFrom?: string;
    availableTo?: string;
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'pricePerDay';
    sortOrder?: 'ASC' | 'DESC';
}

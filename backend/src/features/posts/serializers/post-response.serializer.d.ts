import { UserProfileResponseDto } from '../../users/serializers/user-response.serializer';
import { Post } from '../entities/post.entity';
export declare class PostAttributeResponseDto {
    id: number;
    key: string;
    value: string;
    type: string;
}
export declare class PostImageResponseDto {
    id: number;
    objectKey: string;
    url: string;
    sortOrder: number;
}
export declare class PostResponseDto {
    id: number;
    title: string;
    description: string;
    category: string;
    pricePerDay: string;
    depositAmount: string;
    currencyMint: string;
    location: string | null;
    status: string;
    availableFrom: string | null;
    availableTo: string | null;
    owner: UserProfileResponseDto | null;
    attributes: PostAttributeResponseDto[];
    images: PostImageResponseDto[];
    createdAt: string;
    updatedAt: string;
}
export declare function serializePost(post: Post): PostResponseDto;
export declare function serializePaginatedPosts(result: {
    items: Post[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}): {
    items: PostResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

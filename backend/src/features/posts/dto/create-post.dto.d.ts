import { PostStatus } from '../entities/post.entity';
export declare class CreatePostAttributeDto {
    key: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'json';
}
export declare class CreatePostImageDto {
    objectKey: string;
    url: string;
    sortOrder?: number;
}
export declare class CreatePostDto {
    title: string;
    description: string;
    category: string;
    pricePerDay: string;
    depositAmount: string;
    currencyMint: string;
    location?: string;
    status?: PostStatus;
    availableFrom?: string;
    availableTo?: string;
    attributes?: CreatePostAttributeDto[];
    images?: CreatePostImageDto[];
}

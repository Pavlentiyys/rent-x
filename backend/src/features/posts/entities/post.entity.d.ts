import { Rent } from '../../rents/entities/rent.entity';
import { Review } from '../../reviews/entities/review.entity';
import { User } from '../../users/entities/user.entity';
import { PostAttribute } from './post-attribute.entity';
import { PostImage } from './post-image.entity';
export declare enum PostStatus {
    Draft = "draft",
    Active = "active",
    Paused = "paused",
    Rented = "rented",
    Archived = "archived"
}
export declare class Post {
    id: number;
    ownerId: number;
    title: string;
    description: string;
    category: string;
    pricePerDay: string;
    depositAmount: string;
    currencyMint: string;
    location: string | null;
    status: PostStatus;
    availableFrom: Date | null;
    availableTo: Date | null;
    owner: User;
    attributes: PostAttribute[];
    images: PostImage[];
    rents: Rent[];
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}

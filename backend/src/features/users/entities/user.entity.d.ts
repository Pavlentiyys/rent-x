import { Post } from '../../posts/entities/post.entity';
import { Rent } from '../../rents/entities/rent.entity';
import { Review } from '../../reviews/entities/review.entity';
import { WalletSession } from '../../auth/entities/wallet-session.entity';
export declare class User {
    id: number;
    walletAddress: string;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    rating: string;
    reviewsCount: number;
    isVerified: boolean;
    posts: Post[];
    ownerRents: Rent[];
    renterRents: Rent[];
    writtenReviews: Review[];
    receivedReviews: Review[];
    walletSessions: WalletSession[];
    createdAt: Date;
    updatedAt: Date;
}

import { Post } from '../../posts/entities/post.entity';
import { User } from '../../users/entities/user.entity';
import { Review } from '../../reviews/entities/review.entity';
import { RentEvent } from './rent-event.entity';
export declare enum RentStatus {
    Pending = "pending",
    Approved = "approved",
    Rejected = "rejected",
    Paid = "paid",
    Active = "active",
    Completed = "completed",
    Cancelled = "cancelled",
    Disputed = "disputed"
}
export declare class Rent {
    id: number;
    postId: number;
    ownerId: number;
    renterId: number;
    startDate: string;
    endDate: string;
    daysCount: number;
    pricePerDay: string;
    rentAmount: string;
    depositAmount: string;
    platformFeeAmount: string;
    totalAmount: string;
    currencyMint: string;
    paymentTxSignature: string | null;
    depositTxSignature: string | null;
    returnTxSignature: string | null;
    status: RentStatus;
    cancelReason: string | null;
    post: Post;
    owner: User;
    renter: User;
    reviews: Review[];
    events: RentEvent[];
    createdAt: Date;
    updatedAt: Date;
}

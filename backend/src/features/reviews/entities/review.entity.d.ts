import { Post } from '../../posts/entities/post.entity';
import { Rent } from '../../rents/entities/rent.entity';
import { User } from '../../users/entities/user.entity';
export declare class Review {
    id: number;
    rentId: number;
    authorId: number;
    targetUserId: number;
    postId: number;
    rating: number;
    comment: string | null;
    rent: Rent;
    author: User;
    targetUser: User;
    post: Post;
    createdAt: Date;
}

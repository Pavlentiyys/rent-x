import { Post } from './post.entity';
export declare class PostImage {
    id: number;
    postId: number;
    objectKey: string;
    url: string;
    sortOrder: number;
    post: Post;
}

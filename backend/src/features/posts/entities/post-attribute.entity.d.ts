import { Post } from './post.entity';
export declare enum PostAttributeType {
    String = "string",
    Number = "number",
    Boolean = "boolean",
    Json = "json"
}
export declare class PostAttribute {
    id: number;
    postId: number;
    key: string;
    value: string;
    type: PostAttributeType;
    post: Post;
}

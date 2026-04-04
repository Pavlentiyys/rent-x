import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { PostActionDto } from './dto/post-action.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostsService } from './posts.service';
export declare class PostsController {
    private readonly postsService;
    constructor(postsService: PostsService);
    create(dto: CreatePostDto, currentUser: AuthenticatedUser): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    findAll(query: SearchPostsDto): Promise<{
        items: import("./serializers/post-response.serializer").PostResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findMine(currentUser: AuthenticatedUser, query: SearchPostsDto): Promise<{
        items: import("./serializers/post-response.serializer").PostResponseDto[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    update(id: number, dto: UpdatePostDto, currentUser: AuthenticatedUser): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    publish(id: number, currentUser: AuthenticatedUser): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    pause(id: number, dto: PostActionDto, currentUser: AuthenticatedUser): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    archive(id: number, dto: PostActionDto, currentUser: AuthenticatedUser): Promise<import("./serializers/post-response.serializer").PostResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

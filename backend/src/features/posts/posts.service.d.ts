import { Repository } from 'typeorm';
import { Rent } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostAttribute } from './entities/post-attribute.entity';
import { PostImage } from './entities/post-image.entity';
import { Post } from './entities/post.entity';
export declare class PostsService {
    private readonly postsRepository;
    private readonly postAttributesRepository;
    private readonly postImagesRepository;
    private readonly rentsRepository;
    private readonly usersRepository;
    constructor(postsRepository: Repository<Post>, postAttributesRepository: Repository<PostAttribute>, postImagesRepository: Repository<PostImage>, rentsRepository: Repository<Rent>, usersRepository: Repository<User>);
    create(dto: CreatePostDto, ownerId: number): Promise<Post>;
    findAll(query: SearchPostsDto): Promise<{
        items: Post[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findMine(ownerId: number, query: SearchPostsDto): Promise<{
        items: Post[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number, actorUserId?: number): Promise<Post>;
    update(id: number, dto: UpdatePostDto, actorUserId: number): Promise<Post>;
    publish(id: number, actorUserId: number): Promise<Post>;
    pause(id: number, actorUserId: number, _reason?: string): Promise<Post>;
    archive(id: number, actorUserId: number, _reason?: string): Promise<Post>;
    remove(id: number, actorUserId: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
    private buildPostsQuery;
    private assertOwner;
    private assertPublishable;
    private assertPublishablePayload;
    private hasNonTerminalRent;
    private replaceAttributes;
    private replaceImages;
    private assertImagesBelongToOwner;
    private toPaginatedResponse;
}

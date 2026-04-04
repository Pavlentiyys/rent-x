import { Repository } from 'typeorm';
import { Rent } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
export declare class ReviewsService {
    private readonly reviewsRepository;
    private readonly rentsRepository;
    private readonly usersRepository;
    constructor(reviewsRepository: Repository<Review>, rentsRepository: Repository<Rent>, usersRepository: Repository<User>);
    create(dto: CreateReviewDto, authorId: number): Promise<Review>;
    findAll(): Promise<Review[]>;
    findOne(id: number): Promise<Review>;
    update(id: number, dto: UpdateReviewDto, actorUserId: number): Promise<Review>;
    remove(id: number, actorUserId: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
    private recalculateUserRating;
}

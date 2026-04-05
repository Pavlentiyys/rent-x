import { Repository } from 'typeorm';
import { Post } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateRentDto } from './dto/create-rent.dto';
import { RentEvent } from './entities/rent-event.entity';
import { Rent } from './entities/rent.entity';
export declare class RentsService {
    private readonly rentsRepository;
    private readonly rentEventsRepository;
    private readonly postsRepository;
    private readonly usersRepository;
    private readonly logger;
    constructor(rentsRepository: Repository<Rent>, rentEventsRepository: Repository<RentEvent>, postsRepository: Repository<Post>, usersRepository: Repository<User>);
    create(dto: CreateRentDto, renterId: number): Promise<Rent>;
    findAll(actorUserId: number): Promise<Rent[]>;
    findOne(id: number, actorUserId?: number): Promise<Rent>;
    approve(id: number, actorUserId: number): Promise<Rent>;
    reject(id: number, reason: string, actorUserId: number): Promise<Rent>;
    markPaid(id: number, actorUserId: number): Promise<Rent>;
    handover(id: number, actorUserId: number): Promise<Rent>;
    complete(id: number, actorUserId: number): Promise<Rent>;
    cancel(id: number, reason: string | undefined, actorUserId: number): Promise<Rent>;
    dispute(id: number, reason: string, actorUserId: number): Promise<Rent>;
    remove(id: number, actorUserId: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
    private transitionStatus;
    private assertStatus;
    private assertOwner;
    private assertRenter;
    private restorePostAvailabilityIfNeeded;
    private assertRentParticipant;
}

import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
export declare class UsersService {
    private readonly usersRepository;
    constructor(usersRepository: Repository<User>);
    create(createUserDto: CreateUserDto, actorWallet: string): Promise<User>;
    findAll(): Promise<User[]>;
    findOne(id: number): Promise<User>;
    update(id: number, updateUserDto: UpdateUserDto, actorUserId: number): Promise<User>;
    remove(id: number, actorUserId: number): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

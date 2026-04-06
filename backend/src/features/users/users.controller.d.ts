import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CurrentUserResponseDto, UserProfileResponseDto } from './serializers/user-response.serializer';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(currentUser: AuthenticatedUser): Promise<CurrentUserResponseDto>;
    findAll(): Promise<UserProfileResponseDto[]>;
    findOne(id: number): Promise<UserProfileResponseDto>;
    updateMe(updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser): Promise<CurrentUserResponseDto>;
    removeMe(currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser): Promise<UserProfileResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

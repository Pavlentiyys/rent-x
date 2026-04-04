import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    me(currentUser: AuthenticatedUser): Promise<import("./serializers/user-response.serializer").CurrentUserResponseDto>;
    findAll(): Promise<import("./serializers/user-response.serializer").UserProfileResponseDto[]>;
    findOne(id: number): Promise<import("./serializers/user-response.serializer").UserProfileResponseDto>;
    updateMe(updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser): Promise<import("./serializers/user-response.serializer").CurrentUserResponseDto>;
    removeMe(currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
    update(id: number, updateUserDto: UpdateUserDto, currentUser: AuthenticatedUser): Promise<import("./serializers/user-response.serializer").UserProfileResponseDto>;
    remove(id: number, currentUser: AuthenticatedUser): Promise<{
        id: number;
        deleted: boolean;
    }>;
}

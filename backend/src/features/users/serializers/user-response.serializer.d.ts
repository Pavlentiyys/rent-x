import { User } from '../entities/user.entity';
export declare class UserProfileResponseDto {
    id: number;
    username: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    bio: string | null;
    rating: number;
    reviewsCount: number;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
}
export declare class CurrentUserResponseDto extends UserProfileResponseDto {
    walletAddress: string;
}
export declare function serializeUserProfile(user: User): UserProfileResponseDto;
export declare function serializeCurrentUser(user: User): CurrentUserResponseDto;

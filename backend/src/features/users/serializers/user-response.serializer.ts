import { User } from '../entities/user.entity';

export class UserProfileResponseDto {
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

export class CurrentUserResponseDto extends UserProfileResponseDto {
  walletAddress: string;
}

export function serializeUserProfile(user: User): UserProfileResponseDto {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    rating: Number(user.rating),
    reviewsCount: user.reviewsCount,
    isVerified: user.isVerified,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export function serializeCurrentUser(user: User): CurrentUserResponseDto {
  return {
    ...serializeUserProfile(user),
    walletAddress: user.walletAddress,
  };
}

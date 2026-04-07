import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  walletAddress: string;

  @ApiPropertyOptional({ nullable: true })
  username: string | null;

  @ApiPropertyOptional({ nullable: true })
  displayName: string | null;

  @ApiPropertyOptional({ nullable: true })
  avatarUrl: string | null;

  @ApiPropertyOptional({ nullable: true })
  bio: string | null;

  @ApiPropertyOptional({ nullable: true })
  documentUrl: string | null;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewsCount: number;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class CurrentUserResponseDto extends UserProfileResponseDto {}

export function serializeUserProfile(user: User): UserProfileResponseDto {
  return {
    id: user.id,
    walletAddress: user.walletAddress,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    documentUrl: user.documentUrl,
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

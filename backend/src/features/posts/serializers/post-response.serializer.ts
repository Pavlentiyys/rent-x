import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { PostAttribute } from '../entities/post-attribute.entity';
import { PostImage } from '../entities/post-image.entity';
import { Post } from '../entities/post.entity';

export class PostAttributeResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  key: string;
  @ApiProperty()
  value: string;
  @ApiProperty()
  type: string;
}

export class PostImageResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  objectKey: string;
  @ApiProperty()
  url: string;
  @ApiProperty()
  sortOrder: number;
}

export class PostResponseDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  title: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  category: string;
  @ApiProperty()
  pricePerDay: string;
  @ApiProperty()
  depositAmount: string;
  @ApiProperty()
  currencyMint: string;
  @ApiPropertyOptional({ nullable: true })
  location: string | null;
  @ApiProperty()
  status: string;
  @ApiPropertyOptional({ nullable: true })
  availableFrom: string | null;
  @ApiPropertyOptional({ nullable: true })
  availableTo: string | null;
  @ApiPropertyOptional({ type: UserProfileResponseDto, nullable: true })
  owner: UserProfileResponseDto | null;

  @ApiProperty({ type: [PostAttributeResponseDto] })
  attributes: PostAttributeResponseDto[];

  @ApiProperty({ type: [PostImageResponseDto] })
  images: PostImageResponseDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class PaginatedPostsResponseDto {
  @ApiProperty({ type: [PostResponseDto] })
  items: PostResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export function serializePost(post: Post): PostResponseDto {
  return {
    id: post.id,
    title: post.title,
    description: post.description,
    category: post.category,
    pricePerDay: post.pricePerDay,
    depositAmount: post.depositAmount,
    currencyMint: post.currencyMint,
    location: post.location,
    status: post.status,
    availableFrom: post.availableFrom?.toISOString() ?? null,
    availableTo: post.availableTo?.toISOString() ?? null,
    owner: post.owner ? serializeUserProfile(post.owner) : null,
    attributes: [...(post.attributes ?? [])]
      .sort((a, b) => a.id - b.id)
      .map(serializePostAttribute),
    images: [...(post.images ?? [])]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id)
      .map(serializePostImage),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export function serializePaginatedPosts(result: {
  items: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}) {
  return {
    items: result.items.map(serializePost),
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  };
}

function serializePostAttribute(attribute: PostAttribute): PostAttributeResponseDto {
  return {
    id: attribute.id,
    key: attribute.key,
    value: attribute.value,
    type: attribute.type,
  };
}

function serializePostImage(image: PostImage): PostImageResponseDto {
  return {
    id: image.id,
    objectKey: image.objectKey,
    url: image.url,
    sortOrder: image.sortOrder,
  };
}

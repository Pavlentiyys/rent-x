import {
  serializeUserProfile,
  UserProfileResponseDto,
} from '../../users/serializers/user-response.serializer';
import { PostAttribute } from '../entities/post-attribute.entity';
import { PostImage } from '../entities/post-image.entity';
import { Post } from '../entities/post.entity';

export class PostAttributeResponseDto {
  id: number;
  key: string;
  value: string;
  type: string;
}

export class PostImageResponseDto {
  id: number;
  objectKey: string;
  url: string;
  sortOrder: number;
}

export class PostResponseDto {
  id: number;
  title: string;
  description: string;
  category: string;
  pricePerDay: string;
  depositAmount: string;
  currencyMint: string;
  location: string | null;
  status: string;
  availableFrom: string | null;
  availableTo: string | null;
  owner: UserProfileResponseDto | null;
  attributes: PostAttributeResponseDto[];
  images: PostImageResponseDto[];
  createdAt: string;
  updatedAt: string;
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

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Rent, RentStatus } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { SearchPostsDto } from './dto/search-posts.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostAttribute, PostAttributeType } from './entities/post-attribute.entity';
import { PostImage } from './entities/post-image.entity';
import { Post, PostStatus } from './entities/post.entity';

const NON_TERMINAL_RENT_STATUSES: RentStatus[] = [
  RentStatus.Pending,
  RentStatus.Approved,
  RentStatus.Paid,
  RentStatus.Active,
  RentStatus.Disputed,
];

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(PostAttribute)
    private readonly postAttributesRepository: Repository<PostAttribute>,
    @InjectRepository(PostImage)
    private readonly postImagesRepository: Repository<PostImage>,
    @InjectRepository(Rent)
    private readonly rentsRepository: Repository<Rent>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreatePostDto, ownerId: number) {
    const owner = await this.usersRepository.findOne({
      where: { id: ownerId },
    });

    if (!owner) {
      throw new NotFoundException(`Owner ${ownerId} not found`);
    }

    if (
      dto.availableFrom &&
      dto.availableTo &&
      new Date(dto.availableFrom) > new Date(dto.availableTo)
    ) {
      throw new ConflictException('availableFrom cannot be after availableTo');
    }

    this.assertImagesBelongToOwner(dto.images, ownerId);

    if (dto.status === PostStatus.Active) {
      this.assertPublishablePayload(dto);
    }

    const post = await this.postsRepository.save(
      this.postsRepository.create({
        ownerId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        pricePerDay: dto.pricePerDay,
        depositAmount: dto.depositAmount,
        currencyMint: dto.currencyMint,
        location: dto.location ?? null,
        status: dto.status ?? PostStatus.Draft,
        availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
        availableTo: dto.availableTo ? new Date(dto.availableTo) : null,
      }),
    );

    if (dto.attributes?.length) {
      const attributes = this.postAttributesRepository.create(
        dto.attributes.map((attribute) => ({
          postId: post.id,
          key: attribute.key,
          value: attribute.value,
          type: attribute.type as PostAttributeType,
        })),
      );

      await this.postAttributesRepository.save(attributes);
    }

    if (dto.images?.length) {
      const images = this.postImagesRepository.create(
        dto.images.map((image, index) => ({
          postId: post.id,
          objectKey: image.objectKey,
          url: image.url,
          sortOrder: image.sortOrder ?? index,
        })),
      );

      await this.postImagesRepository.save(images);
    }

    this.logger.log(
      JSON.stringify({
        event: 'post.created',
        postId: post.id,
        ownerId,
        status: post.status,
        category: post.category,
        pricePerDay: post.pricePerDay,
        depositAmount: post.depositAmount,
      }),
    );

    return this.findOne(post.id, ownerId);
  }

  async findAll(query: SearchPostsDto) {
    const qb = this.buildPostsQuery(query)
      .andWhere('post.status = :status', { status: PostStatus.Active })
    const [items, total] = await qb.getManyAndCount();

    return this.toPaginatedResponse(items, total, query);
  }

  async findMine(ownerId: number, query: SearchPostsDto) {
    const qb = this.buildPostsQuery(query)
      .andWhere('post.ownerId = :ownerId', { ownerId })
    const [items, total] = await qb.getManyAndCount();

    return this.toPaginatedResponse(items, total, query);
  }

  async findOne(id: number, actorUserId?: number) {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: {
        owner: true,
        attributes: true,
        images: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    if (post.status !== PostStatus.Active && post.ownerId !== actorUserId) {
      throw new NotFoundException(`Post ${id} not found`);
    }

    return post;
  }

  async update(id: number, dto: UpdatePostDto, actorUserId: number) {
    const post = await this.findOne(id);

    if (post.ownerId !== actorUserId) {
      throw new ForbiddenException('Only the post owner can update this post');
    }

    if (dto.availableFrom && dto.availableTo) {
      if (new Date(dto.availableFrom) > new Date(dto.availableTo)) {
        throw new ConflictException('availableFrom cannot be after availableTo');
      }
    }

    const nextAvailableFrom = dto.availableFrom
      ? new Date(dto.availableFrom)
      : post.availableFrom;
    const nextAvailableTo = dto.availableTo ? new Date(dto.availableTo) : post.availableTo;
    const nextPricePerDay = dto.pricePerDay ?? post.pricePerDay;
    const nextDepositAmount = dto.depositAmount ?? post.depositAmount;
    const nextImagesCount = dto.images ? dto.images.length : post.images.length;

    if (nextAvailableFrom && nextAvailableTo && nextAvailableFrom > nextAvailableTo) {
      throw new ConflictException('availableFrom cannot be after availableTo');
    }

    this.assertImagesBelongToOwner(dto.images, actorUserId);

    if (post.status === PostStatus.Active) {
      if (nextImagesCount === 0) {
        throw new ConflictException('Active posts must have at least one image');
      }

      if (Number(nextPricePerDay) <= 0) {
        throw new ConflictException('Active posts must have pricePerDay greater than zero');
      }

      if (Number(nextDepositAmount) < 0) {
        throw new ConflictException('depositAmount cannot be negative');
      }
    }

    this.postsRepository.merge(post, {
      title: dto.title,
      description: dto.description,
      category: dto.category,
      pricePerDay: dto.pricePerDay,
      depositAmount: dto.depositAmount,
      currencyMint: dto.currencyMint,
      location: dto.location,
      availableFrom: nextAvailableFrom,
      availableTo: nextAvailableTo,
    });

    await this.postsRepository.save(post);

    if (dto.attributes) {
      await this.replaceAttributes(id, dto.attributes);
    }

    if (dto.images) {
      await this.replaceImages(id, dto.images);
    }

    this.logger.log(
      JSON.stringify({
        event: 'post.updated',
        postId: post.id,
        actorUserId,
        status: post.status,
        title: post.title,
        category: post.category,
      }),
    );

    return this.findOne(id, actorUserId);
  }

  async publish(id: number, actorUserId: number) {
    const post = await this.findOne(id, actorUserId);
    this.assertOwner(post, actorUserId);

    if (post.status === PostStatus.Archived) {
      throw new ConflictException('Archived posts cannot be published directly');
    }

    this.assertPublishable(post);

    if (post.availableFrom && post.availableTo && post.availableFrom > post.availableTo) {
      throw new ConflictException('availableFrom cannot be after availableTo');
    }

    post.status = PostStatus.Active;
    await this.postsRepository.save(post);

    this.logger.log(
      JSON.stringify({
        event: 'post.published',
        postId: post.id,
        actorUserId,
        status: post.status,
      }),
    );

    return this.findOne(id, actorUserId);
  }

  async pause(id: number, actorUserId: number, _reason?: string) {
    const post = await this.findOne(id, actorUserId);
    this.assertOwner(post, actorUserId);

    if (await this.hasNonTerminalRent(post.id)) {
      throw new ConflictException('Post with active or pending rents cannot be paused');
    }

    post.status = PostStatus.Paused;
    await this.postsRepository.save(post);

    this.logger.log(
      JSON.stringify({
        event: 'post.paused',
        postId: post.id,
        actorUserId,
        reason: _reason ?? null,
      }),
    );

    return this.findOne(id, actorUserId);
  }

  async archive(id: number, actorUserId: number, _reason?: string) {
    const post = await this.findOne(id, actorUserId);
    this.assertOwner(post, actorUserId);

    if (await this.hasNonTerminalRent(post.id)) {
      throw new ConflictException('Post with active or pending rents cannot be archived');
    }

    post.status = PostStatus.Archived;
    await this.postsRepository.save(post);

    this.logger.log(
      JSON.stringify({
        event: 'post.archived',
        postId: post.id,
        actorUserId,
        reason: _reason ?? null,
      }),
    );

    return this.findOne(id, actorUserId);
  }

  async remove(id: number, actorUserId: number) {
    const post = await this.findOne(id, actorUserId);
    this.assertOwner(post, actorUserId);

    if (await this.hasNonTerminalRent(post.id)) {
      throw new ConflictException('Post with active or pending rents cannot be removed');
    }

    await this.postsRepository.remove(post);

    this.logger.log(
      JSON.stringify({
        event: 'post.deleted',
        postId: post.id,
        actorUserId,
        status: post.status,
      }),
    );

    return {
      id,
      deleted: true,
    };
  }

  private buildPostsQuery(query: SearchPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'DESC';
    const qb = this.postsRepository
      .createQueryBuilder('post')
      .distinct(true)
      .leftJoinAndSelect('post.owner', 'owner')
      .leftJoinAndSelect('post.attributes', 'attributes')
      .leftJoinAndSelect('post.images', 'images')
      .orderBy(`post.${sortBy}`, sortOrder)
      .addOrderBy('post.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.category) {
      qb.andWhere('post.category = :category', { category: query.category });
    }

    if (query.location) {
      qb.andWhere('LOWER(post.location) LIKE LOWER(:location)', {
        location: `%${query.location}%`,
      });
    }

    if (query.search) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('LOWER(post.title) LIKE LOWER(:search)', {
              search: `%${query.search}%`,
            })
            .orWhere('LOWER(post.description) LIKE LOWER(:search)', {
              search: `%${query.search}%`,
            });
        }),
      );
    }

    if (query.status) {
      qb.andWhere('post.status = :requestedStatus', {
        requestedStatus: query.status,
      });
    }

    if (query.minPricePerDay !== undefined) {
      qb.andWhere('post.pricePerDay >= :minPricePerDay', {
        minPricePerDay: query.minPricePerDay,
      });
    }

    if (query.maxPricePerDay !== undefined) {
      qb.andWhere('post.pricePerDay <= :maxPricePerDay', {
        maxPricePerDay: query.maxPricePerDay,
      });
    }

    if (query.availableFrom) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('post.availableFrom IS NULL')
            .orWhere('post.availableFrom <= :availableFrom', {
              availableFrom: query.availableFrom,
            });
        }),
      );
    }

    if (query.availableTo) {
      qb.andWhere(
        new Brackets((innerQb) => {
          innerQb
            .where('post.availableTo IS NULL')
            .orWhere('post.availableTo >= :availableTo', {
              availableTo: query.availableTo,
            });
        }),
      );
    }

    return qb;
  }

  private assertOwner(post: Post, actorUserId: number) {
    if (post.ownerId !== actorUserId) {
      throw new ForbiddenException('Only the post owner can modify this post');
    }
  }

  private assertPublishable(post: Post) {
    if (!post.images?.length) {
      throw new ConflictException('Post must have at least one image before publishing');
    }

    if (!post.title || !post.description || !post.category || !post.currencyMint) {
      throw new ConflictException('Post is missing required data for publishing');
    }

    if (Number(post.pricePerDay) <= 0) {
      throw new ConflictException('pricePerDay must be greater than zero to publish');
    }

    if (Number(post.depositAmount) < 0) {
      throw new ConflictException('depositAmount cannot be negative');
    }
  }

  private assertPublishablePayload(dto: CreatePostDto) {
    if (!dto.images?.length) {
      throw new ConflictException('Post must have at least one image before publishing');
    }

    if (Number(dto.pricePerDay) <= 0) {
      throw new ConflictException('pricePerDay must be greater than zero to publish');
    }

    if (Number(dto.depositAmount) < 0) {
      throw new ConflictException('depositAmount cannot be negative');
    }
  }

  private async hasNonTerminalRent(postId: number) {
    const count = await this.rentsRepository
      .createQueryBuilder('rent')
      .where('rent.postId = :postId', { postId })
      .andWhere('rent.status IN (:...statuses)', {
        statuses: NON_TERMINAL_RENT_STATUSES,
      })
      .getCount();

    return count > 0;
  }

  private async replaceAttributes(
    postId: number,
    attributes: CreatePostDto['attributes'],
  ) {
    await this.postAttributesRepository.delete({ postId });

    if (!attributes?.length) {
      return;
    }

    await this.postAttributesRepository.save(
      this.postAttributesRepository.create(
        attributes.map((attribute) => ({
          postId,
          key: attribute.key,
          value: attribute.value,
          type: attribute.type as PostAttributeType,
        })),
      ),
    );
  }

  private async replaceImages(postId: number, images: CreatePostDto['images']) {
    await this.postImagesRepository.delete({ postId });

    if (!images?.length) {
      return;
    }

    await this.postImagesRepository.save(
      this.postImagesRepository.create(
        images.map((image, index) => ({
          postId,
          objectKey: image.objectKey,
          url: image.url,
          sortOrder: image.sortOrder ?? index,
        })),
      ),
    );
  }

  private assertImagesBelongToOwner(
    images: CreatePostDto['images'] | UpdatePostDto['images'],
    ownerId: number,
  ) {
    if (!images?.length) {
      return;
    }

    const expectedPrefix = `posts/${ownerId}/`;

    for (const image of images) {
      if (!image.objectKey.startsWith(expectedPrefix)) {
        throw new ForbiddenException('Post images must be uploaded by the post owner');
      }
    }
  }

  private toPaginatedResponse(items: Post[], total: number, query: SearchPostsDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}

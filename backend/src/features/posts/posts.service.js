"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rent_entity_1 = require("../rents/entities/rent.entity");
const user_entity_1 = require("../users/entities/user.entity");
const post_attribute_entity_1 = require("./entities/post-attribute.entity");
const post_image_entity_1 = require("./entities/post-image.entity");
const post_entity_1 = require("./entities/post.entity");
const NON_TERMINAL_RENT_STATUSES = [
    rent_entity_1.RentStatus.Pending,
    rent_entity_1.RentStatus.Approved,
    rent_entity_1.RentStatus.Paid,
    rent_entity_1.RentStatus.Active,
    rent_entity_1.RentStatus.Disputed,
];
let PostsService = class PostsService {
    postsRepository;
    postAttributesRepository;
    postImagesRepository;
    rentsRepository;
    usersRepository;
    constructor(postsRepository, postAttributesRepository, postImagesRepository, rentsRepository, usersRepository) {
        this.postsRepository = postsRepository;
        this.postAttributesRepository = postAttributesRepository;
        this.postImagesRepository = postImagesRepository;
        this.rentsRepository = rentsRepository;
        this.usersRepository = usersRepository;
    }
    async create(dto, ownerId) {
        const owner = await this.usersRepository.findOne({
            where: { id: ownerId },
        });
        if (!owner) {
            throw new common_1.NotFoundException(`Owner ${ownerId} not found`);
        }
        if (dto.availableFrom &&
            dto.availableTo &&
            new Date(dto.availableFrom) > new Date(dto.availableTo)) {
            throw new common_1.ConflictException('availableFrom cannot be after availableTo');
        }
        this.assertImagesBelongToOwner(dto.images, ownerId);
        if (dto.status === post_entity_1.PostStatus.Active) {
            this.assertPublishablePayload(dto);
        }
        const post = await this.postsRepository.save(this.postsRepository.create({
            ownerId,
            title: dto.title,
            description: dto.description,
            category: dto.category,
            pricePerDay: dto.pricePerDay,
            depositAmount: dto.depositAmount,
            currencyMint: dto.currencyMint,
            location: dto.location ?? null,
            status: dto.status ?? post_entity_1.PostStatus.Draft,
            availableFrom: dto.availableFrom ? new Date(dto.availableFrom) : null,
            availableTo: dto.availableTo ? new Date(dto.availableTo) : null,
        }));
        if (dto.attributes?.length) {
            const attributes = this.postAttributesRepository.create(dto.attributes.map((attribute) => ({
                postId: post.id,
                key: attribute.key,
                value: attribute.value,
                type: attribute.type,
            })));
            await this.postAttributesRepository.save(attributes);
        }
        if (dto.images?.length) {
            const images = this.postImagesRepository.create(dto.images.map((image, index) => ({
                postId: post.id,
                objectKey: image.objectKey,
                url: image.url,
                sortOrder: image.sortOrder ?? index,
            })));
            await this.postImagesRepository.save(images);
        }
        return this.findOne(post.id, ownerId);
    }
    async findAll(query) {
        const qb = this.buildPostsQuery(query)
            .andWhere('post.status = :status', { status: post_entity_1.PostStatus.Active });
        const [items, total] = await qb.getManyAndCount();
        return this.toPaginatedResponse(items, total, query);
    }
    async findMine(ownerId, query) {
        const qb = this.buildPostsQuery(query)
            .andWhere('post.ownerId = :ownerId', { ownerId });
        const [items, total] = await qb.getManyAndCount();
        return this.toPaginatedResponse(items, total, query);
    }
    async findOne(id, actorUserId) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: {
                owner: true,
                attributes: true,
                images: true,
            },
        });
        if (!post) {
            throw new common_1.NotFoundException(`Post ${id} not found`);
        }
        if (post.status !== post_entity_1.PostStatus.Active && post.ownerId !== actorUserId) {
            throw new common_1.NotFoundException(`Post ${id} not found`);
        }
        return post;
    }
    async update(id, dto, actorUserId) {
        const post = await this.findOne(id);
        if (post.ownerId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the post owner can update this post');
        }
        if (dto.availableFrom && dto.availableTo) {
            if (new Date(dto.availableFrom) > new Date(dto.availableTo)) {
                throw new common_1.ConflictException('availableFrom cannot be after availableTo');
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
            throw new common_1.ConflictException('availableFrom cannot be after availableTo');
        }
        this.assertImagesBelongToOwner(dto.images, actorUserId);
        if (post.status === post_entity_1.PostStatus.Active) {
            if (nextImagesCount === 0) {
                throw new common_1.ConflictException('Active posts must have at least one image');
            }
            if (Number(nextPricePerDay) <= 0) {
                throw new common_1.ConflictException('Active posts must have pricePerDay greater than zero');
            }
            if (Number(nextDepositAmount) < 0) {
                throw new common_1.ConflictException('depositAmount cannot be negative');
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
        return this.findOne(id, actorUserId);
    }
    async publish(id, actorUserId) {
        const post = await this.findOne(id, actorUserId);
        this.assertOwner(post, actorUserId);
        if (post.status === post_entity_1.PostStatus.Archived) {
            throw new common_1.ConflictException('Archived posts cannot be published directly');
        }
        this.assertPublishable(post);
        if (post.availableFrom && post.availableTo && post.availableFrom > post.availableTo) {
            throw new common_1.ConflictException('availableFrom cannot be after availableTo');
        }
        post.status = post_entity_1.PostStatus.Active;
        await this.postsRepository.save(post);
        return this.findOne(id, actorUserId);
    }
    async pause(id, actorUserId, _reason) {
        const post = await this.findOne(id, actorUserId);
        this.assertOwner(post, actorUserId);
        if (await this.hasNonTerminalRent(post.id)) {
            throw new common_1.ConflictException('Post with active or pending rents cannot be paused');
        }
        post.status = post_entity_1.PostStatus.Paused;
        await this.postsRepository.save(post);
        return this.findOne(id, actorUserId);
    }
    async archive(id, actorUserId, _reason) {
        const post = await this.findOne(id, actorUserId);
        this.assertOwner(post, actorUserId);
        if (await this.hasNonTerminalRent(post.id)) {
            throw new common_1.ConflictException('Post with active or pending rents cannot be archived');
        }
        post.status = post_entity_1.PostStatus.Archived;
        await this.postsRepository.save(post);
        return this.findOne(id, actorUserId);
    }
    async remove(id, actorUserId) {
        const post = await this.findOne(id, actorUserId);
        this.assertOwner(post, actorUserId);
        if (await this.hasNonTerminalRent(post.id)) {
            throw new common_1.ConflictException('Post with active or pending rents cannot be removed');
        }
        await this.postsRepository.remove(post);
        return {
            id,
            deleted: true,
        };
    }
    buildPostsQuery(query) {
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
            qb.andWhere(new typeorm_2.Brackets((innerQb) => {
                innerQb
                    .where('LOWER(post.title) LIKE LOWER(:search)', {
                    search: `%${query.search}%`,
                })
                    .orWhere('LOWER(post.description) LIKE LOWER(:search)', {
                    search: `%${query.search}%`,
                });
            }));
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
            qb.andWhere(new typeorm_2.Brackets((innerQb) => {
                innerQb
                    .where('post.availableFrom IS NULL')
                    .orWhere('post.availableFrom <= :availableFrom', {
                    availableFrom: query.availableFrom,
                });
            }));
        }
        if (query.availableTo) {
            qb.andWhere(new typeorm_2.Brackets((innerQb) => {
                innerQb
                    .where('post.availableTo IS NULL')
                    .orWhere('post.availableTo >= :availableTo', {
                    availableTo: query.availableTo,
                });
            }));
        }
        return qb;
    }
    assertOwner(post, actorUserId) {
        if (post.ownerId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the post owner can modify this post');
        }
    }
    assertPublishable(post) {
        if (!post.images?.length) {
            throw new common_1.ConflictException('Post must have at least one image before publishing');
        }
        if (!post.title || !post.description || !post.category || !post.currencyMint) {
            throw new common_1.ConflictException('Post is missing required data for publishing');
        }
        if (Number(post.pricePerDay) <= 0) {
            throw new common_1.ConflictException('pricePerDay must be greater than zero to publish');
        }
        if (Number(post.depositAmount) < 0) {
            throw new common_1.ConflictException('depositAmount cannot be negative');
        }
    }
    assertPublishablePayload(dto) {
        if (!dto.images?.length) {
            throw new common_1.ConflictException('Post must have at least one image before publishing');
        }
        if (Number(dto.pricePerDay) <= 0) {
            throw new common_1.ConflictException('pricePerDay must be greater than zero to publish');
        }
        if (Number(dto.depositAmount) < 0) {
            throw new common_1.ConflictException('depositAmount cannot be negative');
        }
    }
    async hasNonTerminalRent(postId) {
        const count = await this.rentsRepository
            .createQueryBuilder('rent')
            .where('rent.postId = :postId', { postId })
            .andWhere('rent.status IN (:...statuses)', {
            statuses: NON_TERMINAL_RENT_STATUSES,
        })
            .getCount();
        return count > 0;
    }
    async replaceAttributes(postId, attributes) {
        await this.postAttributesRepository.delete({ postId });
        if (!attributes?.length) {
            return;
        }
        await this.postAttributesRepository.save(this.postAttributesRepository.create(attributes.map((attribute) => ({
            postId,
            key: attribute.key,
            value: attribute.value,
            type: attribute.type,
        }))));
    }
    async replaceImages(postId, images) {
        await this.postImagesRepository.delete({ postId });
        if (!images?.length) {
            return;
        }
        await this.postImagesRepository.save(this.postImagesRepository.create(images.map((image, index) => ({
            postId,
            objectKey: image.objectKey,
            url: image.url,
            sortOrder: image.sortOrder ?? index,
        }))));
    }
    assertImagesBelongToOwner(images, ownerId) {
        if (!images?.length) {
            return;
        }
        const expectedPrefix = `posts/${ownerId}/`;
        for (const image of images) {
            if (!image.objectKey.startsWith(expectedPrefix)) {
                throw new common_1.ForbiddenException('Post images must be uploaded by the post owner');
            }
        }
    }
    toPaginatedResponse(items, total, query) {
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
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(1, (0, typeorm_1.InjectRepository)(post_attribute_entity_1.PostAttribute)),
    __param(2, (0, typeorm_1.InjectRepository)(post_image_entity_1.PostImage)),
    __param(3, (0, typeorm_1.InjectRepository)(rent_entity_1.Rent)),
    __param(4, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], PostsService);
//# sourceMappingURL=posts.service.js.map
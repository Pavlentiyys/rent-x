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
var ReviewsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rent_entity_1 = require("../rents/entities/rent.entity");
const user_entity_1 = require("../users/entities/user.entity");
const review_entity_1 = require("./entities/review.entity");
let ReviewsService = ReviewsService_1 = class ReviewsService {
    reviewsRepository;
    rentsRepository;
    usersRepository;
    logger = new common_1.Logger(ReviewsService_1.name);
    constructor(reviewsRepository, rentsRepository, usersRepository) {
        this.reviewsRepository = reviewsRepository;
        this.rentsRepository = rentsRepository;
        this.usersRepository = usersRepository;
    }
    async create(dto, authorId) {
        const rent = await this.rentsRepository.findOne({ where: { id: dto.rentId } });
        if (!rent) {
            throw new common_1.NotFoundException(`Rent ${dto.rentId} not found`);
        }
        if (rent.status !== rent_entity_1.RentStatus.Completed) {
            throw new common_1.ConflictException('Review can only be created for completed rent');
        }
        const validPair = (authorId === rent.ownerId && dto.targetUserId === rent.renterId) ||
            (authorId === rent.renterId && dto.targetUserId === rent.ownerId);
        if (!validPair) {
            throw new common_1.ConflictException('Review author and target must be rent participants');
        }
        const existingReview = await this.reviewsRepository.findOne({
            where: {
                rentId: dto.rentId,
                authorId,
                targetUserId: dto.targetUserId,
            },
        });
        if (existingReview) {
            throw new common_1.ConflictException('Review for this rent side already exists');
        }
        const review = await this.reviewsRepository.save(this.reviewsRepository.create({
            rentId: dto.rentId,
            authorId,
            targetUserId: dto.targetUserId,
            postId: rent.postId,
            rating: dto.rating,
            comment: dto.comment ?? null,
        }));
        await this.recalculateUserRating(dto.targetUserId);
        this.logger.log(JSON.stringify({
            event: 'review.created',
            reviewId: review.id,
            rentId: review.rentId,
            postId: review.postId,
            authorId,
            targetUserId: review.targetUserId,
            rating: review.rating,
        }));
        return this.findOne(review.id);
    }
    findAll() {
        return this.reviewsRepository.find({
            relations: {
                rent: true,
                author: true,
                targetUser: true,
                post: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id) {
        const review = await this.reviewsRepository.findOne({
            where: { id },
            relations: {
                rent: true,
                author: true,
                targetUser: true,
                post: true,
            },
        });
        if (!review) {
            throw new common_1.NotFoundException(`Review ${id} not found`);
        }
        return review;
    }
    async update(id, dto, actorUserId) {
        const review = await this.findOne(id);
        if (review.authorId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the review author can update this review');
        }
        this.reviewsRepository.merge(review, {
            rating: dto.rating,
            comment: dto.comment,
        });
        await this.reviewsRepository.save(review);
        await this.recalculateUserRating(review.targetUserId);
        this.logger.log(JSON.stringify({
            event: 'review.updated',
            reviewId: review.id,
            actorUserId,
            targetUserId: review.targetUserId,
            rating: review.rating,
        }));
        return this.findOne(id);
    }
    async remove(id, actorUserId) {
        const review = await this.findOne(id);
        if (review.authorId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the review author can remove this review');
        }
        const targetUserId = review.targetUserId;
        await this.reviewsRepository.remove(review);
        await this.recalculateUserRating(targetUserId);
        this.logger.log(JSON.stringify({
            event: 'review.deleted',
            reviewId: review.id,
            actorUserId,
            targetUserId,
        }));
        return {
            id,
            deleted: true,
        };
    }
    async recalculateUserRating(userId) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException(`Target user ${userId} not found`);
        }
        const ratingStats = await this.reviewsRepository
            .createQueryBuilder('review')
            .select('COALESCE(AVG(review.rating), 0)', 'averageRating')
            .addSelect('COUNT(review.id)', 'reviewsCount')
            .where('review.targetUserId = :userId', { userId })
            .getRawOne();
        user.rating = Number(ratingStats?.averageRating ?? 0).toFixed(2);
        user.reviewsCount = Number(ratingStats?.reviewsCount ?? 0);
        await this.usersRepository.save(user);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = ReviewsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(rent_entity_1.Rent)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map
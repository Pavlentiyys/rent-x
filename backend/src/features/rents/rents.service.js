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
var RentsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const post_entity_1 = require("../posts/entities/post.entity");
const user_entity_1 = require("../users/entities/user.entity");
const rent_event_entity_1 = require("./entities/rent-event.entity");
const rent_entity_1 = require("./entities/rent.entity");
const ACTIVE_RENT_STATUSES = [
    rent_entity_1.RentStatus.Pending,
    rent_entity_1.RentStatus.Approved,
    rent_entity_1.RentStatus.Paid,
    rent_entity_1.RentStatus.Active,
    rent_entity_1.RentStatus.Disputed,
];
let RentsService = RentsService_1 = class RentsService {
    rentsRepository;
    rentEventsRepository;
    postsRepository;
    usersRepository;
    logger = new common_1.Logger(RentsService_1.name);
    constructor(rentsRepository, rentEventsRepository, postsRepository, usersRepository) {
        this.rentsRepository = rentsRepository;
        this.rentEventsRepository = rentEventsRepository;
        this.postsRepository = postsRepository;
        this.usersRepository = usersRepository;
    }
    async create(dto, renterId) {
        const [post, renter] = await Promise.all([
            this.postsRepository.findOne({ where: { id: dto.postId } }),
            this.usersRepository.findOne({ where: { id: renterId } }),
        ]);
        if (!post) {
            throw new common_1.NotFoundException(`Post ${dto.postId} not found`);
        }
        if (!renter) {
            throw new common_1.NotFoundException(`Renter ${renterId} not found`);
        }
        if (post.ownerId === renterId) {
            throw new common_1.BadRequestException('Owner cannot rent their own post');
        }
        if (post.status !== post_entity_1.PostStatus.Active) {
            throw new common_1.ConflictException('Post is not available for rent');
        }
        const startDate = new Date(dto.startDate);
        const endDate = new Date(dto.endDate);
        if (startDate > endDate) {
            throw new common_1.BadRequestException('startDate cannot be after endDate');
        }
        const overlappingRent = await this.rentsRepository
            .createQueryBuilder('rent')
            .where('rent.postId = :postId', { postId: dto.postId })
            .andWhere('rent.status IN (:...statuses)', { statuses: ACTIVE_RENT_STATUSES })
            .andWhere('rent.startDate <= :endDate', { endDate: dto.endDate })
            .andWhere('rent.endDate >= :startDate', { startDate: dto.startDate })
            .getOne();
        if (overlappingRent) {
            throw new common_1.ConflictException('Rent dates overlap with an active rent');
        }
        const millisecondsInDay = 24 * 60 * 60 * 1000;
        const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsInDay) + 1;
        const rentAmount = Number(post.pricePerDay) * daysCount;
        const depositAmount = Number(post.depositAmount);
        const totalAmount = rentAmount + depositAmount;
        const rent = await this.rentsRepository.save(this.rentsRepository.create({
            postId: post.id,
            ownerId: post.ownerId,
            renterId: renter.id,
            startDate: dto.startDate,
            endDate: dto.endDate,
            daysCount,
            pricePerDay: post.pricePerDay,
            rentAmount: rentAmount.toFixed(6),
            depositAmount: depositAmount.toFixed(6),
            platformFeeAmount: '0.000000',
            totalAmount: totalAmount.toFixed(6),
            currencyMint: post.currencyMint,
            status: rent_entity_1.RentStatus.Pending,
        }));
        await this.rentEventsRepository.save(this.rentEventsRepository.create({
            rentId: rent.id,
            type: 'rent.created',
            payload: {
                status: rent.status,
                startDate: rent.startDate,
                endDate: rent.endDate,
            },
        }));
        this.logger.log(JSON.stringify({
            event: 'rent.created',
            rentId: rent.id,
            postId: rent.postId,
            ownerId: rent.ownerId,
            renterId: rent.renterId,
            startDate: rent.startDate,
            endDate: rent.endDate,
            totalAmount: rent.totalAmount,
            currencyMint: rent.currencyMint,
        }));
        return this.findOne(rent.id, renterId);
    }
    findAll(actorUserId) {
        return this.rentsRepository.find({
            where: [
                { ownerId: actorUserId },
                { renterId: actorUserId },
            ],
            relations: {
                post: true,
                owner: true,
                renter: true,
                events: true,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }
    async findOne(id, actorUserId) {
        const rent = await this.rentsRepository.findOne({
            where: { id },
            relations: {
                post: true,
                owner: true,
                renter: true,
                events: true,
                reviews: true,
            },
        });
        if (!rent) {
            throw new common_1.NotFoundException(`Rent ${id} not found`);
        }
        if (actorUserId) {
            this.assertRentParticipant(rent, actorUserId);
        }
        return rent;
    }
    async approve(id, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertOwner(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Pending], 'Only pending rents can be approved');
        return this.transitionStatus(rent, rent_entity_1.RentStatus.Approved, actorUserId, 'rent.approved');
    }
    async reject(id, reason, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertOwner(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Pending], 'Only pending rents can be rejected');
        return this.transitionStatus(rent, rent_entity_1.RentStatus.Rejected, actorUserId, 'rent.rejected', { cancelReason: reason });
    }
    async markPaid(id, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertRenter(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Approved], 'Only approved rents can be marked as paid');
        if (!rent.paymentTxSignature) {
            throw new common_1.ConflictException('Verified rent payment transaction must be attached before marking as paid');
        }
        if (Number(rent.depositAmount) > 0 && !rent.depositTxSignature) {
            throw new common_1.ConflictException('Verified deposit transaction must be attached before marking as paid');
        }
        return this.transitionStatus(rent, rent_entity_1.RentStatus.Paid, actorUserId, 'rent.paid');
    }
    async handover(id, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertOwner(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Paid], 'Only paid rents can be handed over');
        const updatedRent = await this.transitionStatus(rent, rent_entity_1.RentStatus.Active, actorUserId, 'rent.handover_confirmed');
        await this.postsRepository.update(rent.postId, { status: post_entity_1.PostStatus.Rented });
        return updatedRent;
    }
    async complete(id, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertOwner(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Active, rent_entity_1.RentStatus.Disputed], 'Only active or disputed rents can be completed');
        const updatedRent = await this.transitionStatus(rent, rent_entity_1.RentStatus.Completed, actorUserId, 'rent.completed');
        await this.restorePostAvailabilityIfNeeded(rent.postId);
        return updatedRent;
    }
    async cancel(id, reason, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertRentParticipant(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Pending, rent_entity_1.RentStatus.Approved], 'Only pending or approved rents can be cancelled');
        const updatedRent = await this.transitionStatus(rent, rent_entity_1.RentStatus.Cancelled, actorUserId, 'rent.cancelled', {
            cancelReason: reason ?? rent.cancelReason,
        });
        await this.restorePostAvailabilityIfNeeded(rent.postId);
        return updatedRent;
    }
    async dispute(id, reason, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        this.assertRentParticipant(rent, actorUserId);
        this.assertStatus(rent, [rent_entity_1.RentStatus.Active], 'Only active rents can be disputed');
        return this.transitionStatus(rent, rent_entity_1.RentStatus.Disputed, actorUserId, 'rent.disputed', { cancelReason: reason });
    }
    async remove(id, actorUserId) {
        const rent = await this.findOne(id, actorUserId);
        if (![rent_entity_1.RentStatus.Pending, rent_entity_1.RentStatus.Rejected, rent_entity_1.RentStatus.Cancelled].includes(rent.status)) {
            throw new common_1.ConflictException('Only non-active rents can be removed');
        }
        await this.rentsRepository.remove(rent);
        this.logger.log(JSON.stringify({
            event: 'rent.deleted',
            rentId: rent.id,
            actorUserId,
            status: rent.status,
        }));
        return {
            id,
            deleted: true,
        };
    }
    async transitionStatus(rent, nextStatus, actorUserId, eventType, updates) {
        const previousStatus = rent.status;
        this.rentsRepository.merge(rent, {
            ...updates,
            status: nextStatus,
        });
        await this.rentsRepository.save(rent);
        await this.rentEventsRepository.save(this.rentEventsRepository.create({
            rentId: rent.id,
            type: eventType,
            payload: {
                actorUserId,
                previousStatus,
                nextStatus,
                cancelReason: updates?.cancelReason,
                paymentTxSignature: updates?.paymentTxSignature,
                depositTxSignature: updates?.depositTxSignature,
                returnTxSignature: updates?.returnTxSignature,
            },
        }));
        this.logger.log(JSON.stringify({
            event: eventType,
            rentId: rent.id,
            actorUserId,
            previousStatus,
            nextStatus,
            cancelReason: updates?.cancelReason ?? null,
            paymentTxSignature: updates?.paymentTxSignature ?? null,
            depositTxSignature: updates?.depositTxSignature ?? null,
            returnTxSignature: updates?.returnTxSignature ?? null,
        }));
        return this.findOne(rent.id, actorUserId);
    }
    assertStatus(rent, expected, message) {
        if (!expected.includes(rent.status)) {
            throw new common_1.ConflictException(message);
        }
    }
    assertOwner(rent, actorUserId) {
        if (rent.ownerId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the rent owner can perform this action');
        }
    }
    assertRenter(rent, actorUserId) {
        if (rent.renterId !== actorUserId) {
            throw new common_1.ForbiddenException('Only the renter can perform this action');
        }
    }
    async restorePostAvailabilityIfNeeded(postId) {
        const activeCount = await this.rentsRepository
            .createQueryBuilder('rent')
            .where('rent.postId = :postId', { postId })
            .andWhere('rent.status IN (:...statuses)', {
            statuses: [rent_entity_1.RentStatus.Active, rent_entity_1.RentStatus.Disputed],
        })
            .getCount();
        if (activeCount === 0) {
            const post = await this.postsRepository.findOne({ where: { id: postId } });
            if (post && post.status === post_entity_1.PostStatus.Rented) {
                post.status = post_entity_1.PostStatus.Active;
                await this.postsRepository.save(post);
            }
        }
    }
    assertRentParticipant(rent, actorUserId) {
        if (rent.ownerId !== actorUserId && rent.renterId !== actorUserId) {
            throw new common_1.ForbiddenException('Only rent participants can modify this rent');
        }
    }
};
exports.RentsService = RentsService;
exports.RentsService = RentsService = RentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rent_entity_1.Rent)),
    __param(1, (0, typeorm_1.InjectRepository)(rent_event_entity_1.RentEvent)),
    __param(2, (0, typeorm_1.InjectRepository)(post_entity_1.Post)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RentsService);
//# sourceMappingURL=rents.service.js.map
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreateRentDto } from './dto/create-rent.dto';
import { RentEvent } from './entities/rent-event.entity';
import { Rent, RentStatus } from './entities/rent.entity';

const ACTIVE_RENT_STATUSES: RentStatus[] = [
  RentStatus.Pending,
  RentStatus.Approved,
  RentStatus.Paid,
  RentStatus.Active,
  RentStatus.Disputed,
];

@Injectable()
export class RentsService {
  private readonly logger = new Logger(RentsService.name);

  constructor(
    @InjectRepository(Rent)
    private readonly rentsRepository: Repository<Rent>,
    @InjectRepository(RentEvent)
    private readonly rentEventsRepository: Repository<RentEvent>,
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateRentDto, renterId: number) {
    const [post, renter] = await Promise.all([
      this.postsRepository.findOne({ where: { id: dto.postId } }),
      this.usersRepository.findOne({ where: { id: renterId } }),
    ]);

    if (!post) {
      throw new NotFoundException(`Post ${dto.postId} not found`);
    }

    if (!renter) {
      throw new NotFoundException(`Renter ${renterId} not found`);
    }

    if (post.ownerId === renterId) {
      throw new BadRequestException('Owner cannot rent their own post');
    }

    if (post.status !== PostStatus.Active) {
      throw new ConflictException('Post is not available for rent');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (startDate > endDate) {
      throw new BadRequestException('startDate cannot be after endDate');
    }

    const overlappingRent = await this.rentsRepository
      .createQueryBuilder('rent')
      .where('rent.postId = :postId', { postId: dto.postId })
      .andWhere('rent.status IN (:...statuses)', { statuses: ACTIVE_RENT_STATUSES })
      .andWhere('rent.startDate <= :endDate', { endDate: dto.endDate })
      .andWhere('rent.endDate >= :startDate', { startDate: dto.startDate })
      .getOne();

    if (overlappingRent) {
      throw new ConflictException('Rent dates overlap with an active rent');
    }

    const millisecondsInDay = 24 * 60 * 60 * 1000;
    const daysCount = Math.floor((endDate.getTime() - startDate.getTime()) / millisecondsInDay) + 1;
    const rentAmount = Number(post.pricePerDay) * daysCount;
    const depositAmount = Number(post.depositAmount);
    const totalAmount = rentAmount + depositAmount;

    const rent = await this.rentsRepository.save(
      this.rentsRepository.create({
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
        status: RentStatus.Pending,
        paymentTxSignature: dto.paymentTxSignature ?? null,
      }),
    );

    await this.rentEventsRepository.save(
      this.rentEventsRepository.create({
        rentId: rent.id,
        type: 'rent.created',
        payload: {
          status: rent.status,
          startDate: rent.startDate,
          endDate: rent.endDate,
        },
      }),
    );

    this.logger.log(
      JSON.stringify({
        event: 'rent.created',
        rentId: rent.id,
        postId: rent.postId,
        ownerId: rent.ownerId,
        renterId: rent.renterId,
        startDate: rent.startDate,
        endDate: rent.endDate,
        totalAmount: rent.totalAmount,
        currencyMint: rent.currencyMint,
      }),
    );

    return this.findOne(rent.id, renterId);
  }

  findAll(actorUserId: number) {
    return this.rentsRepository.find({
      where: [
        { ownerId: actorUserId },
        { renterId: actorUserId },
      ],
      relations: {
        post: { images: true, owner: true },
        owner: true,
        renter: true,
        events: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: number, actorUserId?: number) {
    const rent = await this.rentsRepository.findOne({
      where: { id },
      relations: {
        post: { images: true, owner: true },
        owner: true,
        renter: true,
        events: true,
        reviews: true,
      },
    });

    if (!rent) {
      throw new NotFoundException(`Rent ${id} not found`);
    }

    if (actorUserId) {
      this.assertRentParticipant(rent, actorUserId);
    }

    return rent;
  }

  async approve(id: number, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertOwner(rent, actorUserId);
    this.assertStatus(rent, [RentStatus.Pending], 'Only pending rents can be approved');

    return this.transitionStatus(rent, RentStatus.Approved, actorUserId, 'rent.approved');
  }

  async reject(id: number, reason: string, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertOwner(rent, actorUserId);
    this.assertStatus(rent, [RentStatus.Pending], 'Only pending rents can be rejected');

    return this.transitionStatus(
      rent,
      RentStatus.Rejected,
      actorUserId,
      'rent.rejected',
      { cancelReason: reason },
    );
  }

  async markPaid(id: number, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertRenter(rent, actorUserId);
    this.assertStatus(rent, [RentStatus.Approved], 'Only approved rents can be marked as paid');

    if (!rent.paymentTxSignature) {
      throw new ConflictException(
        'Verified rent payment transaction must be attached before marking as paid',
      );
    }

    if (Number(rent.depositAmount) > 0 && !rent.depositTxSignature) {
      throw new ConflictException(
        'Verified deposit transaction must be attached before marking as paid',
      );
    }

    return this.transitionStatus(
      rent,
      RentStatus.Paid,
      actorUserId,
      'rent.paid',
    );
  }

  async handover(id: number, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertOwner(rent, actorUserId);
    this.assertStatus(
      rent,
      [RentStatus.Pending, RentStatus.Approved, RentStatus.Paid],
      'Only pending/approved/paid rents can be handed over',
    );

    const updatedRent = await this.transitionStatus(
      rent,
      RentStatus.Active,
      actorUserId,
      'rent.handover_confirmed',
    );

    await this.postsRepository.update(rent.postId, { status: PostStatus.Rented });
    return updatedRent;
  }

  async requestReturn(id: number, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertRenter(rent, actorUserId);
    this.assertStatus(rent, [RentStatus.Active], 'Only active rents can be returned');

    return this.transitionStatus(rent, RentStatus.ReturnRequested, actorUserId, 'rent.return_requested');
  }

  async complete(id: number, actorUserId: number, returnTxSignature?: string) {
    const rent = await this.findOne(id, actorUserId);
    this.assertOwner(rent, actorUserId);
    this.assertStatus(
      rent,
      [RentStatus.Active, RentStatus.ReturnRequested, RentStatus.Disputed],
      'Only active, return_requested or disputed rents can be completed',
    );

    const updatedRent = await this.transitionStatus(
      rent,
      RentStatus.Completed,
      actorUserId,
      'rent.completed',
      returnTxSignature ? { returnTxSignature } : undefined,
    );

    await this.restorePostAvailabilityIfNeeded(rent.postId);
    return updatedRent;
  }

  async cancel(id: number, reason: string | undefined, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertRentParticipant(rent, actorUserId);
    this.assertStatus(
      rent,
      [RentStatus.Pending, RentStatus.Approved],
      'Only pending or approved rents can be cancelled',
    );

    const updatedRent = await this.transitionStatus(
      rent,
      RentStatus.Cancelled,
      actorUserId,
      'rent.cancelled',
      {
        cancelReason: reason ?? rent.cancelReason,
      },
    );

    await this.restorePostAvailabilityIfNeeded(rent.postId);
    return updatedRent;
  }

  async dispute(id: number, reason: string, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);
    this.assertRentParticipant(rent, actorUserId);
    this.assertStatus(rent, [RentStatus.Active], 'Only active rents can be disputed');

    return this.transitionStatus(
      rent,
      RentStatus.Disputed,
      actorUserId,
      'rent.disputed',
      { cancelReason: reason },
    );
  }

  async remove(id: number, actorUserId: number) {
    const rent = await this.findOne(id, actorUserId);

    if (![RentStatus.Pending, RentStatus.Rejected, RentStatus.Cancelled].includes(rent.status)) {
      throw new ConflictException('Only non-active rents can be removed');
    }

    await this.rentsRepository.remove(rent);

    this.logger.log(
      JSON.stringify({
        event: 'rent.deleted',
        rentId: rent.id,
        actorUserId,
        status: rent.status,
      }),
    );

    return {
      id,
      deleted: true,
    };
  }

  private async transitionStatus(
    rent: Rent,
    nextStatus: RentStatus,
    actorUserId: number,
    eventType: string,
    updates?: Partial<Rent>,
  ) {
    const previousStatus = rent.status;

    this.rentsRepository.merge(rent, {
      ...updates,
      status: nextStatus,
    });

    await this.rentsRepository.save(rent);
    await this.rentEventsRepository.save(
      this.rentEventsRepository.create({
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
      }),
    );

    this.logger.log(
      JSON.stringify({
        event: eventType,
        rentId: rent.id,
        actorUserId,
        previousStatus,
        nextStatus,
        cancelReason: updates?.cancelReason ?? null,
        paymentTxSignature: updates?.paymentTxSignature ?? null,
        depositTxSignature: updates?.depositTxSignature ?? null,
        returnTxSignature: updates?.returnTxSignature ?? null,
      }),
    );

    return this.findOne(rent.id, actorUserId);
  }

  private assertStatus(rent: Rent, expected: RentStatus[], message: string) {
    if (!expected.includes(rent.status)) {
      throw new ConflictException(message);
    }
  }

  private assertOwner(rent: Rent, actorUserId: number) {
    if (rent.ownerId !== actorUserId) {
      throw new ForbiddenException('Only the rent owner can perform this action');
    }
  }

  private assertRenter(rent: Rent, actorUserId: number) {
    if (rent.renterId !== actorUserId) {
      throw new ForbiddenException('Only the renter can perform this action');
    }
  }

  private async restorePostAvailabilityIfNeeded(postId: number) {
    const activeCount = await this.rentsRepository
      .createQueryBuilder('rent')
      .where('rent.postId = :postId', { postId })
      .andWhere('rent.status IN (:...statuses)', {
        statuses: [RentStatus.Active, RentStatus.Disputed],
      })
      .getCount();

    if (activeCount === 0) {
      const post = await this.postsRepository.findOne({ where: { id: postId } });

      if (post && post.status === PostStatus.Rented) {
        post.status = PostStatus.Active;
        await this.postsRepository.save(post);
      }
    }
  }

  private assertRentParticipant(rent: Rent, actorUserId: number) {
    if (rent.ownerId !== actorUserId && rent.renterId !== actorUserId) {
      throw new ForbiddenException('Only rent participants can modify this rent');
    }
  }
}

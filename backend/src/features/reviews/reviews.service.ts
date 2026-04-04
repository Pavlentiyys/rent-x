import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rent, RentStatus } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,
    @InjectRepository(Rent)
    private readonly rentsRepository: Repository<Rent>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateReviewDto, authorId: number) {
    const rent = await this.rentsRepository.findOne({ where: { id: dto.rentId } });

    if (!rent) {
      throw new NotFoundException(`Rent ${dto.rentId} not found`);
    }

    if (rent.status !== RentStatus.Completed) {
      throw new ConflictException('Review can only be created for completed rent');
    }

    const validPair =
      (authorId === rent.ownerId && dto.targetUserId === rent.renterId) ||
      (authorId === rent.renterId && dto.targetUserId === rent.ownerId);

    if (!validPair) {
      throw new ConflictException('Review author and target must be rent participants');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        rentId: dto.rentId,
        authorId,
        targetUserId: dto.targetUserId,
      },
    });

    if (existingReview) {
      throw new ConflictException('Review for this rent side already exists');
    }

    const review = await this.reviewsRepository.save(
      this.reviewsRepository.create({
        rentId: dto.rentId,
        authorId,
        targetUserId: dto.targetUserId,
        postId: rent.postId,
        rating: dto.rating,
        comment: dto.comment ?? null,
      }),
    );

    await this.recalculateUserRating(dto.targetUserId);

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

  async findOne(id: number) {
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
      throw new NotFoundException(`Review ${id} not found`);
    }

    return review;
  }

  async update(id: number, dto: UpdateReviewDto, actorUserId: number) {
    const review = await this.findOne(id);

    if (review.authorId !== actorUserId) {
      throw new ForbiddenException('Only the review author can update this review');
    }

    this.reviewsRepository.merge(review, {
      rating: dto.rating,
      comment: dto.comment,
    });
    await this.reviewsRepository.save(review);

    await this.recalculateUserRating(review.targetUserId);
    return this.findOne(id);
  }

  async remove(id: number, actorUserId: number) {
    const review = await this.findOne(id);

    if (review.authorId !== actorUserId) {
      throw new ForbiddenException('Only the review author can remove this review');
    }

    const targetUserId = review.targetUserId;
    await this.reviewsRepository.remove(review);
    await this.recalculateUserRating(targetUserId);

    return {
      id,
      deleted: true,
    };
  }

  private async recalculateUserRating(userId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`Target user ${userId} not found`);
    }

    const ratingStats = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewsCount')
      .where('review.targetUserId = :userId', { userId })
      .getRawOne<{ averageRating: string; reviewsCount: string }>();

    user.rating = Number(ratingStats?.averageRating ?? 0).toFixed(2);
    user.reviewsCount = Number(ratingStats?.reviewsCount ?? 0);
    await this.usersRepository.save(user);
  }
}

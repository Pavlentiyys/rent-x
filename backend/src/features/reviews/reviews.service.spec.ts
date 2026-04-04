import { ConflictException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rent, RentStatus } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepositoryMock = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('ReviewsService', () => {
  let service: ReviewsService;
  let reviewsRepository: MockRepository<Review>;
  let rentsRepository: MockRepository<Rent>;
  let usersRepository: MockRepository<User>;

  beforeEach(() => {
    reviewsRepository = createRepositoryMock<Review>();
    rentsRepository = createRepositoryMock<Rent>();
    usersRepository = createRepositoryMock<User>();

    service = new ReviewsService(
      reviewsRepository as Repository<Review>,
      rentsRepository as Repository<Rent>,
      usersRepository as Repository<User>,
    );
  });

  it('recalculates target user rating after review creation', async () => {
    rentsRepository.findOne!.mockResolvedValue({
      id: 1,
      ownerId: 11,
      renterId: 22,
      postId: 33,
      status: RentStatus.Completed,
    });
    reviewsRepository.findOne!
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 7, authorId: 11, targetUserId: 22, postId: 33 });
    reviewsRepository.create!.mockImplementation((value) => value);
    reviewsRepository.save!.mockResolvedValue({ id: 7, targetUserId: 22 });
    usersRepository.findOne!.mockResolvedValue({
      id: 22,
      rating: '0.00',
      reviewsCount: 0,
    });
    reviewsRepository.createQueryBuilder!.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      getRawOne: jest.fn().mockResolvedValue({ averageRating: '4.50', reviewsCount: '2' }),
    });

    await service.create(
      {
        rentId: 1,
        targetUserId: 22,
        rating: 5,
        comment: 'Great renter',
      },
      11,
    );

    expect(usersRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 22,
        rating: '4.50',
        reviewsCount: 2,
      }),
    );
  });

  it('rejects review creation for non-completed rent', async () => {
    rentsRepository.findOne!.mockResolvedValue({
      id: 1,
      ownerId: 11,
      renterId: 22,
      postId: 33,
      status: RentStatus.Active,
    });

    await expect(
      service.create(
        {
          rentId: 1,
          targetUserId: 22,
          rating: 5,
        },
        11,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows only the author to update a review', async () => {
    reviewsRepository.findOne!.mockResolvedValue({
      id: 10,
      authorId: 5,
      targetUserId: 7,
      rating: 4,
      comment: 'Old comment',
    });

    await expect(
      service.update(10, { comment: 'Updated comment' }, 99),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });
});

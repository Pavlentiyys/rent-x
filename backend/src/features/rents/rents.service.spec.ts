import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { Post, PostStatus } from '../posts/entities/post.entity';
import { User } from '../users/entities/user.entity';
import { RentEvent } from './entities/rent-event.entity';
import { Rent, RentStatus } from './entities/rent.entity';
import { RentsService } from './rents.service';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepositoryMock = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  remove: jest.fn(),
  update: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('RentsService', () => {
  let service: RentsService;
  let rentsRepository: MockRepository<Rent>;
  let rentEventsRepository: MockRepository<RentEvent>;
  let postsRepository: MockRepository<Post>;
  let usersRepository: MockRepository<User>;

  beforeEach(() => {
    rentsRepository = createRepositoryMock<Rent>();
    rentEventsRepository = createRepositoryMock<RentEvent>();
    postsRepository = createRepositoryMock<Post>();
    usersRepository = createRepositoryMock<User>();

    service = new RentsService(
      rentsRepository as Repository<Rent>,
      rentEventsRepository as Repository<RentEvent>,
      postsRepository as Repository<Post>,
      usersRepository as Repository<User>,
    );
  });

  it('rejects renting your own post', async () => {
    postsRepository.findOne!.mockResolvedValue({
      id: 1,
      ownerId: 5,
      status: PostStatus.Active,
      pricePerDay: '10.000000',
      depositAmount: '5.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
    });
    usersRepository.findOne!.mockResolvedValue({ id: 5 });

    await expect(
      service.create(
        {
          postId: 1,
          startDate: '2026-04-10',
          endDate: '2026-04-12',
        },
        5,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects overlapping rents', async () => {
    postsRepository.findOne!.mockResolvedValue({
      id: 1,
      ownerId: 9,
      status: PostStatus.Active,
      pricePerDay: '10.000000',
      depositAmount: '5.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
    });
    usersRepository.findOne!.mockResolvedValue({ id: 5 });
    rentsRepository.createQueryBuilder!.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue({ id: 99 }),
    });

    await expect(
      service.create(
        {
          postId: 1,
          startDate: '2026-04-10',
          endDate: '2026-04-12',
        },
        5,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires verified transactions before mark-paid', async () => {
    rentsRepository.findOne!.mockResolvedValue({
      id: 7,
      ownerId: 1,
      renterId: 2,
      status: RentStatus.Approved,
      paymentTxSignature: null,
      depositTxSignature: null,
      depositAmount: '5.000000',
      events: [],
      reviews: [],
    });

    await expect(service.markPaid(7, 2)).rejects.toBeInstanceOf(ConflictException);
  });

  it('allows only owner to approve rent', async () => {
    rentsRepository.findOne!.mockResolvedValue({
      id: 8,
      ownerId: 10,
      renterId: 20,
      status: RentStatus.Pending,
      events: [],
      reviews: [],
    });

    await expect(service.approve(8, 20)).rejects.toBeInstanceOf(ForbiddenException);
  });
});

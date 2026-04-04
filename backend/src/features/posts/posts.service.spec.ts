import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Rent } from '../rents/entities/rent.entity';
import { User } from '../users/entities/user.entity';
import { PostStatus } from './entities/post.entity';
import { PostAttribute } from './entities/post-attribute.entity';
import { PostImage } from './entities/post-image.entity';
import { Post } from './entities/post.entity';
import { PostsService } from './posts.service';

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createRepositoryMock = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
});

describe('PostsService', () => {
  let service: PostsService;
  let postsRepository: MockRepository<Post>;
  let postAttributesRepository: MockRepository<PostAttribute>;
  let postImagesRepository: MockRepository<PostImage>;
  let rentsRepository: MockRepository<Rent>;
  let usersRepository: MockRepository<User>;

  beforeEach(() => {
    postsRepository = createRepositoryMock<Post>();
    postAttributesRepository = createRepositoryMock<PostAttribute>();
    postImagesRepository = createRepositoryMock<PostImage>();
    rentsRepository = createRepositoryMock<Rent>();
    usersRepository = createRepositoryMock<User>();

    service = new PostsService(
      postsRepository as Repository<Post>,
      postAttributesRepository as Repository<PostAttribute>,
      postImagesRepository as Repository<PostImage>,
      rentsRepository as Repository<Rent>,
      usersRepository as Repository<User>,
    );
  });

  it('rejects creating an active post without images', async () => {
    usersRepository.findOne!.mockResolvedValue({ id: 1 });

    await expect(
      service.create(
        {
          title: 'Camera',
          description: 'Mirrorless camera',
          category: 'electronics',
          pricePerDay: '10.000000',
          depositAmount: '5.000000',
          currencyMint: 'So11111111111111111111111111111111111111112',
          status: PostStatus.Active,
        },
        1,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects attaching images uploaded by another owner', async () => {
    usersRepository.findOne!.mockResolvedValue({ id: 1 });

    await expect(
      service.create(
        {
          title: 'Drill',
          description: 'Power drill',
          category: 'tools',
          pricePerDay: '12.000000',
          depositAmount: '0.000000',
          currencyMint: 'So11111111111111111111111111111111111111112',
          images: [
            {
              objectKey: 'posts/99/some-image.jpg',
              url: 'https://example.com/some-image.jpg',
            },
          ],
        },
        1,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('hides non-active posts from non-owners', async () => {
    postsRepository.findOne!.mockResolvedValue({
      id: 10,
      ownerId: 7,
      status: PostStatus.Draft,
      images: [],
    });

    await expect(service.findOne(10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('rejects publishing a post without images', async () => {
    postsRepository.findOne!.mockResolvedValue({
      id: 11,
      ownerId: 3,
      status: PostStatus.Draft,
      title: 'Bike',
      description: 'Road bike',
      category: 'transport',
      pricePerDay: '20.000000',
      depositAmount: '10.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
      images: [],
      availableFrom: null,
      availableTo: null,
    });

    await expect(service.publish(11, 3)).rejects.toBeInstanceOf(ConflictException);
  });
});

import { ConflictException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { DataType, newDb } from 'pg-mem';
import * as nacl from 'tweetnacl';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../features/auth/auth.service';
import { WalletSession } from '../features/auth/entities/wallet-session.entity';
import { PostAttribute } from '../features/posts/entities/post-attribute.entity';
import { PostImage } from '../features/posts/entities/post-image.entity';
import { Post, PostStatus } from '../features/posts/entities/post.entity';
import { PostsService } from '../features/posts/posts.service';
import { RentEvent } from '../features/rents/entities/rent-event.entity';
import { Rent } from '../features/rents/entities/rent.entity';
import { Review } from '../features/reviews/entities/review.entity';
import { User } from '../features/users/entities/user.entity';

describe('Posts and files integration', () => {
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let walletSessionsRepository: Repository<WalletSession>;
  let postsRepository: Repository<Post>;
  let postAttributesRepository: Repository<PostAttribute>;
  let postImagesRepository: Repository<PostImage>;
  let rentsRepository: Repository<Rent>;

  let authService: AuthService;
  let postsService: PostsService;

  beforeEach(async () => {
    const db = newDb({ autoCreateForeignKeyIndices: true });
    db.public.registerFunction({
      name: 'current_database',
      returns: DataType.text,
      implementation: () => 'rentx_test',
    });
    db.public.registerFunction({
      name: 'version',
      returns: DataType.text,
      implementation: () => 'PostgreSQL 16.0',
    });

    dataSource = await db.adapters
      .createTypeormDataSource({
        type: 'postgres',
        entities: [
          User,
          WalletSession,
          Post,
          PostAttribute,
          PostImage,
          Rent,
          RentEvent,
          Review,
        ],
        synchronize: true,
      })
      .initialize();

    usersRepository = dataSource.getRepository(User);
    walletSessionsRepository = dataSource.getRepository(WalletSession);
    postsRepository = dataSource.getRepository(Post);
    postAttributesRepository = dataSource.getRepository(PostAttribute);
    postImagesRepository = dataSource.getRepository(PostImage);
    rentsRepository = dataSource.getRepository(Rent);

    authService = new AuthService(
      new JwtService({ secret: 'test-secret' }),
      walletSessionsRepository,
      usersRepository,
    );
    postsService = new PostsService(
      postsRepository,
      postAttributesRepository,
      postImagesRepository,
      rentsRepository,
      usersRepository,
    );
  });

  afterEach(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('forbids creating a post with another user upload object key', async () => {
    const owner = await signIn(Keypair.generate());
    const anotherUser = await signIn(Keypair.generate());

    await expect(
      postsService.create(
        {
          title: 'Projector',
          description: 'Portable projector',
          category: 'electronics',
          pricePerDay: '8.000000',
          depositAmount: '20.000000',
          currencyMint: 'So11111111111111111111111111111111111111112',
          images: [
            {
              objectKey: `posts/${anotherUser.id}/projector.jpg`,
              url: 'https://files.example.com/projector.jpg',
            },
          ],
        },
        owner.id,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects publishing an archived post', async () => {
    const owner = await signIn(Keypair.generate());
    const createdPost = await postsService.create(
      {
        title: 'Tent',
        description: 'Camping tent',
        category: 'outdoor',
        pricePerDay: '9.000000',
        depositAmount: '15.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        images: [
          {
            objectKey: `posts/${owner.id}/tent.jpg`,
            url: 'https://files.example.com/tent.jpg',
          },
        ],
      },
      owner.id,
    );

    await postsService.archive(createdPost.id, owner.id);

    await expect(postsService.publish(createdPost.id, owner.id)).rejects.toBeInstanceOf(
      ConflictException,
    );
  });

  it('rejects creating an active post with non-positive price', async () => {
    const owner = await signIn(Keypair.generate());

    await expect(
      postsService.create(
        {
          title: 'Speaker',
          description: 'Bluetooth speaker',
          category: 'audio',
          pricePerDay: '0.000000',
          depositAmount: '10.000000',
          currencyMint: 'So11111111111111111111111111111111111111112',
          status: PostStatus.Active,
          images: [
            {
              objectKey: `posts/${owner.id}/speaker.jpg`,
              url: 'https://files.example.com/speaker.jpg',
            },
          ],
        },
        owner.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects updating an active post to remove all images', async () => {
    const owner = await signIn(Keypair.generate());
    const createdPost = await postsService.create(
      {
        title: 'Kayak',
        description: 'Inflatable kayak',
        category: 'sport',
        pricePerDay: '14.000000',
        depositAmount: '25.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        images: [
          {
            objectKey: `posts/${owner.id}/kayak.jpg`,
            url: 'https://files.example.com/kayak.jpg',
          },
        ],
      },
      owner.id,
    );

    await postsService.publish(createdPost.id, owner.id);

    await expect(
      postsService.update(
        createdPost.id,
        {
          images: [],
        },
        owner.id,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  async function signIn(keypair: Keypair) {
    const wallet = keypair.publicKey.toBase58();
    const { message } = await authService.generateSiwsMessage(wallet);
    const signature = bs58.encode(
      nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey),
    );

    await authService.verifySignature(wallet, message, signature);
    const user = await usersRepository.findOneOrFail({ where: { walletAddress: wallet } });

    return {
      id: user.id,
      wallet,
    };
  }
});

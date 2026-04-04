import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { newDb, DataType } from 'pg-mem';
import * as nacl from 'tweetnacl';
import { DataSource, Repository } from 'typeorm';
import { AuthService } from '../features/auth/auth.service';
import { WalletSession } from '../features/auth/entities/wallet-session.entity';
import { PaymentsService } from '../features/payments/payments.service';
import { PostAttribute } from '../features/posts/entities/post-attribute.entity';
import { PostImage } from '../features/posts/entities/post-image.entity';
import { Post, PostStatus } from '../features/posts/entities/post.entity';
import { PostsService } from '../features/posts/posts.service';
import { RentEvent } from '../features/rents/entities/rent-event.entity';
import { Rent, RentStatus } from '../features/rents/entities/rent.entity';
import { RentsService } from '../features/rents/rents.service';
import { Review } from '../features/reviews/entities/review.entity';
import { ReviewsService } from '../features/reviews/reviews.service';
import { User } from '../features/users/entities/user.entity';

describe('Rent flow integration', () => {
  let dataSource: DataSource;
  let usersRepository: Repository<User>;
  let postsRepository: Repository<Post>;
  let postAttributesRepository: Repository<PostAttribute>;
  let postImagesRepository: Repository<PostImage>;
  let rentsRepository: Repository<Rent>;
  let rentEventsRepository: Repository<RentEvent>;
  let reviewsRepository: Repository<Review>;
  let walletSessionsRepository: Repository<WalletSession>;

  let authService: AuthService;
  let postsService: PostsService;
  let rentsService: RentsService;
  let reviewsService: ReviewsService;
  let paymentsService: PaymentsService;

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
    postsRepository = dataSource.getRepository(Post);
    postAttributesRepository = dataSource.getRepository(PostAttribute);
    postImagesRepository = dataSource.getRepository(PostImage);
    rentsRepository = dataSource.getRepository(Rent);
    rentEventsRepository = dataSource.getRepository(RentEvent);
    reviewsRepository = dataSource.getRepository(Review);
    walletSessionsRepository = dataSource.getRepository(WalletSession);

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
    rentsService = new RentsService(
      rentsRepository,
      rentEventsRepository,
      postsRepository,
      usersRepository,
    );
    reviewsService = new ReviewsService(
      reviewsRepository,
      rentsRepository,
      usersRepository,
    );
    paymentsService = new PaymentsService(
      {
        get: (key: string, defaultValue?: string) => {
          if (key === 'SOLANA_RPC_URL') {
            return 'http://localhost:8899';
          }

          if (key === 'SOLANA_COMMITMENT') {
            return 'confirmed';
          }

          return defaultValue;
        },
      } as ConfigService,
      rentsService,
      rentsRepository,
      rentEventsRepository,
    );
  });

  afterEach(async () => {
    await dataSource.destroy();
  });

  it('executes the authenticated happy path from auth to completed rent and review', async () => {
    const ownerKeypair = Keypair.generate();
    const renterKeypair = Keypair.generate();

    const owner = await signIn(ownerKeypair);
    const renter = await signIn(renterKeypair);

    const createdPost = await postsService.create(
      {
        title: 'Sony A7 IV',
        description: 'Full-frame mirrorless camera',
        category: 'electronics',
        pricePerDay: '15.000000',
        depositAmount: '50.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        location: 'Berlin',
        images: [
          {
            objectKey: `posts/${owner.id}/camera-a7.jpg`,
            url: 'https://files.example.com/posts/camera-a7.jpg',
          },
        ],
        attributes: [
          {
            key: 'brand',
            value: 'Sony',
            type: 'string',
          },
        ],
      },
      owner.id,
    );

    const activePost = await postsService.publish(createdPost.id, owner.id);
    expect(activePost.status).toBe(PostStatus.Active);

    const createdRent = await rentsService.create(
      {
        postId: createdPost.id,
        startDate: '2026-04-15',
        endDate: '2026-04-17',
      },
      renter.id,
    );

    expect(createdRent.status).toBe(RentStatus.Pending);

    const approvedRent = await rentsService.approve(createdRent.id, owner.id);
    expect(approvedRent.status).toBe(RentStatus.Approved);

    mockParsedTransactions(
      paymentsService,
      new Map([
        [
          'rent-tx-signature-11111111111111111111111111111111',
          createParsedTransaction(renter.wallet),
        ],
        [
          'deposit-tx-signature-222222222222222222222222222222',
          createParsedTransaction(renter.wallet),
        ],
        [
          'return-tx-signature-3333333333333333333333333333333',
          createParsedTransaction(owner.wallet),
        ],
      ]),
    );

    const rentPayment = await paymentsService.verifyRentPayment(
      createdRent.id,
      'rent-tx-signature-11111111111111111111111111111111',
      renter.id,
      renter.wallet,
    );
    expect(rentPayment.rent.paymentTxSignature).toBe(
      'rent-tx-signature-11111111111111111111111111111111',
    );

    const depositPayment = await paymentsService.verifyDepositPayment(
      createdRent.id,
      'deposit-tx-signature-222222222222222222222222222222',
      renter.id,
      renter.wallet,
    );
    expect(depositPayment.rent.depositTxSignature).toBe(
      'deposit-tx-signature-222222222222222222222222222222',
    );

    const paidRent = await rentsService.markPaid(createdRent.id, renter.id);
    expect(paidRent.status).toBe(RentStatus.Paid);

    const activeRent = await rentsService.handover(createdRent.id, owner.id);
    expect(activeRent.status).toBe(RentStatus.Active);

    const returnPayment = await paymentsService.verifyReturnPayment(
      createdRent.id,
      'return-tx-signature-3333333333333333333333333333333',
      owner.id,
      owner.wallet,
    );
    expect(returnPayment.rent.returnTxSignature).toBe(
      'return-tx-signature-3333333333333333333333333333333',
    );

    const completedRent = await rentsService.complete(createdRent.id, owner.id);
    expect(completedRent.status).toBe(RentStatus.Completed);

    const completedPost = await postsRepository.findOneOrFail({
      where: { id: createdPost.id },
    });
    expect(completedPost.status).toBe(PostStatus.Active);

    const createdReview = await reviewsService.create(
      {
        rentId: createdRent.id,
        targetUserId: owner.id,
        rating: 5,
        comment: 'Smooth and reliable rental experience',
      },
      renter.id,
    );

    expect(createdReview.rating).toBe(5);

    const ratedOwner = await usersRepository.findOneOrFail({ where: { id: owner.id } });
    expect(Number(ratedOwner.rating)).toBe(5);
    expect(ratedOwner.reviewsCount).toBe(1);

    const events = await rentEventsRepository.find({
      where: { rentId: createdRent.id },
      order: { createdAt: 'ASC' },
    });
    expect(events.map((event) => event.type)).toEqual(
      expect.arrayContaining([
        'rent.created',
        'rent.approved',
        'payment.rent_verified',
        'payment.deposit_verified',
        'rent.paid',
        'rent.handover_confirmed',
        'payment.return_verified',
        'rent.completed',
      ]),
    );
  });

  it('rejects payment verification when authenticated wallet did not sign the transaction', async () => {
    const ownerKeypair = Keypair.generate();
    const renterKeypair = Keypair.generate();
    const outsiderKeypair = Keypair.generate();

    const owner = await signIn(ownerKeypair);
    const renter = await signIn(renterKeypair);
    const outsider = await signIn(outsiderKeypair);
    const { rent } = await createApprovedRent(owner.id, renter.id);

    mockParsedTransactions(
      paymentsService,
      new Map([
        [
          'rent-wrong-signer-1111111111111111111111111111111',
          createParsedTransaction(outsider.wallet),
        ],
      ]),
    );

    await expect(
      paymentsService.verifyRentPayment(
        rent.id,
        'rent-wrong-signer-1111111111111111111111111111111',
        renter.id,
        renter.wallet,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects reusing the same transaction signature across different rents', async () => {
    const ownerKeypair = Keypair.generate();
    const renterOneKeypair = Keypair.generate();
    const renterTwoKeypair = Keypair.generate();

    const owner = await signIn(ownerKeypair);
    const renterOne = await signIn(renterOneKeypair);
    const renterTwo = await signIn(renterTwoKeypair);

    const firstFlow = await createApprovedRent(owner.id, renterOne.id, {
      startDate: '2026-04-15',
      endDate: '2026-04-17',
      suffix: 'first',
    });
    const secondFlow = await createApprovedRent(owner.id, renterTwo.id, {
      startDate: '2026-04-20',
      endDate: '2026-04-22',
      suffix: 'second',
    });

    mockParsedTransactions(
      paymentsService,
      new Map([
        [
          'shared-signature-11111111111111111111111111111111',
          createParsedTransaction(renterOne.wallet),
        ],
      ]),
    );

    await paymentsService.verifyRentPayment(
      firstFlow.rent.id,
      'shared-signature-11111111111111111111111111111111',
      renterOne.id,
      renterOne.wallet,
    );

    mockParsedTransactions(
      paymentsService,
      new Map([
        [
          'shared-signature-11111111111111111111111111111111',
          createParsedTransaction(renterTwo.wallet),
        ],
      ]),
    );

    await expect(
      paymentsService.verifyRentPayment(
        secondFlow.rent.id,
        'shared-signature-11111111111111111111111111111111',
        renterTwo.id,
        renterTwo.wallet,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('forbids access to another user rent and review modification', async () => {
    const ownerKeypair = Keypair.generate();
    const renterKeypair = Keypair.generate();
    const outsiderKeypair = Keypair.generate();

    const owner = await signIn(ownerKeypair);
    const renter = await signIn(renterKeypair);
    const outsider = await signIn(outsiderKeypair);

    const { rent } = await createCompletedRent(owner, renter);

    await expect(rentsService.findOne(rent.id, outsider.id)).rejects.toBeInstanceOf(
      ForbiddenException,
    );

    const review = await reviewsService.create(
      {
        rentId: rent.id,
        targetUserId: owner.id,
        rating: 5,
        comment: 'Excellent owner',
      },
      renter.id,
    );

    await expect(
      reviewsService.update(review.id, { comment: 'Hijacked review' }, outsider.id),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  async function signIn(keypair: Keypair) {
    const wallet = keypair.publicKey.toBase58();
    const { message } = await authService.generateSiwsMessage(wallet);
    const signature = bs58.encode(
      nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey),
    );

    const { access_token } = await authService.verifySignature(wallet, message, signature);
    const user = await usersRepository.findOneOrFail({ where: { walletAddress: wallet } });

    return {
      id: user.id,
      wallet,
      accessToken: access_token,
    };
  }

  async function createApprovedRent(
    ownerId: number,
    renterId: number,
    options?: {
      startDate?: string;
      endDate?: string;
      suffix?: string;
    },
  ) {
    const createdPost = await postsService.create(
      {
        title: `Canon EOS ${options?.suffix ?? 'default'}`,
        description: 'Rental camera post',
        category: 'electronics',
        pricePerDay: '15.000000',
        depositAmount: '50.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        images: [
          {
            objectKey: `posts/${ownerId}/${options?.suffix ?? 'default'}-camera.jpg`,
            url: `https://files.example.com/${options?.suffix ?? 'default'}-camera.jpg`,
          },
        ],
      },
      ownerId,
    );

    await postsService.publish(createdPost.id, ownerId);
    const rent = await rentsService.create(
      {
        postId: createdPost.id,
        startDate: options?.startDate ?? '2026-04-15',
        endDate: options?.endDate ?? '2026-04-17',
      },
      renterId,
    );

    await rentsService.approve(rent.id, ownerId);

    return { post: createdPost, rent };
  }

  async function createCompletedRent(
    owner: { id: number; wallet: string },
    renter: { id: number; wallet: string },
  ) {
    const flow = await createApprovedRent(owner.id, renter.id, {
      suffix: 'completed',
      startDate: '2026-05-01',
      endDate: '2026-05-03',
    });

    mockParsedTransactions(
      paymentsService,
      new Map([
        ['completed-rent-tx-1111111111111111111111111111111', createParsedTransaction(renter.wallet)],
        ['completed-deposit-tx-22222222222222222222222222222', createParsedTransaction(renter.wallet)],
        ['completed-return-tx-333333333333333333333333333333', createParsedTransaction(owner.wallet)],
      ]),
    );

    await paymentsService.verifyRentPayment(
      flow.rent.id,
      'completed-rent-tx-1111111111111111111111111111111',
      renter.id,
      renter.wallet,
    );
    await paymentsService.verifyDepositPayment(
      flow.rent.id,
      'completed-deposit-tx-22222222222222222222222222222',
      renter.id,
      renter.wallet,
    );
    await rentsService.markPaid(flow.rent.id, renter.id);
    await rentsService.handover(flow.rent.id, owner.id);
    await paymentsService.verifyReturnPayment(
      flow.rent.id,
      'completed-return-tx-333333333333333333333333333333',
      owner.id,
      owner.wallet,
    );
    const completedRent = await rentsService.complete(flow.rent.id, owner.id);

    return {
      post: flow.post,
      rent: completedRent,
    };
  }
});

function mockParsedTransactions(
  paymentsService: PaymentsService,
  transactions: Map<string, ReturnType<typeof createParsedTransaction>>,
) {
  Object.defineProperty(paymentsService, 'connection', {
    value: {
      getParsedTransaction: jest.fn(async (signature: string) => {
        return transactions.get(signature) ?? null;
      }),
    },
    configurable: true,
  });
}

function createParsedTransaction(signerWallet: string) {
  return {
    slot: 123,
    blockTime: 1_744_000_000,
    meta: {
      err: null,
    },
    transaction: {
      message: {
        accountKeys: [
          {
            pubkey: new PublicKey(signerWallet),
            signer: true,
            writable: true,
          },
        ],
      },
    },
  } as const;
}

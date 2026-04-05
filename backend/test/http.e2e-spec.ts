import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Keypair, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import { DataType, newDb } from 'pg-mem';
import request from 'supertest';
import * as nacl from 'tweetnacl';
import { DataSource } from 'typeorm';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';
import { AuthModule } from '../src/features/auth/auth.module';
import { WalletSession } from '../src/features/auth/entities/wallet-session.entity';
import { FilesModule } from '../src/features/files/files.module';
import { FilesService } from '../src/features/files/files.service';
import { PaymentsModule } from '../src/features/payments/payments.module';
import { PaymentsService } from '../src/features/payments/payments.service';
import { PostsModule } from '../src/features/posts/posts.module';
import { PostAttribute } from '../src/features/posts/entities/post-attribute.entity';
import { PostImage } from '../src/features/posts/entities/post-image.entity';
import { Post } from '../src/features/posts/entities/post.entity';
import { RentEvent } from '../src/features/rents/entities/rent-event.entity';
import { Rent } from '../src/features/rents/entities/rent.entity';
import { RentsModule } from '../src/features/rents/rents.module';
import { Review } from '../src/features/reviews/entities/review.entity';
import { ReviewsModule } from '../src/features/reviews/reviews.module';
import { User } from '../src/features/users/entities/user.entity';
import { UsersModule } from '../src/features/users/users.module';
import { HealthModule } from '../src/health/health.module';

describe('HTTP API contracts (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let paymentsService: PaymentsService;

  beforeAll(async () => {
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

    const moduleBuilder = Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [
            () => ({
              JWT_SECRET: 'test-secret',
              JWT_EXPIRES_IN: '7d',
              FRONTEND_URL: 'http://localhost:3000',
              SOLANA_RPC_URL: 'http://localhost:8899',
              SOLANA_COMMITMENT: 'confirmed',
            }),
          ],
        }),
        TypeOrmModule.forRootAsync({
          useFactory: () => ({
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
          }),
          dataSourceFactory: async () => dataSource,
        }),
        AuthModule,
        FilesModule,
        PaymentsModule,
        UsersModule,
        PostsModule,
        RentsModule,
        ReviewsModule,
        HealthModule,
      ],
    });

    moduleBuilder.overrideProvider(FilesService).useValue({
      createUploadUrl: async (_dto: unknown, ownerId: number) => ({
        bucket: 'rentx',
        objectKey: `posts/${ownerId}/mock-upload.jpg`,
        uploadUrl: 'https://minio.example.com/upload',
        fileUrl: `https://cdn.example.com/posts/${ownerId}/mock-upload.jpg`,
        expiresInSeconds: 900,
        contentType: 'image/jpeg',
        size: 512000,
      }),
    });

    const moduleRef = await moduleBuilder.compile();

    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new HttpExceptionFilter());
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();
    paymentsService = app.get(PaymentsService);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }

    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  it('returns liveness health status', async () => {
    const response = await request(app.getHttpServer()).get('/health').expect(200);

    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'ok',
        timestamp: expect.any(String),
      }),
    );
  });

  it('returns standardized unauthorized error response', async () => {
    const response = await request(app.getHttpServer()).get('/auth/me').expect(401);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 401,
        error: 'Unauthorized',
        message: 'Unauthorized',
        path: '/auth/me',
        timestamp: expect.any(String),
      }),
    );
  });

  it('returns current user with wallet and public user without wallet', async () => {
    const { accessToken, userId } = await signInViaHttp();

    const meResponse = await request(app.getHttpServer())
      .get('/users/me')
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    expect(meResponse.body).toEqual(
      expect.objectContaining({
        id: userId,
        walletAddress: expect.any(String),
        isVerified: true,
      }),
    );

    const publicProfileResponse = await request(app.getHttpServer())
      .get(`/users/${userId}`)
      .expect(200);

    expect(publicProfileResponse.body).toEqual(
      expect.objectContaining({
        id: userId,
        isVerified: true,
      }),
    );
    expect(publicProfileResponse.body.walletAddress).toBeUndefined();
  });

  it('returns serialized post response without leaking owner wallet', async () => {
    const { accessToken, userId } = await signInViaHttp();

    const createPostResponse = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'DJI Mini 4 Pro',
        description: 'Compact drone for rent',
        category: 'electronics',
        pricePerDay: '12.000000',
        depositAmount: '40.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        images: [
          {
            objectKey: `posts/${userId}/drone.jpg`,
            url: `https://files.example.com/posts/${userId}/drone.jpg`,
          },
        ],
      })
      .expect(201);

    const publishResponse = await request(app.getHttpServer())
      .post(`/posts/${createPostResponse.body.id}/publish`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(201);

    expect(publishResponse.body).toEqual(
      expect.objectContaining({
        id: createPostResponse.body.id,
        status: 'active',
        owner: expect.objectContaining({
          id: createPostResponse.body.owner.id,
          isVerified: true,
        }),
      }),
    );
    expect(publishResponse.body.owner.walletAddress).toBeUndefined();
    expect(publishResponse.body.images).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          objectKey: `posts/${userId}/drone.jpg`,
        }),
      ]),
    );
  });

  it('returns standardized not found error for missing post', async () => {
    const response = await request(app.getHttpServer()).get('/posts/999999').expect(404);

    expect(response.body).toEqual(
      expect.objectContaining({
        statusCode: 404,
        error: 'Not Found',
        message: 'Post 999999 not found',
        path: '/posts/999999',
        timestamp: expect.any(String),
      }),
    );
  });

  it('returns upload url contract for files endpoint', async () => {
    const { accessToken, userId } = await signInViaHttp();

    const response = await request(app.getHttpServer())
      .post('/files/upload-url')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        fileName: 'camera.jpg',
        contentType: 'image/jpeg',
        size: 512000,
      })
      .expect(201);

    expect(response.body).toEqual(
      expect.objectContaining({
        bucket: 'rentx',
        objectKey: `posts/${userId}/mock-upload.jpg`,
        uploadUrl: expect.any(String),
        fileUrl: expect.any(String),
        expiresInSeconds: 900,
        contentType: 'image/jpeg',
        size: 512000,
      }),
    );
  });

  it('executes rent and payments HTTP flow with serialized responses', async () => {
    const owner = await signInViaHttp();
    const renter = await signInViaHttp();

    const createPostResponse = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .send({
        title: 'GoPro Hero',
        description: 'Action camera for rent',
        category: 'electronics',
        pricePerDay: '11.000000',
        depositAmount: '30.000000',
        currencyMint: 'So11111111111111111111111111111111111111112',
        images: [
          {
            objectKey: `posts/${owner.userId}/gopro.jpg`,
            url: `https://files.example.com/posts/${owner.userId}/gopro.jpg`,
          },
        ],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/posts/${createPostResponse.body.id}/publish`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(201);

    const createRentResponse = await request(app.getHttpServer())
      .post('/rents')
      .set('Authorization', `Bearer ${renter.accessToken}`)
      .send({
        postId: createPostResponse.body.id,
        startDate: '2026-04-15',
        endDate: '2026-04-17',
      })
      .expect(201);

    const rentId = createRentResponse.body.id;
    expect(createRentResponse.body).toEqual(
      expect.objectContaining({
        status: 'pending',
        owner: expect.objectContaining({ id: owner.userId }),
        renter: expect.objectContaining({ id: renter.userId }),
      }),
    );

    await request(app.getHttpServer())
      .post(`/rents/${rentId}/approve`)
      .set('Authorization', `Bearer ${owner.accessToken}`)
      .expect(201);

    mockParsedTransactions(
      paymentsService,
      new Map([
        [
          'http-rent-tx-11111111111111111111111111111111',
          createParsedTransaction(renter.wallet, {
            mint: 'So11111111111111111111111111111111111111112',
            amount: '33.000000',
          }),
        ],
        [
          'http-deposit-tx-222222222222222222222222222222',
          createParsedTransaction(renter.wallet, {
            mint: 'So11111111111111111111111111111111111111112',
            amount: '30.000000',
          }),
        ],
      ]),
    );

    const rentPaymentResponse = await request(app.getHttpServer())
      .post(`/payments/rents/${rentId}/rent`)
      .set('Authorization', `Bearer ${renter.accessToken}`)
      .send({ signature: 'http-rent-tx-11111111111111111111111111111111' })
      .expect(201);

    expect(rentPaymentResponse.body).toEqual(
      expect.objectContaining({
        rent: expect.objectContaining({
          id: rentId,
          paymentTxSignature: 'http-rent-tx-11111111111111111111111111111111',
        }),
        verification: expect.objectContaining({
          signature: 'http-rent-tx-11111111111111111111111111111111',
          signerWallets: expect.arrayContaining([renter.wallet]),
        }),
      }),
    );

    await request(app.getHttpServer())
      .post(`/payments/rents/${rentId}/deposit`)
      .set('Authorization', `Bearer ${renter.accessToken}`)
      .send({ signature: 'http-deposit-tx-222222222222222222222222222222' })
      .expect(201);

    const markPaidResponse = await request(app.getHttpServer())
      .post(`/rents/${rentId}/mark-paid`)
      .set('Authorization', `Bearer ${renter.accessToken}`)
      .expect(201);

    expect(markPaidResponse.body.status).toBe('paid');
  });

  async function signInViaHttp() {
    const keypair = Keypair.generate();
    const wallet = keypair.publicKey.toBase58();

    const messageResponse = await request(app.getHttpServer())
      .post('/auth/wallet/message')
      .send({ wallet })
      .expect(201);

    const signature = bs58.encode(
      nacl.sign.detached(
        new TextEncoder().encode(messageResponse.body.message),
        keypair.secretKey,
      ),
    );

    const verifyResponse = await request(app.getHttpServer())
      .post('/auth/wallet/verify')
      .send({
        wallet,
        message: messageResponse.body.message,
        signature,
      })
      .expect(201);

    const jwtService = new JwtService({ secret: 'test-secret' });
    const payload = jwtService.verify<{ sub: number }>(verifyResponse.body.access_token);

    return {
      accessToken: verifyResponse.body.access_token,
      userId: payload.sub,
      wallet,
    };
  }

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

  function createParsedTransaction(
    signerWallet: string,
    options?: { mint?: string; amount?: string },
  ) {
    return {
      slot: 123,
      blockTime: 1_744_000_000,
      meta: {
        err: null,
      },
      transaction: {
        message: {
          instructions: [
            {
              program: 'spl-token',
              parsed: {
                type: 'transferChecked',
                info: {
                  authority: signerWallet,
                  source: 'source-token-account',
                  destination: 'destination-token-account',
                  mint:
                    options?.mint ?? 'So11111111111111111111111111111111111111112',
                  tokenAmount: {
                    uiAmountString: options?.amount ?? '100.000000',
                  },
                },
              },
            },
          ],
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
});

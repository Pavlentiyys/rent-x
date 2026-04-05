import 'dotenv/config';
import 'reflect-metadata';
import { Keypair } from '@solana/web3.js';
import { DataSource, Repository } from 'typeorm';
import { WalletSession } from '../features/auth/entities/wallet-session.entity';
import { PostAttributeType } from '../features/posts/entities/post-attribute.entity';
import { PostAttribute } from '../features/posts/entities/post-attribute.entity';
import { PostImage } from '../features/posts/entities/post-image.entity';
import { Post, PostStatus } from '../features/posts/entities/post.entity';
import { RentEvent } from '../features/rents/entities/rent-event.entity';
import { Rent, RentStatus } from '../features/rents/entities/rent.entity';
import { Review } from '../features/reviews/entities/review.entity';
import { User } from '../features/users/entities/user.entity';

type SeedUser = {
  keypair: Keypair;
  user: User;
};

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: Number(process.env.DATABASE_PORT ?? '5432'),
    username: process.env.DATABASE_USER ?? 'rentx',
    password: process.env.DATABASE_PASSWORD ?? 'rentx',
    database: process.env.DATABASE_NAME ?? 'rentx',
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
  });

  await dataSource.initialize();

  try {
    await resetDatabase(dataSource);

    const users = await seedUsers(dataSource);
    const posts = await seedPosts(dataSource, users);
    const rents = await seedRents(dataSource, users, posts);
    await seedReviews(dataSource, rents);
    await recalculateRatings(dataSource);

    printSummary(users, posts.length, Object.keys(rents).length);
  } finally {
    await dataSource.destroy();
  }
}

async function resetDatabase(dataSource: DataSource) {
  await dataSource.getRepository(Review).createQueryBuilder().delete().execute();
  await dataSource.getRepository(RentEvent).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Rent).createQueryBuilder().delete().execute();
  await dataSource.getRepository(PostImage).createQueryBuilder().delete().execute();
  await dataSource.getRepository(PostAttribute).createQueryBuilder().delete().execute();
  await dataSource.getRepository(Post).createQueryBuilder().delete().execute();
  await dataSource.getRepository(WalletSession).createQueryBuilder().delete().execute();
  await dataSource.getRepository(User).createQueryBuilder().delete().execute();
}

async function seedUsers(dataSource: DataSource): Promise<Record<string, SeedUser>> {
  const usersRepository = dataSource.getRepository(User);

  const ownerAliceKeypair = Keypair.fromSeed(new Uint8Array(32).fill(1));
  const renterBobKeypair = Keypair.fromSeed(new Uint8Array(32).fill(2));
  const hybridCarolKeypair = Keypair.fromSeed(new Uint8Array(32).fill(3));

  const ownerAlice = await usersRepository.save(
    usersRepository.create({
      walletAddress: ownerAliceKeypair.publicKey.toBase58(),
      username: 'owner_alice',
      displayName: 'Alice Owner',
      avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=alice',
      bio: 'Photographer renting out camera gear in Berlin.',
      isVerified: true,
      rating: '0.00',
      reviewsCount: 0,
    }),
  );

  const renterBob = await usersRepository.save(
    usersRepository.create({
      walletAddress: renterBobKeypair.publicKey.toBase58(),
      username: 'renter_bob',
      displayName: 'Bob Renter',
      avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=bob',
      bio: 'Travels often and rents electronics and outdoor gear.',
      isVerified: true,
      rating: '0.00',
      reviewsCount: 0,
    }),
  );

  const hybridCarol = await usersRepository.save(
    usersRepository.create({
      walletAddress: hybridCarolKeypair.publicKey.toBase58(),
      username: 'hybrid_carol',
      displayName: 'Carol Hybrid',
      avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=carol',
      bio: 'Rents tools, sometimes borrows sports equipment.',
      isVerified: true,
      rating: '0.00',
      reviewsCount: 0,
    }),
  );

  return {
    ownerAlice: { keypair: ownerAliceKeypair, user: ownerAlice },
    renterBob: { keypair: renterBobKeypair, user: renterBob },
    hybridCarol: { keypair: hybridCarolKeypair, user: hybridCarol },
  };
}

async function seedPosts(
  dataSource: DataSource,
  users: Record<string, SeedUser>,
) {
  const postsRepository = dataSource.getRepository(Post);
  const postImagesRepository = dataSource.getRepository(PostImage);
  const postAttributesRepository = dataSource.getRepository(PostAttribute);

  const postSpecs = [
    {
      ownerId: users.ownerAlice.user.id,
      title: 'Sony A7 IV',
      description: 'Full-frame mirrorless camera with extra battery and lens.',
      category: 'electronics',
      pricePerDay: '15.000000',
      depositAmount: '50.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
      location: 'Berlin',
      status: PostStatus.Active,
      imageName: 'sony-a7-iv.jpg',
      attributes: [
        { key: 'brand', value: 'Sony', type: PostAttributeType.String },
        { key: 'sensor', value: 'full-frame', type: PostAttributeType.String },
      ],
    },
    {
      ownerId: users.hybridCarol.user.id,
      title: 'Makita Drill Set',
      description: 'Cordless drill with charger, batteries, and bits set.',
      category: 'tools',
      pricePerDay: '8.000000',
      depositAmount: '20.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
      location: 'Munich',
      status: PostStatus.Active,
      imageName: 'makita-drill.jpg',
      attributes: [
        { key: 'brand', value: 'Makita', type: PostAttributeType.String },
        { key: 'voltage', value: '18', type: PostAttributeType.Number },
      ],
    },
    {
      ownerId: users.ownerAlice.user.id,
      title: 'Camping Tent 3P',
      description: 'Three-person tent for weekend trips.',
      category: 'outdoor',
      pricePerDay: '6.000000',
      depositAmount: '15.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
      location: 'Hamburg',
      status: PostStatus.Active,
      imageName: 'camping-tent.jpg',
      attributes: [
        { key: 'capacity', value: '3', type: PostAttributeType.Number },
        { key: 'season', value: '3-season', type: PostAttributeType.String },
      ],
    },
    {
      ownerId: users.hybridCarol.user.id,
      title: 'Inflatable Kayak',
      description: 'Compact two-seat kayak with pump and paddles.',
      category: 'sport',
      pricePerDay: '12.000000',
      depositAmount: '35.000000',
      currencyMint: 'So11111111111111111111111111111111111111112',
      location: 'Cologne',
      status: PostStatus.Rented,
      imageName: 'inflatable-kayak.jpg',
      attributes: [
        { key: 'capacity', value: '2', type: PostAttributeType.Number },
        { key: 'portable', value: 'true', type: PostAttributeType.Boolean },
      ],
    },
  ];

  const posts: Post[] = [];

  for (const spec of postSpecs) {
    const post = await postsRepository.save(
      postsRepository.create({
        ownerId: spec.ownerId,
        title: spec.title,
        description: spec.description,
        category: spec.category,
        pricePerDay: spec.pricePerDay,
        depositAmount: spec.depositAmount,
        currencyMint: spec.currencyMint,
        location: spec.location,
        status: spec.status,
      }),
    );

    await postImagesRepository.save(
      postImagesRepository.create({
        postId: post.id,
        objectKey: `posts/${spec.ownerId}/${spec.imageName}`,
        url: `https://cdn.rentx.local/${spec.ownerId}/${spec.imageName}`,
        sortOrder: 0,
      }),
    );

    await postAttributesRepository.save(
      postAttributesRepository.create(
        spec.attributes.map((attribute) => ({
          postId: post.id,
          key: attribute.key,
          value: attribute.value,
          type: attribute.type,
        })),
      ),
    );

    posts.push(post);
  }

  return posts;
}

async function seedRents(
  dataSource: DataSource,
  users: Record<string, SeedUser>,
  posts: Post[],
) {
  const rentsRepository = dataSource.getRepository(Rent);
  const rentEventsRepository = dataSource.getRepository(RentEvent);

  const [cameraPost, drillPost, tentPost, kayakPost] = posts;

  const completedRent = await rentsRepository.save(
    rentsRepository.create({
      postId: tentPost.id,
      ownerId: users.ownerAlice.user.id,
      renterId: users.renterBob.user.id,
      startDate: '2026-04-01',
      endDate: '2026-04-03',
      daysCount: 3,
      pricePerDay: tentPost.pricePerDay,
      rentAmount: '18.000000',
      depositAmount: tentPost.depositAmount,
      platformFeeAmount: '0.000000',
      totalAmount: '33.000000',
      currencyMint: tentPost.currencyMint,
      paymentTxSignature: 'seed-completed-rent-payment-signature-1111111111111111111111111',
      depositTxSignature: 'seed-completed-deposit-signature-22222222222222222222222222',
      returnTxSignature: 'seed-completed-return-signature-333333333333333333333333333',
      status: RentStatus.Completed,
    }),
  );

  const pendingRent = await rentsRepository.save(
    rentsRepository.create({
      postId: drillPost.id,
      ownerId: users.hybridCarol.user.id,
      renterId: users.renterBob.user.id,
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      daysCount: 3,
      pricePerDay: drillPost.pricePerDay,
      rentAmount: '24.000000',
      depositAmount: drillPost.depositAmount,
      platformFeeAmount: '0.000000',
      totalAmount: '44.000000',
      currencyMint: drillPost.currencyMint,
      status: RentStatus.Pending,
    }),
  );

  const activeRent = await rentsRepository.save(
    rentsRepository.create({
      postId: kayakPost.id,
      ownerId: users.hybridCarol.user.id,
      renterId: users.ownerAlice.user.id,
      startDate: '2026-05-05',
      endDate: '2026-05-08',
      daysCount: 4,
      pricePerDay: kayakPost.pricePerDay,
      rentAmount: '48.000000',
      depositAmount: kayakPost.depositAmount,
      platformFeeAmount: '0.000000',
      totalAmount: '83.000000',
      currencyMint: kayakPost.currencyMint,
      paymentTxSignature: 'seed-active-rent-payment-signature-4444444444444444444444444444',
      depositTxSignature: 'seed-active-deposit-signature-55555555555555555555555555555',
      status: RentStatus.Active,
    }),
  );

  const approvedRent = await rentsRepository.save(
    rentsRepository.create({
      postId: cameraPost.id,
      ownerId: users.ownerAlice.user.id,
      renterId: users.hybridCarol.user.id,
      startDate: '2026-05-15',
      endDate: '2026-05-16',
      daysCount: 2,
      pricePerDay: cameraPost.pricePerDay,
      rentAmount: '30.000000',
      depositAmount: cameraPost.depositAmount,
      platformFeeAmount: '0.000000',
      totalAmount: '80.000000',
      currencyMint: cameraPost.currencyMint,
      status: RentStatus.Approved,
    }),
  );

  const events = [
    event(rentEventsRepository, completedRent.id, 'rent.created', {
      status: RentStatus.Pending,
    }),
    event(rentEventsRepository, completedRent.id, 'rent.approved', {
      previousStatus: RentStatus.Pending,
      nextStatus: RentStatus.Approved,
    }),
    event(rentEventsRepository, completedRent.id, 'payment.rent_verified', {
      field: 'paymentTxSignature',
    }),
    event(rentEventsRepository, completedRent.id, 'payment.deposit_verified', {
      field: 'depositTxSignature',
    }),
    event(rentEventsRepository, completedRent.id, 'rent.paid', {
      previousStatus: RentStatus.Approved,
      nextStatus: RentStatus.Paid,
    }),
    event(rentEventsRepository, completedRent.id, 'rent.handover_confirmed', {
      previousStatus: RentStatus.Paid,
      nextStatus: RentStatus.Active,
    }),
    event(rentEventsRepository, completedRent.id, 'payment.return_verified', {
      field: 'returnTxSignature',
    }),
    event(rentEventsRepository, completedRent.id, 'rent.completed', {
      previousStatus: RentStatus.Active,
      nextStatus: RentStatus.Completed,
    }),
    event(rentEventsRepository, pendingRent.id, 'rent.created', {
      status: RentStatus.Pending,
    }),
    event(rentEventsRepository, activeRent.id, 'rent.created', {
      status: RentStatus.Pending,
    }),
    event(rentEventsRepository, activeRent.id, 'rent.approved', {
      previousStatus: RentStatus.Pending,
      nextStatus: RentStatus.Approved,
    }),
    event(rentEventsRepository, activeRent.id, 'payment.rent_verified', {
      field: 'paymentTxSignature',
    }),
    event(rentEventsRepository, activeRent.id, 'payment.deposit_verified', {
      field: 'depositTxSignature',
    }),
    event(rentEventsRepository, activeRent.id, 'rent.paid', {
      previousStatus: RentStatus.Approved,
      nextStatus: RentStatus.Paid,
    }),
    event(rentEventsRepository, activeRent.id, 'rent.handover_confirmed', {
      previousStatus: RentStatus.Paid,
      nextStatus: RentStatus.Active,
    }),
    event(rentEventsRepository, approvedRent.id, 'rent.created', {
      status: RentStatus.Pending,
    }),
    event(rentEventsRepository, approvedRent.id, 'rent.approved', {
      previousStatus: RentStatus.Pending,
      nextStatus: RentStatus.Approved,
    }),
  ];

  await rentEventsRepository.save(events);

  return {
    completedRent,
    pendingRent,
    activeRent,
    approvedRent,
  };
}

async function seedReviews(
  dataSource: DataSource,
  rents: {
    completedRent: Rent;
  },
) {
  const reviewsRepository = dataSource.getRepository(Review);

  await reviewsRepository.save(
    reviewsRepository.create([
      {
        rentId: rents.completedRent.id,
        authorId: rents.completedRent.renterId,
        targetUserId: rents.completedRent.ownerId,
        postId: rents.completedRent.postId,
        rating: 5,
        comment: 'Excellent owner, item matched the listing.',
      },
      {
        rentId: rents.completedRent.id,
        authorId: rents.completedRent.ownerId,
        targetUserId: rents.completedRent.renterId,
        postId: rents.completedRent.postId,
        rating: 4,
        comment: 'Smooth pickup and return, would rent again.',
      },
    ]),
  );
}

async function recalculateRatings(dataSource: DataSource) {
  const usersRepository = dataSource.getRepository(User);
  const reviewsRepository = dataSource.getRepository(Review);
  const users = await usersRepository.find();

  for (const user of users) {
    const stats = await reviewsRepository
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating), 0)', 'averageRating')
      .addSelect('COUNT(review.id)', 'reviewsCount')
      .where('review.targetUserId = :userId', { userId: user.id })
      .getRawOne<{ averageRating: string; reviewsCount: string }>();

    user.rating = Number(stats?.averageRating ?? 0).toFixed(2);
    user.reviewsCount = Number(stats?.reviewsCount ?? 0);
    await usersRepository.save(user);
  }
}

function event(
  repository: Repository<RentEvent>,
  rentId: number,
  type: string,
  payload: Record<string, unknown>,
) {
  return repository.create({ rentId, type, payload });
}

function printSummary(
  users: Record<string, SeedUser>,
  postsCount: number,
  rentsCount: number,
) {
  const lines = [
    'Seed completed successfully.',
    `Users: ${Object.keys(users).length}`,
    `Posts: ${postsCount}`,
    `Rents: ${rentsCount}`,
    '',
    'Demo users:',
    `- owner_alice (${users.ownerAlice.user.walletAddress})`,
    `- renter_bob (${users.renterBob.user.walletAddress})`,
    `- hybrid_carol (${users.hybridCarol.user.walletAddress})`,
    '',
    'Helpful endpoints:',
    '- Swagger: http://localhost:3000/docs',
    '- Health: http://localhost:3000/health',
  ];

  console.log(lines.join('\n'));
}

void main().catch((error: unknown) => {
  console.error('Seed failed');
  console.error(error);
  process.exitCode = 1;
});

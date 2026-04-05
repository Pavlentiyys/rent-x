"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("reflect-metadata");
const web3_js_1 = require("@solana/web3.js");
const typeorm_1 = require("typeorm");
const wallet_session_entity_1 = require("../features/auth/entities/wallet-session.entity");
const post_attribute_entity_1 = require("../features/posts/entities/post-attribute.entity");
const post_attribute_entity_2 = require("../features/posts/entities/post-attribute.entity");
const post_image_entity_1 = require("../features/posts/entities/post-image.entity");
const post_entity_1 = require("../features/posts/entities/post.entity");
const rent_event_entity_1 = require("../features/rents/entities/rent-event.entity");
const rent_entity_1 = require("../features/rents/entities/rent.entity");
const review_entity_1 = require("../features/reviews/entities/review.entity");
const user_entity_1 = require("../features/users/entities/user.entity");
async function main() {
    const dataSource = new typeorm_1.DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST ?? 'localhost',
        port: Number(process.env.DATABASE_PORT ?? '5432'),
        username: process.env.DATABASE_USER ?? 'rentx',
        password: process.env.DATABASE_PASSWORD ?? 'rentx',
        database: process.env.DATABASE_NAME ?? 'rentx',
        entities: [
            user_entity_1.User,
            wallet_session_entity_1.WalletSession,
            post_entity_1.Post,
            post_attribute_entity_2.PostAttribute,
            post_image_entity_1.PostImage,
            rent_entity_1.Rent,
            rent_event_entity_1.RentEvent,
            review_entity_1.Review,
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
    }
    finally {
        await dataSource.destroy();
    }
}
async function resetDatabase(dataSource) {
    await dataSource.getRepository(review_entity_1.Review).createQueryBuilder().delete().execute();
    await dataSource.getRepository(rent_event_entity_1.RentEvent).createQueryBuilder().delete().execute();
    await dataSource.getRepository(rent_entity_1.Rent).createQueryBuilder().delete().execute();
    await dataSource.getRepository(post_image_entity_1.PostImage).createQueryBuilder().delete().execute();
    await dataSource.getRepository(post_attribute_entity_2.PostAttribute).createQueryBuilder().delete().execute();
    await dataSource.getRepository(post_entity_1.Post).createQueryBuilder().delete().execute();
    await dataSource.getRepository(wallet_session_entity_1.WalletSession).createQueryBuilder().delete().execute();
    await dataSource.getRepository(user_entity_1.User).createQueryBuilder().delete().execute();
}
async function seedUsers(dataSource) {
    const usersRepository = dataSource.getRepository(user_entity_1.User);
    const ownerAliceKeypair = web3_js_1.Keypair.fromSeed(new Uint8Array(32).fill(1));
    const renterBobKeypair = web3_js_1.Keypair.fromSeed(new Uint8Array(32).fill(2));
    const hybridCarolKeypair = web3_js_1.Keypair.fromSeed(new Uint8Array(32).fill(3));
    const ownerAlice = await usersRepository.save(usersRepository.create({
        walletAddress: ownerAliceKeypair.publicKey.toBase58(),
        username: 'owner_alice',
        displayName: 'Alice Owner',
        avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=alice',
        bio: 'Photographer renting out camera gear in Berlin.',
        isVerified: true,
        rating: '0.00',
        reviewsCount: 0,
    }));
    const renterBob = await usersRepository.save(usersRepository.create({
        walletAddress: renterBobKeypair.publicKey.toBase58(),
        username: 'renter_bob',
        displayName: 'Bob Renter',
        avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=bob',
        bio: 'Travels often and rents electronics and outdoor gear.',
        isVerified: true,
        rating: '0.00',
        reviewsCount: 0,
    }));
    const hybridCarol = await usersRepository.save(usersRepository.create({
        walletAddress: hybridCarolKeypair.publicKey.toBase58(),
        username: 'hybrid_carol',
        displayName: 'Carol Hybrid',
        avatarUrl: 'https://api.dicebear.com/9.x/identicon/svg?seed=carol',
        bio: 'Rents tools, sometimes borrows sports equipment.',
        isVerified: true,
        rating: '0.00',
        reviewsCount: 0,
    }));
    return {
        ownerAlice: { keypair: ownerAliceKeypair, user: ownerAlice },
        renterBob: { keypair: renterBobKeypair, user: renterBob },
        hybridCarol: { keypair: hybridCarolKeypair, user: hybridCarol },
    };
}
async function seedPosts(dataSource, users) {
    const postsRepository = dataSource.getRepository(post_entity_1.Post);
    const postImagesRepository = dataSource.getRepository(post_image_entity_1.PostImage);
    const postAttributesRepository = dataSource.getRepository(post_attribute_entity_2.PostAttribute);
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
            status: post_entity_1.PostStatus.Active,
            imageName: 'sony-a7-iv.jpg',
            attributes: [
                { key: 'brand', value: 'Sony', type: post_attribute_entity_1.PostAttributeType.String },
                { key: 'sensor', value: 'full-frame', type: post_attribute_entity_1.PostAttributeType.String },
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
            status: post_entity_1.PostStatus.Active,
            imageName: 'makita-drill.jpg',
            attributes: [
                { key: 'brand', value: 'Makita', type: post_attribute_entity_1.PostAttributeType.String },
                { key: 'voltage', value: '18', type: post_attribute_entity_1.PostAttributeType.Number },
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
            status: post_entity_1.PostStatus.Active,
            imageName: 'camping-tent.jpg',
            attributes: [
                { key: 'capacity', value: '3', type: post_attribute_entity_1.PostAttributeType.Number },
                { key: 'season', value: '3-season', type: post_attribute_entity_1.PostAttributeType.String },
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
            status: post_entity_1.PostStatus.Rented,
            imageName: 'inflatable-kayak.jpg',
            attributes: [
                { key: 'capacity', value: '2', type: post_attribute_entity_1.PostAttributeType.Number },
                { key: 'portable', value: 'true', type: post_attribute_entity_1.PostAttributeType.Boolean },
            ],
        },
    ];
    const posts = [];
    for (const spec of postSpecs) {
        const post = await postsRepository.save(postsRepository.create({
            ownerId: spec.ownerId,
            title: spec.title,
            description: spec.description,
            category: spec.category,
            pricePerDay: spec.pricePerDay,
            depositAmount: spec.depositAmount,
            currencyMint: spec.currencyMint,
            location: spec.location,
            status: spec.status,
        }));
        await postImagesRepository.save(postImagesRepository.create({
            postId: post.id,
            objectKey: `posts/${spec.ownerId}/${spec.imageName}`,
            url: `https://cdn.rentx.local/${spec.ownerId}/${spec.imageName}`,
            sortOrder: 0,
        }));
        await postAttributesRepository.save(postAttributesRepository.create(spec.attributes.map((attribute) => ({
            postId: post.id,
            key: attribute.key,
            value: attribute.value,
            type: attribute.type,
        }))));
        posts.push(post);
    }
    return posts;
}
async function seedRents(dataSource, users, posts) {
    const rentsRepository = dataSource.getRepository(rent_entity_1.Rent);
    const rentEventsRepository = dataSource.getRepository(rent_event_entity_1.RentEvent);
    const [cameraPost, drillPost, tentPost, kayakPost] = posts;
    const completedRent = await rentsRepository.save(rentsRepository.create({
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
        status: rent_entity_1.RentStatus.Completed,
    }));
    const pendingRent = await rentsRepository.save(rentsRepository.create({
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
        status: rent_entity_1.RentStatus.Pending,
    }));
    const activeRent = await rentsRepository.save(rentsRepository.create({
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
        status: rent_entity_1.RentStatus.Active,
    }));
    const approvedRent = await rentsRepository.save(rentsRepository.create({
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
        status: rent_entity_1.RentStatus.Approved,
    }));
    const events = [
        event(rentEventsRepository, completedRent.id, 'rent.created', {
            status: rent_entity_1.RentStatus.Pending,
        }),
        event(rentEventsRepository, completedRent.id, 'rent.approved', {
            previousStatus: rent_entity_1.RentStatus.Pending,
            nextStatus: rent_entity_1.RentStatus.Approved,
        }),
        event(rentEventsRepository, completedRent.id, 'payment.rent_verified', {
            field: 'paymentTxSignature',
        }),
        event(rentEventsRepository, completedRent.id, 'payment.deposit_verified', {
            field: 'depositTxSignature',
        }),
        event(rentEventsRepository, completedRent.id, 'rent.paid', {
            previousStatus: rent_entity_1.RentStatus.Approved,
            nextStatus: rent_entity_1.RentStatus.Paid,
        }),
        event(rentEventsRepository, completedRent.id, 'rent.handover_confirmed', {
            previousStatus: rent_entity_1.RentStatus.Paid,
            nextStatus: rent_entity_1.RentStatus.Active,
        }),
        event(rentEventsRepository, completedRent.id, 'payment.return_verified', {
            field: 'returnTxSignature',
        }),
        event(rentEventsRepository, completedRent.id, 'rent.completed', {
            previousStatus: rent_entity_1.RentStatus.Active,
            nextStatus: rent_entity_1.RentStatus.Completed,
        }),
        event(rentEventsRepository, pendingRent.id, 'rent.created', {
            status: rent_entity_1.RentStatus.Pending,
        }),
        event(rentEventsRepository, activeRent.id, 'rent.created', {
            status: rent_entity_1.RentStatus.Pending,
        }),
        event(rentEventsRepository, activeRent.id, 'rent.approved', {
            previousStatus: rent_entity_1.RentStatus.Pending,
            nextStatus: rent_entity_1.RentStatus.Approved,
        }),
        event(rentEventsRepository, activeRent.id, 'payment.rent_verified', {
            field: 'paymentTxSignature',
        }),
        event(rentEventsRepository, activeRent.id, 'payment.deposit_verified', {
            field: 'depositTxSignature',
        }),
        event(rentEventsRepository, activeRent.id, 'rent.paid', {
            previousStatus: rent_entity_1.RentStatus.Approved,
            nextStatus: rent_entity_1.RentStatus.Paid,
        }),
        event(rentEventsRepository, activeRent.id, 'rent.handover_confirmed', {
            previousStatus: rent_entity_1.RentStatus.Paid,
            nextStatus: rent_entity_1.RentStatus.Active,
        }),
        event(rentEventsRepository, approvedRent.id, 'rent.created', {
            status: rent_entity_1.RentStatus.Pending,
        }),
        event(rentEventsRepository, approvedRent.id, 'rent.approved', {
            previousStatus: rent_entity_1.RentStatus.Pending,
            nextStatus: rent_entity_1.RentStatus.Approved,
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
async function seedReviews(dataSource, rents) {
    const reviewsRepository = dataSource.getRepository(review_entity_1.Review);
    await reviewsRepository.save(reviewsRepository.create([
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
    ]));
}
async function recalculateRatings(dataSource) {
    const usersRepository = dataSource.getRepository(user_entity_1.User);
    const reviewsRepository = dataSource.getRepository(review_entity_1.Review);
    const users = await usersRepository.find();
    for (const user of users) {
        const stats = await reviewsRepository
            .createQueryBuilder('review')
            .select('COALESCE(AVG(review.rating), 0)', 'averageRating')
            .addSelect('COUNT(review.id)', 'reviewsCount')
            .where('review.targetUserId = :userId', { userId: user.id })
            .getRawOne();
        user.rating = Number(stats?.averageRating ?? 0).toFixed(2);
        user.reviewsCount = Number(stats?.reviewsCount ?? 0);
        await usersRepository.save(user);
    }
}
function event(repository, rentId, type, payload) {
    return repository.create({ rentId, type, payload });
}
function printSummary(users, postsCount, rentsCount) {
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
void main().catch((error) => {
    console.error('Seed failed');
    console.error(error);
    process.exitCode = 1;
});
//# sourceMappingURL=seed-dev.js.map
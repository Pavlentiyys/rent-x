# RentX Backend

NestJS backend for a Solana-based rental marketplace. The backend currently includes:

- SIWS-style Solana wallet auth with JWT
- public posts catalog with protected owner actions
- rent workflow and state machine
- review and rating logic
- payment verification via Solana RPC
- Minio presigned upload URLs
- Swagger docs and unified API error responses

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env
```

3. Start infrastructure:

```bash
docker compose up -d postgres minio
```

4. Start backend:

```bash
npm run start:dev
```

## Development seed

To populate local PostgreSQL with a demo scenario:

```bash
npm run seed:dev
```

The seed script will:

- recreate demo users
- create several posts with images and attributes
- create pending, approved, active and completed rents
- create sample reviews and recalculate ratings

It prints demo wallets and useful local URLs after completion.

## Useful URLs

- Swagger: `http://localhost:3000/docs`
- Health: `http://localhost:3000/health`
- Readiness: `http://localhost:3000/health/ready`
- Minio API: `http://localhost:9000`
- Minio Console: `http://localhost:9001`

## Scripts

```bash
npm run start:dev
npm run build
npm run test
npm run test:e2e
npm run seed:dev
```

## Tests

Run unit and integration tests:

```bash
npm test -- --runInBand
```

Run HTTP e2e tests:

```bash
npm run test:e2e -- --runInBand
```

## Notes

- The project currently relies on TypeORM `synchronize` for schema creation in local development.
- Payment verification checks Solana transaction success, signer, token mint, and transfer amount expectations.
- Upload flow uses Minio presigned PUT URLs.

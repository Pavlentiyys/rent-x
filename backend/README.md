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

## Quick API examples

Ready-to-run HTTP collection:

```text
examples/rentx.http
```

Generate SIWS message:

```bash
curl -X POST http://localhost:3000/auth/wallet/message \
  -H 'Content-Type: application/json' \
  -d '{"wallet":"<SOLANA_WALLET_ADDRESS>"}'
```

Verify SIWS signature and get JWT:

```bash
curl -X POST http://localhost:3000/auth/wallet/verify \
  -H 'Content-Type: application/json' \
  -d '{"wallet":"<SOLANA_WALLET_ADDRESS>","message":"<SIGNED_MESSAGE>","signature":"<BASE58_SIGNATURE>"}'
```

Create post:

```bash
curl -X POST http://localhost:3000/posts \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{
    "title":"Sony A7 IV",
    "description":"Full-frame mirrorless camera",
    "category":"electronics",
    "pricePerDay":"15.000000",
    "depositAmount":"50.000000",
    "currencyMint":"So11111111111111111111111111111111111111112",
    "images":[{"objectKey":"posts/<USER_ID>/sony-a7.jpg","url":"https://files.example.com/posts/<USER_ID>/sony-a7.jpg"}]
  }'
```

Publish post:

```bash
curl -X POST http://localhost:3000/posts/<POST_ID>/publish \
  -H 'Authorization: Bearer <JWT>'
```

Create rent request:

```bash
curl -X POST http://localhost:3000/rents \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"postId":<POST_ID>,"startDate":"2026-04-15","endDate":"2026-04-17"}'
```

Get Minio upload URL:

```bash
curl -X POST http://localhost:3000/files/upload-url \
  -H 'Authorization: Bearer <JWT>' \
  -H 'Content-Type: application/json' \
  -d '{"fileName":"camera.jpg","contentType":"image/jpeg","size":524288}'
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

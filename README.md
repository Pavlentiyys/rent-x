# RentX

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-0.32.0-FFA500)
![Rust](https://img.shields.io/badge/Rust-1.83+-orange?logo=rust&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs&logoColor=white)
![Status](https://img.shields.io/badge/status-live%20on%20devnet-brightgreen)

> Decentralized peer-to-peer rental marketplace built on Solana blockchain

**Live:** [rent-x-sol.vercel.app](https://rent-x-sol.vercel.app)

---

## Problem

Рынок краткосрочной аренды физических вещей — электроники, инструментов, спортивного оборудования — работает через посредников. Это создаёт три системные проблемы:

**Риск мошенничества.** Арендатор платит залог наличными — ничто не гарантирует его возврат. Владелец отдаёт вещь — ничто не гарантирует оплату.

**Непрозрачность.** Условия аренды фиксируются в мессенджере. Нет проверяемой репутации, нет защиты при споре.

**Высокие издержки.** Платформы берут 15–30% комиссии. Микроаренда становится экономически нецелесообразной.

## Solution

RentX переносит логику доверия на блокчейн Solana:

- **KYC on-chain** — верификация записывается в `UserProfile` PDA. Статус контрагента проверяем без третьей стороны.
- **Escrow без посредника** — залог и оплата блокируются в `RentalAgreement` PDA. Только смарт-контракт управляет распределением.
- **Автоматический расчёт** — при подтверждении возврата контракт мгновенно отправляет залог арендатору и оплату владельцу.
- **Репутация как актив** — каждая завершённая аренда инкрементирует `total_rentals` в профиле on-chain.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS |
| Backend | NestJS 10, PostgreSQL, TypeORM |
| File Storage | Supabase S3 (presigned URLs) |
| Smart Contract | Rust + Anchor 0.32 |
| Blockchain | Solana Devnet |
| Wallet | Phantom (Wallet Standard), Solflare |
| Web3 Client | @coral-xyz/anchor, @solana/wallet-adapter |
| Deployment | Vercel (frontend), Railway (backend + DB) |

---

## Project Structure

```
rentx/
├── frontend/               # Next.js app
│   └── src/
│       ├── app/            # Pages: /, /marketplace, /listing/[id], /dashboard,
│       │                   #        /create-listing, /edit-listing/[id], /admin, /faq
│       ├── components/     # Header, WalletContext, Catalog, SolanaProviders
│       └── lib/
│           ├── api-client.ts      # REST API calls
│           └── anchor-client.ts   # Anchor on-chain calls
├── backend/                # NestJS API
│   └── src/
│       └── features/
│           ├── auth/       # SIWS (Sign-In with Solana) JWT auth
│           ├── users/      # User profiles
│           ├── posts/      # Listings (CRUD)
│           ├── rents/      # Rental flow state machine
│           ├── files/      # Presigned upload URLs → Supabase S3
│           └── reviews/    # Post-rental reviews
├── programs/               # Anchor workspace
│   └── rentx/src/
│       ├── state/
│       │   ├── user_profile.rs
│       │   ├── rental_listing.rs
│       │   └── rental_agreement.rs
│       └── instructions/
│           ├── initialize_user.rs
│           ├── verify_user.rs
│           ├── create_listing.rs
│           ├── rent_item.rs
│           └── return_item.rs
└── tests/                  # TypeScript integration tests
```

---

### Instructions

| Instruction | Description |
|-------------|-------------|
| `initialize_user` | Creates `UserProfile` PDA for wallet |
| `verify_user` | Marks user as KYC-verified (platform only) |
| `create_listing` | Creates `RentalListing` PDA with price/deposit |
| `rent_item` | Locks `price × days + deposit` in `RentalAgreement` escrow |
| `return_item` | Distributes escrow: deposit → renter, payment → owner |

---

## User Flow

```
1. Connect Phantom wallet
        ↓
2. SIWS authentication → JWT token issued by backend
        ↓
3. Browse marketplace → View listing detail page
        ↓
4. Select rental duration (1–30 days) → Click "Rent"
        ↓
5. On-chain: rent_item locks (price × days + deposit) SOL in escrow
   Backend: rental record created with tx signature
        ↓
6. Owner sees "Hand over" button in dashboard → marks as Active
        ↓
7. Renter sees owner's contact info (Telegram/WhatsApp)
   Renter clicks "Return item" → status: return_requested
        ↓
8. Owner confirms return → on-chain return_item
   Deposit returned to renter | Payment released to owner
```

---

## Rental Status Machine

```
pending → active → return_requested → completed
       ↘ rejected
       ↘ cancelled
       → disputed → completed
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- Rust + Cargo
- Solana CLI 2.x
- Anchor CLI 0.32

### Local Development

```bash
git clone https://github.com/Pavlentiyys/rent-x.git
cd rent-x

# Backend
cd backend
cp .env.example .env   # fill in DB and S3 credentials
yarn install
yarn start:dev         # runs on :8000

# Frontend
cd ../frontend
yarn install
# set NEXT_PUBLIC_API_URL=http://localhost:8000 in .env.local
yarn dev               # runs on :3000
```

### Environment Variables

**Backend** (`.env`):
```env
PORT=8000
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=rentx
DATABASE_USER=rentx
DATABASE_PASSWORD=rentx
JWT_SECRET=your-secret
S3_ENDPOINT=https://<project>.storage.supabase.co/storage/v1/s3
S3_REGION=ap-south-1
S3_ACCESS_KEY=...
S3_SECRET_KEY=...
S3_BUCKET=rentx
S3_PUBLIC_URL=https://<project>.supabase.co/storage/v1/object/public/rentx
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

### Running Smart Contract Tests

```bash
cd programs
anchor test -- --features test-mode
```

### Deploy Program to Devnet

```bash
cd programs
anchor build --features test-mode
anchor deploy --provider.cluster devnet
```

---

## Deployment

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | [rent-x-sol.vercel.app](https://rent-x-sol.vercel.app) |
| Backend | Railway | talented-vision-production-4aa8.up.railway.app |
| Database | Railway PostgreSQL | — |
| File Storage | Supabase S3 | — |
| Program | Solana Devnet | `H8dxbPQhNTmDiJwpJPGeJ3QnA8zaYsYGHv1yumysws8k` |

---

## Why Solana?

| Критерий | Solana | Ethereum | BNB Chain |
|----------|--------|----------|-----------|
| Скорость подтверждения | ~400 мс | 12–60 с | 3–5 с |
| Комиссия за транзакцию | ~$0.00025 | $1–50+ | $0.05–0.5 |
| Пропускная способность | 65 000 TPS | ~15 TPS | ~100 TPS |

PDA как нативный escrow, микроплатежи без потерь, Phantom с понятным UX — всё это делает Solana единственным разумным выбором для P2P аренды.

---

## Hackathon

Built for **Decentrathon — National Solana Hackathon 2025**
Case: Tokenization of Real-World Assets on Solana

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT — see [LICENSE](LICENSE).

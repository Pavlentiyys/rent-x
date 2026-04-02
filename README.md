# RentX 🔑

> Decentralized fast rental platform built on Solana blockchain

RentX — Web 3.0 платформа быстрой аренды на блокчейне Solana. Пользователь проходит верификацию один раз, выбирает товар, подписывает транзакцию кошельком — и аренда оформлена. Залог блокируется в escrow смарт-контракта и возвращается автоматически при возврате товара.

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS + PostgreSQL |
| Smart Contract | Rust + Anchor Framework |
| Blockchain | Solana (Devnet / Mainnet-beta) |
| Wallet | Phantom, Backpack, Solflare |
| Web3 Client | @solana/web3.js + @coral-xyz/anchor |

---

## 📁 Project Structure

```
rentx/
├── frontend/          # Next.js app
│   ├── app/
│   ├── components/
│   └── lib/
├── backend/           # NestJS API
│   ├── src/
│   │   ├── users/
│   │   ├── listings/
│   │   └── rentals/
│   └── prisma/
└── program/           # Rust Anchor smart contract
    ├── programs/
    │   └── rentx/
    │       └── src/
    │           └── lib.rs
    └── tests/
```

---

## ⚙️ Smart Contract

### Accounts

```rust
// User verification status
UserProfile PDA {
    is_verified: bool,
    verified_at: i64,
    total_rentals: u32,
}

// Rental item listing
RentalListing PDA {
    owner: Pubkey,
    item_name: String,
    price_per_day: u64,   // in lamports (SOL)
    deposit_amount: u64,  // in lamports (SOL)
    is_available: bool,
}

// Active rental agreement
RentalAgreement PDA {
    renter: Pubkey,
    listing: Pubkey,
    start_time: i64,
    end_time: i64,
    deposit_vault: Pubkey,
    status: RentalStatus,  // Active | Completed | Disputed
}
```

### Instructions

| Instruction | Description |
|------------|-------------|
| `initialize_user` | Create user profile on-chain |
| `verify_user` | Platform sets `is_verified = true` |
| `create_listing` | Owner adds item to catalog |
| `rent_item` | Renter locks deposit in escrow |
| `return_item` | Operator confirms return, deposit released |

---

## 🛠️ Getting Started

### Prerequisites

- Node.js >= 18
- Rust + Cargo
- Solana CLI
- Anchor CLI
- PostgreSQL

### Installation

```bash
# Clone the repo
git clone https://github.com/your-username/rentx.git
cd rentx

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Build Anchor program
cd ../program && anchor build
```

### Environment Variables

**frontend/.env.local**
```env
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_PROGRAM_ID=YOUR_PROGRAM_ID
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**backend/.env**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/rentx
SOLANA_RPC_URL=https://api.devnet.solana.com
PROGRAM_ID=YOUR_PROGRAM_ID
OPERATOR_KEYPAIR_PATH=./keypair.json
```

### Running Locally

```bash
# Start local Solana validator
solana-test-validator

# Deploy program to devnet
cd program && anchor deploy --provider.cluster devnet

# Start backend
cd backend && npm run start:dev

# Start frontend
cd frontend && npm run dev
```

---

## 🔄 User Flow

```
1. Connect Phantom wallet (Sign-In with Solana)
        ↓
2. Upload documents → KYC verification → is_verified = true (on-chain)
        ↓
3. Browse catalog → Select item → View price in SOL + deposit
        ↓
4. Click "Rent" → Confirm transaction in Phantom
        ↓
5. Deposit + payment locked in RentalAgreement escrow
        ↓
6. Visit pickup point → Operator signs with their wallet
        ↓
7. Return item → Operator calls return_item
        ↓
8. Deposit auto-returned to renter ✅  |  Payment sent to owner ✅
```

---

## 🌐 Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway / Render |
| Database | Supabase / Railway PostgreSQL |
| Program | Solana Devnet → Mainnet-beta |

---

## 🏆 Hackathon

Built for **Decentrathon — National Solana Hackathon 2025**
Case: Tokenization of Real-World Assets on Solana

---

## 📄 License

MIT
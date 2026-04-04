# RentX

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Solana](https://img.shields.io/badge/Solana-Devnet-9945FF?logo=solana&logoColor=white)
![Anchor](https://img.shields.io/badge/Anchor-0.32.0-FFA500)
![Rust](https://img.shields.io/badge/Rust-1.83+-orange?logo=rust&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-18-green?logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/status-in%20development-yellow)

> Decentralized fast rental platform built on Solana blockchain

## Problem

Рынок краткосрочной аренды физических вещей — электроники, инструментов, спортивного оборудования — работает через посредников: агрегаторы, арендные сервисы, доски объявлений. Это создаёт три системные проблемы:

**Риск мошенничества.** Арендатор платит залог наличными или переводом — и ничто не гарантирует его возврат. Владелец отдаёт вещь — и ничто не гарантирует оплату. Стороны вынуждены доверять незнакомцу или дорогостоящему посреднику.

**Непрозрачность.** Условия аренды фиксируются в мессенджере или на бумаге. Нет единой истории операций, нет проверяемой репутации участников, нет защиты при споре.

**Высокие издержки.** Платформы-посредники берут 15–30% комиссии. Эквайринг, страховка, call-центр — всё это ложится в цену и делает микроаренду экономически нецелесообразной.

## Solution

RentX переносит логику доверия на блокчейн Solana. Смарт-контракт заменяет посредника:

- **KYC on-chain** — верификация проходится один раз и записывается в `UserProfile` PDA. Любой участник рынка может проверить статус контрагента без обращения к третьей стороне.
- **Escrow без посредника** — при аренде залог и оплата блокируются в `RentalAgreement` PDA. Деньги недоступны ни арендатору, ни владельцу до завершения сделки — только смарт-контракт управляет их распределением.
- **Автоматический расчёт** — при подтверждении возврата контракт мгновенно отправляет залог арендатору и оплату владельцу. Без ручных переводов, без задержек, без споров о "я уже отправил".
- **Репутация как актив** — каждая завершённая аренда инкрементирует `total_rentals` в профиле. Репутация накапливается on-chain и не принадлежит платформе.

---

## Why Solana?

Аренда — это транзакционно насыщенный бизнес: каждый листинг, каждая бронь, каждый возврат залога — отдельная операция. Выбор блокчейна здесь критичен.

| Критерий | Solana | Ethereum | BNB Chain |
|----------|--------|----------|-----------|
| Скорость подтверждения | ~400 мс | 12–60 с | 3–5 с |
| Комиссия за транзакцию | ~$0.00025 | $1–50+ | $0.05–0.5 |
| Пропускная способность | 65 000 TPS | ~15 TPS | ~100 TPS |
| Стоимость аккаунта (rent) | ~0.002 SOL | — | — |
| Экосистема DeFi / NFT | Высокая | Очень высокая | Средняя |

**Конкретные причины для RentX:**

- **Мгновенные транзакции** — пользователь подписывает аренду и видит подтверждение быстрее, чем открывается следующий экран. На Ethereum ждать 30+ секунд неприемлемо для кассового сценария.
- **Микроплатежи без потерь** — залог 0.5 SOL и оплата за 1 день аренды — это реальные суммы. Комиссия $0.00025 не съедает маржу. На Ethereum комиссия может превышать стоимость аренды.
- **PDA как нативный escrow** — Program Derived Addresses позволяют держать залог прямо на адресе смарт-контракта без оракулов и внешних мультисигов. Это встроено в архитектуру Solana, а не надстройка.
- **Низкий порог входа для пользователя** — Phantom, Backpack, Solflare — кошельки с понятным UX. Solana Pay позволит в будущем принимать оплату QR-кодом прямо на точке выдачи.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router) |
| Backend | NestJS + PostgreSQL |
| Smart Contract | Rust + Anchor 0.32 |
| Blockchain | Solana (Devnet / Localnet) |
| Wallet | Phantom, Backpack, Solflare |
| Web3 Client | @solana/kit + @coral-xyz/anchor |

---

## Project Structure

```
rentx/
├── frontend/               # Next.js app
│   └── app/
├── backend/                # NestJS API
│   └── src/
├── programs/               # Anchor workspace root
│   ├── Anchor.toml
│   ├── Cargo.toml
│   └── rentx/
│       └── src/
│           ├── lib.rs
│           ├── constants.rs
│           ├── errors.rs
│           ├── state/
│           │   ├── user_profile.rs
│           │   ├── rental_listing.rs
│           │   └── rental_agreement.rs
│           └── instructions/
│               ├── initialize_user.rs
│               ├── verify_user.rs
│               ├── create_listing.rs
│               ├── rent_item.rs
│               └── return_item.rs
└── tests/                  # TypeScript test suite
    ├── package.json
    ├── tsconfig.json
    └── rentx.ts
```

---

## Getting Started

### Prerequisites

- Node.js 18 (использует `.nvmrc`)
- Rust + Cargo
- Solana CLI 2.x
- Anchor CLI 0.32

```bash
nvm use   # автоматически подхватит Node 18
```

### Installation

```bash
git clone https://github.com/your-username/rentx.git
cd rentx

# Зависимости фронтенда
cd frontend && npm install

# Зависимости бэкенда
cd ../backend && npm install

# Зависимости тестов
cd ../tests && yarn install

# Сборка смарт-контракта
cd ../programs && anchor build
```

### Environment Variables



### Running Tests (Localnet)

```bash
cd programs
anchor test -- --features test-mode
```

Anchor автоматически запустит локальный валидатор, задеплоит программу и прогонит тесты.

### Deploy to Devnet

```bash
cd programs
anchor build
anchor deploy --provider.cluster devnet
```

---

## User Flow

```
1. Connect Phantom wallet (Sign-In with Solana)
        ↓
2. Upload documents → KYC → platform calls verify_user → is_verified = true
        ↓
3. Browse catalog → Select item → View price in SOL + deposit
        ↓
4. Click "Rent" → sign transaction → rent_item locks funds in escrow
        ↓
5. Deposit + rental fee locked in RentalAgreement PDA
        ↓
6. Visit pickup point → operator/owner signs return_item
        ↓
7. Deposit auto-returned to renter  |  Rental fee sent to owner
```

---

## Deployment

| Service | Platform |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway / Render |
| Database | Supabase / Railway PostgreSQL |
| Program | Solana Devnet → Mainnet-beta |

---

## Hackathon

Built for **Decentrathon — National Solana Hackathon 2025**
Case: Tokenization of Real-World Assets on Solana

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

MIT — see [LICENSE](LICENSE).

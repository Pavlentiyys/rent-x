# Contributing to RentX

Thank you for your interest in contributing to RentX!

---

## Getting Started

1. Fork the repository and clone your fork
2. Install prerequisites: Node.js 18, Rust, Solana CLI 2.x, Anchor CLI 0.32
3. Run `nvm use` to switch to the correct Node version
4. Install dependencies:
   ```bash
   cd tests && yarn install
   cd ../programs && anchor build
   ```

---

## Development Workflow

### Smart Contract (programs/)

```bash
cd programs

# Build
anchor build

# Test (localnet)
anchor test -- --features test-mode

# Lint
cargo clippy -- -D warnings
cargo fmt --check
```

### Frontend (frontend/)

```bash
cd frontend
npm install
npm run dev
```

### Backend (backend/)

```bash
cd backend
npm install
npm run start:dev
```

---

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feat/<description>` | `feat/dispute-resolution` |
| Bug fix | `fix/<description>` | `fix/escrow-drain` |
| Refactor | `refactor/<description>` | `refactor/state-types` |
| Docs | `docs/<description>` | `docs/anchor-setup` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(contract): add dispute resolution instruction
fix(tests): update confirmTransaction to latest blockhash API
docs(readme): add Why Solana section
```

---

## Pull Requests

- Один PR — одна задача
- Тесты должны проходить (`anchor test -- --features test-mode`)
- Опиши что изменилось и почему в описании PR
- Для изменений в смарт-контракте укажи security-considerations

---

## Security

Если нашёл уязвимость — **не создавай публичный issue**. Напиши напрямую в [Issues](../../issues) с пометкой `[SECURITY]` или на почту мейнтейнера.

---

## Code Style

**Rust:** следуй `rustfmt` + `clippy`. Запусти перед коммитом:
```bash
cargo fmt
cargo clippy -- -D warnings
```

**TypeScript:** проект использует prettier + eslint:
```bash
cd tests && yarn lint:fix
```

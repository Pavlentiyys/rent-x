# RentX Frontend

Next.js-based web application for decentralized peer-to-peer equipment rental on Solana blockchain.

## 🚀 Features

- **Marketplace** - Browse and search available rental items
- **Dashboard** - Manage your listings and rentals
- **Wallet Integration** - Solana wallet connectivity (Phantom, WalletConnect, etc.)
- **3D Animations** - Interactive Solana coins visualization
- **Responsive UI** - Mobile-first design with Tailwind CSS
- **Type-Safe** - Full TypeScript support

## 📋 Prerequisites

- Node.js 18+
- npm or yarn
- Solana wallet (Phantom, WalletConnect, etc.)

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup** (if needed)
   Create `.env.local` if you need custom API endpoints:
   ```env
   # Add any environment variables as needed
   ```

## 📦 Development

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view in browser.

### Build for Production
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── app/
│   ├── marketplace/      # Rental items catalog
│   ├── dashboard/        # User dashboard (my listings, rentals)
│   ├── api/              # API routes
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   ├── globals.css       # Global styles & theme
│   └── providers.tsx     # Context providers (Solana, themes, etc.)
├── components/
│   ├── ui/               # Reusable UI components
│   │   ├── SolanaCoins.tsx      # 3D coin animation (Three.js)
│   │   ├── WalletConnectModal.tsx
│   │   └── ...
│   └── sections/         # Page sections & layouts
│       ├── Header.tsx
│       ├── Catalog.tsx
│       └── ...
└── lib/                  # Utilities & helpers
```

## 🔧 Key Technologies

| Package | Version | Purpose |
|---------|---------|---------|
| **Next.js** | 16.2.2 | React framework with SSR |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5 | Type safety |
| **Tailwind CSS** | 4 | Utility-first CSS |
| **Three.js** | 0.183.2 | 3D graphics (coin animation) |
| **@solana/web3.js** | 1.98.4 | Solana blockchain interaction |
| **@solana/wallet-adapter-react** | 0.15.39 | Wallet connection |
| **Framer Motion** | 12.38.0 | Animation library |
| **Lucide React** | 1.7.0 | Icon library |
| **react-qrcode** | 4.2.0 | QR code generation |

## 🎨 Styling

The project uses **Tailwind CSS v4** with custom CSS variables for theme management:

### Color Scheme (Light Mode)
- Primary text: `var(--text-1)` (#0A0D1F)
- Secondary text: `var(--text-2)` (55% opacity)
- Background: `var(--main-bg)` (#F5F7FF)
- Surface: `var(--surface)` (#FFFFFF)
- Border: `var(--border)` (7% black opacity)

Edit `src/app/globals.css` to customize the theme.

## 🔗 Solana Integration

### Supported Wallets
- Phantom
- Solflare
- Backpack
- Magic Eden Wallet
- Custom WalletConnect implementations

### Wallet Setup
Wallet adapter is configured in `src/app/providers.tsx`. Users can connect via the wallet modal in the header.

## 📱 Pages

### `/` (Home)
Landing page with RentX overview and call-to-action.

### `/marketplace`
Browse available rental items with filtering and sorting.
- Search by name or category
- View item details (price, deposit, ratings)
- Connect wallet to rent items

### `/dashboard`
User dashboard (requires wallet connection):
- **My Listings** - Items you listed for rent
- **My Rentals** - Items you're currently renting
- **Transaction History** - Past rentals and earnings

### `/api/*`
Backend API routes (see `backend/README.md` for API documentation).

## 🐛 Troubleshooting

### Styles Not Loading
If Tailwind styles are missing:
```bash
# Ensure config files exist
ls tailwind.config.js postcss.config.js

# Restart dev server
npm run dev
```

### Wallet Not Connecting
- Ensure you have a Solana wallet extension installed
- Check network is set to Devnet
- Try refreshing the page

### 3D Coins Not Animating
- Check browser console for WebGL errors
- Ensure WebGL is enabled in browser
- Try a different browser (Chrome recommended)

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Solana Web3 Docs](https://docs.solana.com/)
- [Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Three.js Documentation](https://threejs.org/docs/)

## 📄 License

MIT License - See [LICENSE](../LICENSE) file in root directory

---

**Note**: This frontend connects to the RentX backend. Ensure the backend is running on the expected port for API calls to work properly.

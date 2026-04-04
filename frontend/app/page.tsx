import { WalletButton } from "./components/WalletButton";
import { RentalCard } from "./components/RentalCard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 bg-zinc-50 font-sans dark:bg-black">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-6 py-4 dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          RentX
        </h1>
        <WalletButton />
      </header>

      {/* Main */}
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-10">
        <section>
          <h2 className="mb-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Available Rentals
          </h2>
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            Connect your wallet, pick an item, sign the transaction — rental confirmed on-chain.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Static demo cards — replace with on-chain data fetching */}
            <RentalCard
              itemName="Electric Scooter"
              pricePerDay={100_000_000}
              depositAmount={500_000_000}
              isAvailable={true}
            />
            <RentalCard
              itemName="Camera Kit"
              pricePerDay={200_000_000}
              depositAmount={1_000_000_000}
              isAvailable={true}
            />
            <RentalCard
              itemName="Camping Tent"
              pricePerDay={50_000_000}
              depositAmount={300_000_000}
              isAvailable={false}
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white px-6 py-4 text-center text-sm text-zinc-400 dark:border-zinc-800 dark:bg-zinc-950">
        RentX — Decentrathon 2025 | Powered by Solana
      </footer>
    </div>
  );
}

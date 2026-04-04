const txns = [
  { hash: "8xKf…3mPQ", action: "арендовал «DJI Mavic 3»", amount: "0.8 SOL", ago: "2с" },
  { hash: "4nBz…9aWX", action: "вернул «Sony A7 IV»", amount: "залог возвращён", ago: "7с" },
  { hash: "7pQr…2xKL", action: "создал листинг «MacBook Pro»", amount: "0.6 SOL/день", ago: "15с" },
  { hash: "Kz9m…5bNV", action: "арендовал «Горный велосипед»", amount: "0.1 SOL", ago: "22с" },
  { hash: "Xw4p…8hRQ", action: "вернул «Палатка Coleman»", amount: "0.5 SOL escrow", ago: "34с" },
  { hash: "3rTy…6mWX", action: "арендовал «Электросамокат»", amount: "0.15 SOL", ago: "41с" },
  { hash: "9sLa…1nKB", action: "создал листинг «DJI FPV»", amount: "1.2 SOL/день", ago: "58с" },
  { hash: "2jFd…4pCV", action: "вернул «MacBook Pro M3»", amount: "6 SOL escrow", ago: "1м" },
];

// duplicate array for seamless loop
const all = [...txns, ...txns];

export const LiveFeed = () => {
  return (
    <section className="py-12 bg-gray-950 dark:bg-black overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 mb-5 flex items-center gap-3">
        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
        <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
          Последние транзакции on-chain · Solana Devnet
        </span>
      </div>

      {/* ticker wrapper masks the edges */}
      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to right, #030712, transparent)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
          style={{
            background: "linear-gradient(to left, #030712, transparent)",
          }}
        />

        <div className="flex animate-ticker gap-8 py-1 w-max">
          {all.map(({ hash, action, amount, ago }, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 shrink-0"
            >
              <span className="text-green-400 text-sm font-bold">✓</span>
              <span className="text-[11px] font-mono text-gray-500">{hash}</span>
              <span className="text-[12px] text-gray-300">
                <span className="text-white font-medium">{hash.split("…")[0]}…</span>{" "}
                {action}
              </span>
              <span className="text-[11px] font-semibold text-brand">{amount}</span>
              <span className="text-[10px] text-gray-600">{ago} назад</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

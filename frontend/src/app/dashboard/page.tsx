"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Wallet,
  Package,
  Clock,
  TrendingUp,
  Plus,
  ArrowUpRight,
  LogOut,
  Sun,
  Moon,
  ShieldCheck,
  Coins,
  ArrowLeftRight,
} from "lucide-react";
import { useWalletContext } from "@/components/ui/WalletContext";
import { useTheme } from "@/components/ThemeProvider";

const mockRentals = [
  {
    id: 1,
    name: "DJI Mavic 3",
    status: "active",
    daysLeft: 2,
    price: "0.8 SOL",
    image: "🚁",
  },
  {
    id: 2,
    name: "Sony A7 IV",
    status: "active",
    daysLeft: 5,
    price: "0.6 SOL/день",
    image: "📷",
  },
  {
    id: 3,
    name: "MacBook Pro M3",
    status: "pending",
    daysLeft: 0,
    price: "6 SOL escrow",
    image: "💻",
  },
];

const mockListings = [
  { id: 1, name: "Горный велосипед", price: "0.1 SOL/день", views: 34, image: "🚵" },
  { id: 2, name: "Палатка Coleman", price: "0.05 SOL/день", views: 12, image: "⛺" },
];

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  active:  { text: "Активна",  color: "#059669", bg: "rgba(5,150,105,0.1)" },
  pending: { text: "Ожидание", color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  ended:   { text: "Завершена", color: "var(--text-4)", bg: "var(--surface-2)" },
};

export default function DashboardPage() {
  const { address, connected, disconnect } = useWalletContext();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  // Redirect to home if wallet not connected
  useEffect(() => {
    if (!connected) {
      router.replace("/");
    }
  }, [connected, router]);

  if (!connected) return null;

  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "";

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      {/* Header */}
      <header className="sticky top-0 z-50 w-full px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center gap-3 h-12">
          <div
            className="flex-1 flex items-center justify-between px-5 h-full rounded-full"
            style={{
              background: "var(--header-pill-bg)",
              boxShadow: "var(--header-pill-shadow)",
              border: "1px solid var(--header-pill-border)",
              backdropFilter: "var(--card-blur) var(--card-saturate)",
              WebkitBackdropFilter: "var(--card-blur) var(--card-saturate)",
            }}
          >
            <Link href="/" className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text-1)" }}>
              RENTO
            </Link>

            <nav className="hidden md:flex items-center gap-7">
              {[
                { href: "/#catalog",      label: "Каталог" },
                { href: "/#why-rentx",    label: "Маркетплейс" },
                { href: "/#how-it-works", label: "Для хостов" },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-sm font-medium transition-colors duration-150"
                  style={{ color: "var(--text-3)" }}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <button
              onClick={disconnect}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#059669",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="font-mono text-xs">{short}</span>
              <LogOut size={13} />
            </button>
          </div>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors"
            style={{
              background: "var(--header-pill-bg)",
              boxShadow: "var(--header-pill-shadow)",
              border: "1px solid var(--header-pill-border)",
              color: "var(--text-2)",
              backdropFilter: "var(--card-blur) var(--card-saturate)",
              WebkitBackdropFilter: "var(--card-blur) var(--card-saturate)",
            }}
          >
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Welcome */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{
                background: "conic-gradient(from 200deg, #9945FF 0%, #14F195 30%, #00C2FF 55%, #FF6B9D 80%, #9945FF 100%)",
              }}
            />
            <div>
              <h1 className="text-2xl font-bold leading-tight" style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}>
                Мой кабинет
              </h1>
              <p className="font-mono text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                {address}
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Wallet,         label: "Баланс",         value: "12.4 SOL",  sub: "≈ $1 860" },
            { icon: Package,        label: "Активных аренд", value: "2",         sub: "до 7 дней" },
            { icon: TrendingUp,     label: "Сохранено",      value: "0.34 SOL",  sub: "по сравнению с фиатом" },
            { icon: ShieldCheck,    label: "NFT ключей",     value: "3",         sub: "в кошельке" },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="rounded-[20px] px-5 py-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "var(--card-blur)",
                WebkitBackdropFilter: "var(--card-blur)",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #3B5BFF 0%, #1B2BB8 100%)" }}
              >
                <Icon size={17} className="text-white" strokeWidth={1.8} />
              </div>
              <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-4)" }}>
                {label}
              </p>
              <p className="text-xl font-bold" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                {value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Active rentals */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                Мои аренды
              </h2>
              <Link
                href="/#catalog"
                className="flex items-center gap-1 text-xs font-semibold"
                style={{ color: "#1B2BB8" }}
              >
                Найти ещё <ArrowUpRight size={12} />
              </Link>
            </div>
            <div className="space-y-3">
              {mockRentals.map((r) => {
                const s = statusLabel[r.status];
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 rounded-[16px] px-4 py-3.5"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <span className="text-2xl shrink-0">{r.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                        {r.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                        {r.daysLeft > 0 ? `Осталось ${r.daysLeft} дн.` : "Подтверждение…"}
                      </p>
                    </div>
                    <p className="text-xs font-semibold shrink-0" style={{ color: "var(--text-2)" }}>
                      {r.price}
                    </p>
                    <span
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ color: s.color, background: s.bg }}
                    >
                      {s.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* My listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                  Мои листинги
                </h2>
                <button
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)",
                    color: "#fff",
                  }}
                >
                  <Plus size={12} /> Добавить
                </button>
              </div>
              <div className="space-y-3">
                {mockListings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-3 rounded-[14px] px-4 py-3"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <span className="text-xl shrink-0">{l.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                        {l.name}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                        {l.views} просмотров
                      </p>
                    </div>
                    <p className="text-xs font-semibold shrink-0" style={{ color: "#1B2BB8" }}>
                      {l.price}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-1)" }}>
                Быстрые действия
              </h2>
              <div className="space-y-2">
                {[
                  { icon: Package,         label: "Арендовать технику",   sub: "Каталог → выбрать → подписать" },
                  { icon: Coins,           label: "DeFi — залог NFT",     sub: "Используйте ключ как залог" },
                  { icon: ArrowLeftRight,  label: "Продать аренду",       sub: "P2P маркетплейс" },
                  { icon: Clock,           label: "История транзакций",   sub: "On-chain записи" },
                ].map(({ icon: Icon, label, sub }) => (
                  <button
                    key={label}
                    className="w-full flex items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-all"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      boxShadow: "var(--card-shadow)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <Icon size={15} style={{ color: "#1B2BB8" }} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                        {label}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                        {sub}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

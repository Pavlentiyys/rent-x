"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import Image from "next/image";
import {
  Wallet,
  Package,
  TrendingUp,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  LogOut,
  Coins,
  ArrowLeftRight,
  Clock,
  Search,
  Pencil,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import { fetchMyRents, fetchMyPosts, type Rent, type Post } from "@/lib/api-client";

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  active:    { text: "Активна",    color: "#059669", bg: "rgba(5,150,105,0.1)" },
  pending:   { text: "Ожидание",   color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  approved:  { text: "Одобрено",   color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  paid:      { text: "Оплачено",   color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  completed: { text: "Завершена",  color: "var(--text-4)", bg: "var(--surface-2)" },
  cancelled: { text: "Отменена",   color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  disputed:  { text: "Спор",       color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
};

export default function DashboardPage() {
  const { address, connected, authToken, disconnect } = useWalletContext();
  const { connection } = useConnection();
  const router = useRouter();

  const [rents, setRents] = useState<Rent[]>([]);
  const [listings, setListings] = useState<Post[]>([]);
  const [loadingRents, setLoadingRents] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!connected) router.replace("/");
  }, [connected, router]);

  // Fetch SOL balance
  useEffect(() => {
    if (!address || !connection) return;
    const { PublicKey } = require("@solana/web3.js");
    connection.getBalance(new PublicKey(address))
      .then((lamports) => setBalance(lamports / LAMPORTS_PER_SOL))
      .catch(console.error);
  }, [address, connection]);

  // Fetch rents and listings
  useEffect(() => {
    if (!authToken) return;

    setLoadingRents(true);
    fetchMyRents(authToken)
      .then(setRents)
      .catch(console.error)
      .finally(() => setLoadingRents(false));

    setLoadingListings(true);
    fetchMyPosts(authToken)
      .then((res) => setListings(res.items))
      .catch(console.error)
      .finally(() => setLoadingListings(false));
  }, [authToken]);

  if (!connected) return null;

  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : "";
  const activeRentsCount = rents.filter(r => ["active", "approved", "paid"].includes(r.status)).length;
  const balanceStr = balance !== null ? `${balance.toFixed(3)} SOL` : "—";

  const quickActions = [
    {
      icon: Search,
      label: "Арендовать технику",
      sub: "Каталог → выбрать → подписать",
      onClick: () => router.push("/marketplace"),
    },
    {
      icon: Coins,
      label: "DeFi — залог NFT",
      sub: "Используйте ключ как залог",
      onClick: () => {},
    },
    {
      icon: ArrowLeftRight,
      label: "Продать аренду",
      sub: "P2P маркетплейс",
      onClick: () => router.push("/marketplace"),
    },
    {
      icon: Clock,
      label: "История транзакций",
      sub: "On-chain записи",
      onClick: () => window.open(`https://explorer.solana.com/address/${address}?cluster=devnet`, "_blank"),
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-10">
        {/* Profile section */}
        <div
          className="rounded-[24px] px-6 py-5 mb-8 flex items-center justify-between"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            boxShadow: "var(--card-shadow)",
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-full shrink-0"
              style={{
                background: "conic-gradient(from 200deg, #9945FF 0%, #14F195 30%, #00C2FF 55%, #FF6B9D 80%, #9945FF 100%)",
              }}
            />
            <div>
              <h1 className="text-xl font-bold leading-tight" style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}>
                Мой кабинет
              </h1>
              <p className="font-mono text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                {address}
              </p>
            </div>
          </div>

          <button
            onClick={disconnect}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-80"
            style={{
              background: "rgba(220,38,38,0.08)",
              border: "1px solid rgba(220,38,38,0.2)",
              color: "#DC2626",
            }}
          >
            <LogOut size={14} />
            Выйти
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            {
              icon: Wallet,
              label: "Баланс",
              value: balanceStr,
              sub: balance !== null ? `≈ $${(balance * 150).toFixed(0)}` : "загрузка…",
            },
            {
              icon: Package,
              label: "Активных аренд",
              value: loadingRents ? "…" : String(activeRentsCount),
              sub: activeRentsCount === 1 ? "аренда" : activeRentsCount >= 2 && activeRentsCount <= 4 ? "аренды" : "аренд",
            },
            {
              icon: TrendingUp,
              label: "Мои листинги",
              value: loadingListings ? "…" : String(listings.length),
              sub: listings.length === 1 ? "объявление" : "объявлений",
            },
            {
              icon: ShieldCheck,
              label: "Всего аренд",
              value: loadingRents ? "…" : String(rents.length),
              sub: "за всё время",
            },
          ].map(({ icon: Icon, label, value, sub }) => (
            <div
              key={label}
              className="rounded-[20px] px-5 py-5"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
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
              <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Мои аренды</h2>
              <Link
                href="/marketplace"
                className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity"
                style={{ color: "#1B2BB8" }}
              >
                Найти ещё <ArrowUpRight size={12} />
              </Link>
            </div>

            <div className="space-y-3">
              {loadingRents && (
                <p className="text-sm" style={{ color: "var(--text-3)" }}>Загрузка…</p>
              )}
              {!loadingRents && rents.length === 0 && (
                <div
                  className="rounded-[16px] px-4 py-6 text-center"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                >
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>Нет аренд</p>
                  <Link href="/marketplace" className="text-xs font-semibold mt-2 inline-block" style={{ color: "#1B2BB8" }}>
                    Перейти в маркетплейс →
                  </Link>
                </div>
              )}
              {rents.map((r) => {
                const s = statusLabel[r.status] ?? { text: r.status, color: "var(--text-3)", bg: "var(--surface-2)" };
                const endDate = new Date(r.endDate);
                const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-4 rounded-[16px] px-4 py-3.5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
                  >
                    <div
                      className="relative w-11 h-11 rounded-[10px] shrink-0 overflow-hidden flex items-center justify-center"
                      style={{ background: "var(--surface-2)" }}
                    >
                      {r.post?.images?.[0]?.url ? (
                        <Image src={r.post.images[0].url} alt="" fill className="object-cover" unoptimized />
                      ) : (
                        <Package size={16} style={{ color: "var(--text-4)" }} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>
                        {r.post?.title ?? `Аренда #${r.id}`}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                        {r.status === "active" && daysLeft > 0 ? `Осталось ${daysLeft} дн.` : `до ${endDate.toLocaleDateString("ru-RU")}`}
                      </p>
                    </div>
                    <p className="text-xs font-semibold shrink-0" style={{ color: "var(--text-2)" }}>
                      {r.totalAmount}
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
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>Мои листинги</h2>
                <Link
                  href="/create-listing"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", color: "#fff" }}
                >
                  <Plus size={12} /> Добавить
                </Link>
              </div>

              <div className="space-y-3">
                {loadingListings && (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>Загрузка…</p>
                )}
                {!loadingListings && listings.length === 0 && (
                  <div
                    className="rounded-[14px] px-4 py-5 text-center"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <p className="text-sm" style={{ color: "var(--text-3)" }}>Нет листингов</p>
                  </div>
                )}
                {listings.map((l) => {
                  const thumb = l.images?.[0]?.url;
                  return (
                    <div
                      key={l.id}
                      className="flex items-center gap-3 rounded-[14px] px-3 py-3"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
                    >
                      {/* Thumbnail */}
                      <div
                        className="relative w-11 h-11 rounded-[10px] shrink-0 overflow-hidden flex items-center justify-center"
                        style={{ background: "var(--surface-2)" }}
                      >
                        {thumb ? (
                          <Image src={thumb} alt="" fill className="object-cover" unoptimized />
                        ) : (
                          <Package size={16} style={{ color: "var(--text-4)" }} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>{l.title}</p>
                        <p className="text-xs mt-0.5 font-semibold" style={{ color: "#1B2BB8" }}>
                          {l.pricePerDay} SOL/день
                        </p>
                      </div>

                      <Link
                        href={`/edit-listing/${l.id}`}
                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-opacity hover:opacity-70 cursor-pointer"
                        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                        title="Редактировать"
                      >
                        <Pencil size={13} style={{ color: "var(--text-2)" }} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions */}
            <div>
              <h2 className="text-base font-bold mb-4" style={{ color: "var(--text-1)" }}>Быстрые действия</h2>
              <div className="space-y-2">
                {quickActions.map(({ icon: Icon, label, sub, onClick }) => (
                  <button
                    key={label}
                    onClick={onClick}
                    className="w-full flex items-center gap-3 rounded-[14px] px-4 py-3 text-left transition-all hover:opacity-80 cursor-pointer"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
                  >
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                      style={{ background: "var(--surface-2)" }}
                    >
                      <Icon size={15} style={{ color: "#1B2BB8" }} strokeWidth={1.8} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>{label}</p>
                      <p className="text-[11px]" style={{ color: "var(--text-3)" }}>{sub}</p>
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

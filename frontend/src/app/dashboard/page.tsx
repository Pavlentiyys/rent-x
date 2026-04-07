"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
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
  Loader2,
  Phone,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import { useLanguage } from "@/components/LanguageProvider";
import {
  fetchMyRents,
  fetchMyPosts,
  handoverRent,
  requestReturnRent,
  completeRent,
  type Rent,
  type Post,
} from "@/lib/api-client";
import {
  getListingPDA,
  getRentalPDA,
  returnItem,
  toListingSeed,
} from "@/lib/anchor-client";

const statusLabel: Record<string, { text: string; color: string; bg: string }> = {
  active:           { text: "Активна",           color: "#059669", bg: "rgba(5,150,105,0.1)" },
  pending:          { text: "Ожидание",           color: "#D97706", bg: "rgba(217,119,6,0.1)" },
  approved:         { text: "Одобрено",           color: "#2563EB", bg: "rgba(37,99,235,0.1)" },
  paid:             { text: "Оплачено",           color: "#7C3AED", bg: "rgba(124,58,237,0.1)" },
  return_requested: { text: "Возврат",            color: "#EA580C", bg: "rgba(234,88,12,0.1)" },
  completed:        { text: "Завершена",          color: "var(--text-4)", bg: "var(--surface-2)" },
  cancelled:        { text: "Отменена",           color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
  disputed:         { text: "Спор",               color: "#DC2626", bg: "rgba(220,38,38,0.1)" },
};

function RentCard({
  r, myId, rentActionLoading, rentActionError, onAction,
}: {
  r: Rent;
  myId: number | undefined;
  rentActionLoading: number | null;
  rentActionError: { id: number; msg: string } | null;
  onAction: (r: Rent, action: "handover" | "request-return" | "complete") => void;
}) {
  const s = statusLabel[r.status] ?? { text: r.status, color: "var(--text-3)", bg: "var(--surface-2)" };
  const endDate = new Date(r.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000));
  const isOwner = r.owner?.id === myId;
  const isRenter = r.renter?.id === myId;
  const isLoading = rentActionLoading === r.id;

  const { t } = useLanguage();
  let actionBtn: { label: string; action: "handover" | "request-return" | "complete"; color: string } | null = null;
  if (isOwner && ["pending", "approved", "paid"].includes(r.status)) {
    actionBtn = { label: t.dashboard.handover, action: "handover", color: "#2563EB" };
  } else if (isRenter && r.status === "active") {
    actionBtn = { label: t.dashboard.returnItem, action: "request-return", color: "#EA580C" };
  } else if (isOwner && r.status === "return_requested") {
    actionBtn = { label: t.dashboard.confirmReturn, action: "complete", color: "#059669" };
  }

  return (
    <div
      className="rounded-[16px] px-4 py-3.5"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
    >
      <div className="flex items-center gap-4">
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
          {r.totalAmount} SOL
        </p>
        <span
          className="text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0"
          style={{ color: s.color, background: s.bg }}
        >
          {s.text}
        </span>
      </div>
      {/* Show contact info to renter when active */}
      {isRenter && ["active", "return_requested"].includes(r.status) && r.post?.contactInfo && (
        <div className="mt-3 pt-3 flex items-start gap-2" style={{ borderTop: "1px solid var(--border)" }}>
          <Phone size={12} className="shrink-0 mt-0.5" style={{ color: "#059669" }} />
          <p className="text-xs" style={{ color: "var(--text-2)" }}>
            <span className="font-semibold" style={{ color: "#059669" }}>{t.dashboard.ownerContacts}: </span>
            {r.post.contactInfo}
          </p>
        </div>
      )}

      {actionBtn && (
        <div className="mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <button
            onClick={() => onAction(r, actionBtn!.action)}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer disabled:opacity-50"
            style={{ background: `${actionBtn.color}18`, border: `1px solid ${actionBtn.color}40`, color: actionBtn.color }}
          >
            {isLoading && <Loader2 size={12} className="animate-spin" />}
            {actionBtn.label}
          </button>
          {rentActionError?.id === r.id && (
            <p className="text-xs mt-1.5" style={{ color: "#DC2626" }}>{rentActionError.msg}</p>
          )}
        </div>
      )}
    </div>
  );
}

function RentList({
  rents, loading, myId, emptyText, emptyLink, rentActionLoading, rentActionError, onAction,
}: {
  rents: Rent[];
  loading: boolean;
  myId: number | undefined;
  emptyText: string;
  emptyLink?: { href: string; label: string };
  rentActionLoading: number | null;
  rentActionError: { id: number; msg: string } | null;
  onAction: (r: Rent, action: "handover" | "request-return" | "complete") => void;
}) {
  if (loading) return <p className="text-sm" style={{ color: "var(--text-3)" }}>Загрузка…</p>;
  if (rents.length === 0) {
    return (
      <div className="rounded-[16px] px-4 py-6 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
        <p className="text-sm" style={{ color: "var(--text-3)" }}>{emptyText}</p>
        {emptyLink && (
          <Link href={emptyLink.href} className="text-xs font-semibold mt-2 inline-block" style={{ color: "#1B2BB8" }}>
            {emptyLink.label}
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {rents.map((r) => (
        <RentCard key={r.id} r={r} myId={myId} rentActionLoading={rentActionLoading} rentActionError={rentActionError} onAction={onAction} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { address, connected, authToken, userProfile, disconnect } = useWalletContext();
  const { t } = useLanguage();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();
  const router = useRouter();

  const [rents, setRents] = useState<Rent[]>([]);
  const [listings, setListings] = useState<Post[]>([]);
  const [loadingRents, setLoadingRents] = useState(false);
  const [loadingListings, setLoadingListings] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [rentActionLoading, setRentActionLoading] = useState<number | null>(null);
  const [rentActionError, setRentActionError] = useState<{ id: number; msg: string } | null>(null);

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

  const reloadRents = () => {
    if (!authToken) return;
    fetchMyRents(authToken).then(setRents).catch(console.error);
  };

  const handleRentAction = async (rent: Rent, action: "handover" | "request-return" | "complete") => {
    if (!authToken) return;
    setRentActionLoading(rent.id);
    setRentActionError(null);
    try {
      if (action === "handover") {
        await handoverRent(authToken, rent.id);
      } else if (action === "request-return") {
        await requestReturnRent(authToken, rent.id);
      } else if (action === "complete") {
        let txSig: string | undefined;
        // Call on-chain returnItem
        if (anchorWallet && rent.post && rent.owner?.walletAddress && rent.renter?.walletAddress) {
          try {
            const ownerPubkey = new PublicKey(rent.owner.walletAddress);
            const renterPubkey = new PublicKey(rent.renter.walletAddress);
            const [listingPDA] = getListingPDA(ownerPubkey, toListingSeed(rent.post.title));
            const [rentalPDA] = getRentalPDA(renterPubkey, listingPDA);
            txSig = await returnItem(connection, anchorWallet, rentalPDA, listingPDA, renterPubkey, ownerPubkey);
          } catch (onChainErr) {
            console.warn("on-chain returnItem failed:", onChainErr);
          }
        }
        await completeRent(authToken, rent.id, txSig);
      }
      reloadRents();
    } catch (err) {
      setRentActionError({ id: rent.id, msg: err instanceof Error ? err.message : "Ошибка" });
    } finally {
      setRentActionLoading(null);
    }
  };

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
                {t.dashboard.title}
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
              label: t.dashboard.balance,
              value: balanceStr,
              sub: balance !== null ? `≈ $${(balance * 150).toFixed(0)}` : t.dashboard.loading,
            },
            {
              icon: Package,
              label: t.dashboard.activeRentals,
              value: loadingRents ? "…" : String(activeRentsCount),
              sub: "",
            },
            {
              icon: TrendingUp,
              label: t.dashboard.myListings,
              value: loadingListings ? "…" : String(listings.length),
              sub: "",
            },
            {
              icon: ShieldCheck,
              label: t.dashboard.totalRentals,
              value: loadingRents ? "…" : String(rents.length),
              sub: "",
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
          {/* Rentals columns */}
          <div className="md:col-span-2 space-y-8">

            {/* Взял в аренду */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>{t.dashboard.rentedByMe}</h2>
                <Link href="/marketplace" className="flex items-center gap-1 text-xs font-semibold hover:opacity-70 transition-opacity" style={{ color: "#1B2BB8" }}>
                  {t.dashboard.findMore} <ArrowUpRight size={12} />
                </Link>
              </div>
              <RentList
                rents={rents.filter(r => r.renter?.id === userProfile?.id)}
                loading={loadingRents}
                myId={userProfile?.id}
                emptyText={t.dashboard.noRentedByMe}
                emptyLink={{ href: "/marketplace", label: t.dashboard.goMarketplace }}
                rentActionLoading={rentActionLoading}
                rentActionError={rentActionError}
                onAction={handleRentAction}
              />
            </div>

            {/* Мои аренды (сдал) */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>{t.dashboard.myRentals}</h2>
              </div>
              <RentList
                rents={rents.filter(r => r.owner?.id === userProfile?.id)}
                loading={loadingRents}
                myId={userProfile?.id}
                emptyText={t.dashboard.noMyRentals}
                rentActionLoading={rentActionLoading}
                rentActionError={rentActionError}
                onAction={handleRentAction}
              />
            </div>

          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* My listings */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>{t.dashboard.myListings}</h2>
                <Link
                  href="/create-listing"
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", color: "#fff" }}
                >
                  <Plus size={12} /> {t.dashboard.addListing}
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

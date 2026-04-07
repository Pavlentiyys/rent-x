"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { PublicKey } from "@solana/web3.js";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { BN } from "@coral-xyz/anchor";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  ShieldCheck,
  Coins,
  Package,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Tag,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import { fetchPostById, type Post } from "@/lib/api-client";
import {
  rentItem,
  getListingPDA,
  userProfileExists,
  initializeUser,
  toListingSeed,
} from "@/lib/anchor-client";

type RentStep = "idle" | "init_user" | "signing" | "done" | "error";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { address, openModal } = useWalletContext();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [imgIndex, setImgIndex] = useState(0);
  const [rentStep, setRentStep] = useState<RentStep>("idle");
  const [rentError, setRentError] = useState<string | null>(null);

  useEffect(() => {
    fetchPostById(Number(id))
      .then(setPost)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  const handleRent = async () => {
    if (!address || !anchorWallet) { openModal(); return; }
    if (!post?.owner?.walletAddress) { setRentError("Владелец не найден"); return; }

    setRentStep("init_user");
    setRentError(null);

    try {
      const hasProfile = await userProfileExists(connection, anchorWallet, anchorWallet.publicKey);
      if (!hasProfile) {
        await initializeUser(connection, anchorWallet);
      }

      setRentStep("signing");

      const ownerPubkey = new PublicKey(post.owner.walletAddress);
      const [listingPDA] = getListingPDA(ownerPubkey, toListingSeed(post.title));

      const now = Math.floor(Date.now() / 1000);
      const startTime = new BN(now);
      const endTime = new BN(now + 7 * 86400);

      await rentItem(connection, anchorWallet, listingPDA, startTime, endTime);

      setRentStep("done");
    } catch (err) {
      console.error("Rent failed:", err);
      setRentError(err instanceof Error ? err.message : "Ошибка аренды");
      setRentStep("error");
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-4)" }} />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <p className="text-xl font-bold" style={{ color: "var(--text-1)" }}>Товар не найден</p>
          <Link href="/marketplace" className="text-sm font-semibold" style={{ color: "#1B2BB8" }}>← Вернуться в маркетплейс</Link>
        </div>
      </div>
    );
  }

  const images = post.images ?? [];
  const currentImg = images[imgIndex]?.url;
  const isAvailable = post.status === "active";
  const ownerShort = post.owner?.walletAddress
    ? post.owner.walletAddress.slice(0, 6) + "…" + post.owner.walletAddress.slice(-4)
    : "Unknown";
  const ownerDisplay = post.owner?.displayName || post.owner?.username || ownerShort;
  const priceNum = parseFloat(post.pricePerDay);
  const depositNum = parseFloat(post.depositAmount);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm mb-8 hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: "var(--text-3)" }}
        >
          <ArrowLeft size={15} /> Назад
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — images */}
          <div>
            {/* Main image */}
            <div
              className="relative rounded-[24px] overflow-hidden mb-3"
              style={{
                aspectRatio: "4/3",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              {currentImg ? (
                <Image src={currentImg} alt={post.title} fill className="object-cover" unoptimized />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Package size={48} style={{ color: "var(--text-4)" }} />
                </div>
              )}

              {/* Category badge */}
              <div className="absolute top-3 left-3">
                <span
                  className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                >
                  {post.category}
                </span>
              </div>

              {/* Availability */}
              <div className="absolute top-3 right-3">
                {isAvailable ? (
                  <span
                    className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Доступно
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                    style={{ background: "var(--surface)", color: "var(--text-3)" }}
                  >
                    Арендовано
                  </span>
                )}
              </div>

              {/* Prev/Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setImgIndex((i) => (i - 1 + images.length) % images.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <ChevronLeft size={16} className="text-white" />
                  </button>
                  <button
                    onClick={() => setImgIndex((i) => (i + 1) % images.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:opacity-80"
                    style={{ background: "rgba(0,0,0,0.45)" }}
                  >
                    <ChevronRight size={16} className="text-white" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 flex-wrap">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setImgIndex(i)}
                    className="relative w-16 h-16 rounded-[10px] overflow-hidden shrink-0 cursor-pointer transition-all"
                    style={{
                      border: i === imgIndex ? "2px solid #1B2BB8" : "2px solid var(--border)",
                      opacity: i === imgIndex ? 1 : 0.6,
                    }}
                  >
                    <Image src={img.url} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right — info */}
          <div className="flex flex-col gap-5">
            <div>
              <h1
                className="text-2xl font-black mb-2"
                style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}
              >
                {post.title}
              </h1>

              {post.location && (
                <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--text-3)" }}>
                  <MapPin size={14} />
                  {post.location}
                </div>
              )}
            </div>

            {/* Price block */}
            <div
              className="rounded-[18px] px-5 py-4"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-4)" }}>Цена</p>
                  <p className="text-2xl font-black" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                    {priceNum} SOL
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>в день</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider mb-1" style={{ color: "var(--text-4)" }}>Залог</p>
                  <p className="text-xl font-bold" style={{ color: "var(--text-2)" }}>
                    {depositNum} SOL
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-3)" }}>возвращается</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <Tag size={12} style={{ color: "#14F195" }} />
                <p className="text-xs" style={{ color: "var(--text-3)" }}>
                  Залог блокируется в <span className="font-semibold" style={{ color: "#14F195" }}>Solana escrow</span>
                </p>
              </div>
            </div>

            {/* Description */}
            {post.description && (
              <div
                className="rounded-[18px] px-5 py-4"
                style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
              >
                <p className="text-[11px] uppercase tracking-wider mb-2" style={{ color: "var(--text-4)" }}>Описание</p>
                <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                  {post.description}
                </p>
              </div>
            )}

            {/* Availability dates */}
            {(post.availableFrom || post.availableTo) && (
              <div className="flex items-center gap-3 text-sm" style={{ color: "var(--text-3)" }}>
                <Calendar size={14} className="shrink-0" />
                <span>
                  {post.availableFrom && <>с {new Date(post.availableFrom).toLocaleDateString("ru-RU")} </>}
                  {post.availableTo && <>до {new Date(post.availableTo).toLocaleDateString("ru-RU")}</>}
                </span>
              </div>
            )}

            {/* Owner */}
            <div
              className="flex items-center gap-3 rounded-[16px] px-4 py-3"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "conic-gradient(from 200deg, #9945FF 0%, #14F195 30%, #00C2FF 55%, #FF6B9D 80%, #9945FF 100%)" }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: "var(--text-1)" }}>{ownerDisplay}</p>
                <p className="font-mono text-[10px]" style={{ color: "var(--text-4)" }}>{ownerShort}</p>
              </div>
              {post.owner?.isVerified && (
                <ShieldCheck size={15} style={{ color: "#059669" }} />
              )}
            </div>

            {/* Rent error */}
            {rentStep === "error" && rentError && (
              <div
                className="flex items-start gap-3 rounded-[14px] px-4 py-3"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                <p className="text-sm" style={{ color: "#DC2626" }}>{rentError}</p>
              </div>
            )}

            {/* Rent success */}
            {rentStep === "done" && (
              <div
                className="flex items-center gap-3 rounded-[14px] px-4 py-3"
                style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}
              >
                <CheckCircle2 size={15} style={{ color: "#059669" }} />
                <p className="text-sm font-semibold" style={{ color: "#059669" }}>Аренда оформлена на 7 дней!</p>
              </div>
            )}

            {/* Rent button */}
            <button
              onClick={handleRent}
              disabled={!isAvailable || rentStep === "signing" || rentStep === "init_user" || rentStep === "done"}
              className="w-full flex items-center justify-center gap-2.5 py-4 rounded-[16px] text-sm font-bold text-white transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              style={
                rentStep === "done"
                  ? { background: "rgba(16,185,129,0.15)", color: "#059669", border: "1px solid rgba(16,185,129,0.3)" }
                  : !isAvailable
                  ? { background: "var(--surface)", color: "var(--text-4)", border: "1px solid var(--border)" }
                  : {
                      background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)",
                      boxShadow: "0 4px 18px rgba(27,43,184,0.35)",
                    }
              }
            >
              {rentStep === "init_user" && <><Loader2 size={16} className="animate-spin" /> Создание профиля…</>}
              {rentStep === "signing"   && <><Loader2 size={16} className="animate-spin" /> Подпись в Phantom…</>}
              {rentStep === "done"      && <><CheckCircle2 size={16} /> Аренда оформлена</>}
              {(rentStep === "idle" || rentStep === "error") && (
                !isAvailable
                  ? "Недоступно"
                  : !address
                  ? <><User size={16} /> Подключить кошелёк</>
                  : <><Coins size={16} /> Арендовать — {priceNum} SOL/день</>
              )}
            </button>

            <p className="text-[11px] text-center" style={{ color: "var(--text-4)" }}>
              Аренда на 7 дней · залог {depositNum} SOL будет заблокирован в смарт-контракте
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";
import { useState } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { motion } from "framer-motion";
import {
  Zap,
  Wallet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ShieldCheck,
  Coins,
  Activity,
  BadgeCheck,
} from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";
import {
  initializeUser,
  verifyUser,
  userProfileExists,
  fetchUserProfile,
} from "@/lib/anchor-client";

type AirdropStatus = "idle" | "loading" | "success" | "error";
type VerifyStatus = "idle" | "loading" | "success" | "error";

const AIRDROP_AMOUNTS = [0.5, 1, 2, 5];

export default function AdminPage() {
  const { address, connected, authToken, userProfile } = useWalletContext();
  const { connection } = useConnection();
  const anchorWallet = useAnchorWallet();

  const [balance, setBalance] = useState<number | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<VerifyStatus>("idle");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [onChainVerified, setOnChainVerified] = useState<boolean | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [airdropAmount, setAirdropAmount] = useState(2);
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus>("idle");
  const [airdropTx, setAirdropTx] = useState<string | null>(null);
  const [airdropError, setAirdropError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchBalance = async () => {
    if (!address || !connection) return;
    setBalanceLoading(true);
    try {
      const lamports = await connection.getBalance(new PublicKey(address));
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch {
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  const isRateLimitError = (err: Error) =>
    err.message.includes("429") ||
    err.message.includes("Too Many") ||
    err.message.includes("rate limit") ||
    err.message.includes("-32403") ||   // Helius devnet faucet daily limit
    err.message.includes("faucet") ||   // "devnet faucet has a limit..."
    // web3.js wraps 429 JSON-parse failures as union type errors
    err.message.includes("satisfy a union") ||
    err.message.includes("object Object");

  const requestAirdrop = async () => {
    if (!address || !connection) return;
    setAirdropStatus("loading");
    setAirdropError(null);
    setAirdropTx(null);

    const MAX_RETRIES = 4;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          // Exponential backoff: 2s, 4s, 6s
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }

        const lamports = airdropAmount * LAMPORTS_PER_SOL;
        const signature = await connection.requestAirdrop(new PublicKey(address), lamports);

        // Confirm separately so a confirmation timeout doesn't block retries
        try {
          const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
          await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
        } catch {
          // Confirmation timeout is non-fatal — the tx may still land
        }

        setAirdropTx(signature);
        setAirdropStatus("success");

        const newLamports = await connection.getBalance(new PublicKey(address));
        setBalance(newLamports / LAMPORTS_PER_SOL);
        return;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (!isRateLimitError(lastError)) break; // non-rate-limit — stop retrying
      }
    }

    const isRateLimit = lastError ? isRateLimitError(lastError) : false;
    const isHeliusLimit = lastError?.message.includes("-32403") || lastError?.message.includes("faucet");
    setAirdropError(
      isHeliusLimit
        ? "Helius devnet: лимит 1 SOL в день исчерпан. Используйте faucet.solana.com ↓"
        : isRateLimit
          ? "RPC rate limit. Используйте faucet.solana.com ↓"
          : (lastError?.message ?? "Airdrop failed"),
    );
    setAirdropStatus("error");
  };

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleVerifyOnChain = async () => {
    if (!anchorWallet || !address) return;
    setVerifyStatus("loading");
    setVerifyError(null);
    try {
      const owner = new PublicKey(address);
      // Create UserProfile PDA if it doesn't exist yet
      const hasProfile = await userProfileExists(connection, anchorWallet, owner);
      if (!hasProfile) {
        await initializeUser(connection, anchorWallet);
      }
      await verifyUser(connection, anchorWallet, owner);
      setVerifyStatus("success");
      setOnChainVerified(true);
    } catch (err) {
      setVerifyError(err instanceof Error ? err.message : "Ошибка верификации");
      setVerifyStatus("error");
    }
  };

  const checkOnChainStatus = async () => {
    if (!anchorWallet || !address) return;
    const profile = await fetchUserProfile(connection, anchorWallet, new PublicKey(address));
    setOnChainVerified(profile?.isVerified ?? false);
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      <main
        className="relative z-10 rounded-t-[2.5rem]"
        style={{ background: "var(--main-bg)" }}
      >
        <div className="max-w-2xl mx-auto px-4 pt-10 pb-20">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #DC2626 0%, #9945FF 100%)" }}
            >
              <ShieldCheck size={20} className="text-white" strokeWidth={1.6} />
            </div>
            <div>
              <h1 className="text-2xl font-black" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>
                Admin Panel
              </h1>
              <p className="text-xs" style={{ color: "var(--text-3)" }}>Devnet tools · RentX</p>
            </div>
          </div>

          {/* Not connected warning */}
          {!connected && (
            <div
              className="rounded-[16px] px-5 py-4 mb-6 flex items-center gap-3"
              style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
            >
              <AlertCircle size={16} style={{ color: "#DC2626" }} />
              <p className="text-sm" style={{ color: "#DC2626" }}>
                Подключите кошелёк для использования инструментов
              </p>
            </div>
          )}

          {/* Wallet info card */}
          <div
            className="rounded-[20px] px-6 py-5 mb-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Wallet size={15} style={{ color: "var(--text-3)" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                Кошелёк
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-sm truncate" style={{ color: "var(--text-1)" }}>
                {address ?? "—"}
              </p>
              {address && (
                <button
                  onClick={copyAddress}
                  className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer hover:opacity-80"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                >
                  <Copy size={11} />
                  {copied ? "Скопировано!" : "Копировать"}
                </button>
              )}
            </div>

            {userProfile && (
              <div className="flex items-center gap-4 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={13} style={{ color: userProfile.isVerified ? "#059669" : "var(--text-4)" }} />
                  <span className="text-xs" style={{ color: userProfile.isVerified ? "#059669" : "var(--text-4)" }}>
                    {userProfile.isVerified ? "Верифицирован" : "Не верифицирован"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity size={13} style={{ color: authToken ? "#059669" : "var(--text-4)" }} />
                  <span className="text-xs" style={{ color: "var(--text-3)" }}>
                    JWT {authToken ? "активен" : "не получен"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Balance card */}
          <div
            className="rounded-[20px] px-6 py-5 mb-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Coins size={15} style={{ color: "var(--text-3)" }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                  Баланс (Devnet)
                </span>
              </div>
              <button
                onClick={fetchBalance}
                disabled={!connected || balanceLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer hover:opacity-80 disabled:opacity-40"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
              >
                <RefreshCw size={11} className={balanceLoading ? "animate-spin" : ""} />
                Обновить
              </button>
            </div>

            <p className="text-3xl font-black" style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}>
              {balanceLoading ? "…" : balance !== null ? `${balance.toFixed(4)} SOL` : "—"}
            </p>
          </div>

          {/* Airdrop card */}
          <div
            className="rounded-[20px] px-6 py-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <Zap size={15} style={{ color: "#9945FF" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                Airdrop SOL
              </span>
              <span
                className="ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(153,69,255,0.1)", color: "#9945FF", border: "1px solid rgba(153,69,255,0.2)" }}
              >
                Devnet only
              </span>
            </div>

            {/* Amount selector */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-3" style={{ color: "var(--text-2)" }}>Количество SOL</p>
              <div className="grid grid-cols-4 gap-2">
                {AIRDROP_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAirdropAmount(amt)}
                    className="py-2.5 rounded-[10px] text-sm font-bold transition-all cursor-pointer"
                    style={
                      airdropAmount === amt
                        ? { background: "linear-gradient(135deg, #9945FF 0%, #1B2BB8 100%)", color: "#fff" }
                        : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }
                    }
                  >
                    {amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom amount */}
            <div className="mb-5">
              <p className="text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>Или введите вручную</p>
              <input
                type="number"
                value={airdropAmount}
                onChange={(e) => setAirdropAmount(Math.min(10, Math.max(0.1, parseFloat(e.target.value) || 1)))}
                step="0.1"
                min="0.1"
                max="10"
                className="w-full rounded-[10px] px-4 py-2.5 text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)" }}
              />
              <p className="text-xs mt-1" style={{ color: "var(--text-4)" }}>Максимум 10 SOL за раз (devnet лимит)</p>
            </div>

            {/* Status messages */}
            {airdropStatus === "success" && airdropTx && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-[12px] px-4 py-3 mb-4"
                style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}
              >
                <CheckCircle2 size={15} className="shrink-0 mt-0.5" style={{ color: "#059669" }} />
                <div>
                  <p className="text-xs font-semibold mb-1" style={{ color: "#059669" }}>
                    {airdropAmount} SOL успешно зачислено!
                  </p>
                  <p className="font-mono text-[10px] break-all" style={{ color: "var(--text-3)" }}>
                    {airdropTx}
                  </p>
                </div>
              </motion.div>
            )}

            {airdropStatus === "error" && airdropError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-[12px] px-4 py-3 mb-4"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                <p className="text-xs" style={{ color: "#DC2626" }}>{airdropError}</p>
              </motion.div>
            )}

            <button
              onClick={requestAirdrop}
              disabled={!connected || airdropStatus === "loading"}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #9945FF 0%, #1B2BB8 100%)", boxShadow: "0 4px 18px rgba(153,69,255,0.3)" }}
            >
              {airdropStatus === "loading" ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Запрос airdrop…
                </>
              ) : (
                <>
                  <Zap size={15} />
                  Запросить {airdropAmount} SOL
                </>
              )}
            </button>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
              <span className="text-[11px]" style={{ color: "var(--text-4)" }}>или</span>
              <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
            </div>

            <a
              href={`https://faucet.solana.com/?address=${address ?? ""}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-semibold transition-all hover:opacity-80 cursor-pointer mt-3"
              style={{
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
              }}
            >
              <Zap size={14} />
              Открыть faucet.solana.com
            </a>
            <p className="text-[11px] text-center mt-1" style={{ color: "var(--text-4)" }}>
              Резервный способ — если RPC вернул 429
            </p>
          </div>

          {/* On-chain KYC verification */}
          <div
            className="rounded-[20px] px-6 py-5 mt-5"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
          >
            <div className="flex items-center gap-2 mb-5">
              <BadgeCheck size={15} style={{ color: "#059669" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-4)" }}>
                On-chain KYC
              </span>
              <span
                className="ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "1px solid rgba(5,150,105,0.2)" }}
              >
                test-mode
              </span>
            </div>

            <p className="text-xs mb-5" style={{ color: "var(--text-3)" }}>
              Верифицирует ваш кошелёк на-чейн через смарт-контракт. Требуется для аренды товаров.
            </p>

            {/* Current status */}
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold" style={{ color: "var(--text-2)" }}>Статус на-чейн</span>
              <div className="flex items-center gap-2">
                {onChainVerified === null ? (
                  <button
                    onClick={checkOnChainStatus}
                    disabled={!connected}
                    className="text-xs px-3 py-1.5 rounded-full cursor-pointer hover:opacity-80 disabled:opacity-40"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-2)" }}
                  >
                    Проверить
                  </button>
                ) : onChainVerified ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: "#059669" }}>
                    <CheckCircle2 size={13} /> Верифицирован
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-4)" }}>
                    <AlertCircle size={13} /> Не верифицирован
                  </span>
                )}
              </div>
            </div>

            {verifyStatus === "success" && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 rounded-[12px] px-4 py-3 mb-4"
                style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)" }}
              >
                <CheckCircle2 size={15} style={{ color: "#059669" }} />
                <p className="text-xs font-semibold" style={{ color: "#059669" }}>
                  Кошелёк верифицирован на-чейн!
                </p>
              </motion.div>
            )}

            {verifyStatus === "error" && verifyError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 rounded-[12px] px-4 py-3 mb-4"
                style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.2)" }}
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" style={{ color: "#DC2626" }} />
                <p className="text-xs" style={{ color: "#DC2626" }}>{verifyError}</p>
              </motion.div>
            )}

            <button
              onClick={handleVerifyOnChain}
              disabled={!connected || verifyStatus === "loading" || verifyStatus === "success"}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[12px] text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #059669 0%, #047857 100%)", boxShadow: "0 4px 18px rgba(5,150,105,0.3)" }}
            >
              {verifyStatus === "loading" ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Верификация…
                </>
              ) : verifyStatus === "success" ? (
                <>
                  <CheckCircle2 size={15} />
                  Верифицирован
                </>
              ) : (
                <>
                  <BadgeCheck size={15} />
                  Верифицировать кошелёк
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

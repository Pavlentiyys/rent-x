"use client";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Wallet, ExternalLink, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletContext } from "@/components/ui/WalletContext";
import { useRouter } from "next/navigation";

const WALLET_ICONS: Record<string, React.ReactNode> = {
  Phantom: (
    <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
      <rect width="128" height="128" rx="28" fill="#AB9FF2" />
      <path d="M110.584 64.964c0 24.8-20.133 44.91-44.961 44.91-24.83 0-44.962-20.11-44.962-44.91 0-24.8 20.132-44.91 44.962-44.91 24.828 0 44.961 20.11 44.961 44.91z" fill="white" />
      <path d="M65.623 48.5c-11.04 0-20 8.954-20 20s8.96 20 20 20c11.04 0 20-8.954 20-20s-8.96-20-20-20z" fill="#AB9FF2" />
      <ellipse cx="58.5" cy="62" rx="4" ry="5.5" fill="white" />
      <ellipse cx="74.5" cy="62" rx="4" ry="5.5" fill="white" />
    </svg>
  ),
  Solflare: (
    <svg viewBox="0 0 128 128" fill="none" className="w-full h-full">
      <rect width="128" height="128" rx="28" fill="#FC6B00" />
      <path d="M64 20L100 100H28L64 20Z" fill="white" opacity="0.9" />
      <path d="M64 45L85 90H43L64 45Z" fill="#FC6B00" />
    </svg>
  ),
};

export function WalletConnectModal() {
  const { isModalOpen, closeModal } = useWalletContext();
  const { wallets, select } = useWallet();
  const router = useRouter();
  const [deeplink, setDeeplink] = useState("");
  const [isLocal, setIsLocal] = useState(false);
  const [connectingName, setConnectingName] = useState<string | null>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    fetch("/api/host")
      .then((r) => r.json())
      .then(({ origin, isLocal: local }) => {
        setIsLocal(!!local);
        if (!local) {
          const appUrl = encodeURIComponent(origin);
          setDeeplink(`https://phantom.app/ul/browse/${appUrl}?ref=${appUrl}`);
        } else {
          setDeeplink("https://phantom.app/");
        }
      })
      .catch(() => {
        setIsLocal(true);
        setDeeplink("https://phantom.app/");
      });
  }, [isModalOpen]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeModal]);

  const handleWalletConnect = async (walletName: string) => {
    const found = wallets.find((w) => w.adapter.name === walletName);
    if (!found) return;
    try {
      setConnectingName(walletName);
      // select() updates React state — race condition if we call useWallet().connect() right after.
      // Call the adapter directly to avoid the stale-state issue.
      select(walletName as Parameters<typeof select>[0]);
      closeModal();
      await found.adapter.connect();
      router.push("/dashboard");
    } catch (err) {
      console.error("Connect failed:", err);
    } finally {
      setConnectingName(null);
    }
  };

  const supportedWallets = wallets.filter((w) =>
    ["Phantom", "Solflare"].includes(w.adapter.name)
  );

  return (
    <AnimatePresence>
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-100"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-101 left-1/2 top-1/2 w-95 max-w-[92vw]"
            style={{ x: "-50%", y: "-50%" }}
            initial={{ opacity: 0, scale: 0.94, y: "-44%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.94, y: "-44%" }}
            transition={{ duration: 0.22, ease: "easeOut" }}
          >
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: "var(--header-pill-bg)",
                border: "1px solid var(--header-pill-border)",
                boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid var(--divider)" }}
              >
                <div>
                  <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                    Подключить кошелёк
                  </h2>
                  <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
                    Выберите кошелёк или подключите через мобильный
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
                >
                  <X size={15} />
                </button>
              </div>

              <div className="px-6 py-6 space-y-5">
                {/* Desktop wallet buttons */}
                <div className="space-y-2.5">
                  <p className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--text-4)" }}>
                    Браузерное расширение
                  </p>
                  {supportedWallets.length > 0 ? (
                    supportedWallets.map((w) => (
                      <button
                        key={w.adapter.name}
                        onClick={() => handleWalletConnect(w.adapter.name)}
                        disabled={connectingName !== null}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-60"
                        style={{
                          background: "var(--surface)",
                          border: "1px solid var(--border)",
                          color: "var(--text-1)",
                        }}
                      >
                        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0">
                          {WALLET_ICONS[w.adapter.name] ?? (
                            <div className="w-full h-full bg-gray-400 rounded-xl" />
                          )}
                        </div>
                        <span className="flex-1 text-left">{w.adapter.name}</span>
                        {connectingName === w.adapter.name ? (
                          <span className="text-xs" style={{ color: "var(--text-3)" }}>
                            Подключение…
                          </span>
                        ) : (
                          <Wallet size={14} style={{ color: "var(--text-3)" }} />
                        )}
                      </button>
                    ))
                  ) : (
                    <div
                      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-3)" }}
                    >
                      <Wallet size={16} />
                      Расширение не обнаружено
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-auto text-xs underline"
                        style={{ color: "#AB9FF2" }}
                      >
                        Скачать
                      </a>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: "var(--divider)" }} />
                  <span className="text-[11px]" style={{ color: "var(--text-4)" }}>или</span>
                  <div className="flex-1 h-px" style={{ background: "var(--divider)" }} />
                </div>

                {/* Mobile QR */}
                <div>
                  <p className="text-[11px] uppercase tracking-widest font-semibold mb-3" style={{ color: "var(--text-4)" }}>
                    <Smartphone size={11} className="inline mr-1" />
                    Мобильный — Phantom
                  </p>
                  <div className="flex gap-4 items-start">
                    <div className="rounded-xl p-2.5 shrink-0" style={{ background: "#FFFFFF" }}>
                      {deeplink ? (
                        <QRCodeSVG
                          value={deeplink}
                          size={110}
                          bgColor="#FFFFFF"
                          fgColor="#05080F"
                          level="M"
                        />
                      ) : (
                        <div className="w-27.5 h-27.5 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      {isLocal ? (
                        <>
                          <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-2)" }}>
                            QR недоступен на localhost
                          </p>
                          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                            Для мобильного подключения задеплойте сайт или запустите с флагом{" "}
                            <code className="px-1 py-0.5 rounded text-[10px]" style={{ background: "var(--surface-2)" }}>
                              --hostname 0.0.0.0
                            </code>{" "}
                            и сканируйте с локального IP.
                          </p>
                          <p className="text-[11px]" style={{ color: "var(--text-4)" }}>
                            QR выше — скачать Phantom
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-medium leading-relaxed" style={{ color: "var(--text-2)" }}>
                            Откройте Phantom и отсканируйте QR
                          </p>
                          <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-3)" }}>
                            Сайт откроется внутри Phantom. Кошелёк привяжется автоматически.
                          </p>
                        </>
                      )}
                      <a
                        href="https://phantom.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[11px]"
                        style={{ color: "#AB9FF2" }}
                      >
                        <ExternalLink size={10} />
                        Нет Phantom? Скачать
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

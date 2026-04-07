"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, FileText, ExternalLink, X, Loader2 } from "lucide-react";
import { useWalletContext } from "@/components/ui/WalletContext";
import { updateUserProfile } from "@/lib/api-client";

export function KycModal() {
  const { needsVerification, authToken, refreshProfile } = useWalletContext();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  const isOpen = needsVerification && !dismissed;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken || !url.trim()) return;

    setError(null);
    setLoading(true);
    try {
      await updateUserProfile(authToken, { documentUrl: url.trim() });
      await refreshProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сохранения");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(6px)" }}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="w-full max-w-md rounded-[28px] px-8 py-8 relative"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.35)",
              }}
            >
              {/* Dismiss */}
              <button
                onClick={() => setDismissed(true)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center opacity-50 hover:opacity-80 transition-opacity cursor-pointer"
                style={{ background: "var(--surface-2)" }}
              >
                <X size={14} style={{ color: "var(--text-2)" }} />
              </button>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                style={{ background: "linear-gradient(135deg, #9945FF22 0%, #14F19522 100%)", border: "1px solid #9945FF44" }}
              >
                <ShieldCheck size={26} style={{ color: "#9945FF" }} strokeWidth={1.6} />
              </div>

              <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text-1)", letterSpacing: "-0.02em" }}>
                Верификация личности
              </h2>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "var(--text-3)" }}>
                Для начала аренды необходимо подтвердить личность. Загрузите документ в Google Drive, Dropbox или любой другой облачный сервис и вставьте ссылку ниже.
              </p>

              <div
                className="flex items-start gap-3 rounded-[14px] px-4 py-3 mb-6"
                style={{ background: "rgba(153,69,255,0.06)", border: "1px solid rgba(153,69,255,0.15)" }}
              >
                <FileText size={16} className="shrink-0 mt-0.5" style={{ color: "#9945FF" }} />
                <p className="text-xs leading-relaxed" style={{ color: "var(--text-3)" }}>
                  Принимаются: паспорт, удостоверение личности, водительское удостоверение. Документ должен быть читаемым.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text-2)" }}>
                    Ссылка на документ
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      required
                      className="w-full rounded-[12px] px-4 py-3 pr-10 text-sm outline-none transition-all"
                      style={{
                        background: "var(--surface-2)",
                        border: `1px solid ${error ? "#DC2626" : "var(--border)"}`,
                        color: "var(--text-1)",
                      }}
                    />
                    <ExternalLink
                      size={14}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: "var(--text-4)" }}
                    />
                  </div>
                  {error && <p className="text-xs mt-1.5" style={{ color: "#DC2626" }}>{error}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading || !url.trim()}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-[12px] text-sm font-bold text-white transition-all disabled:opacity-50 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #9945FF 0%, #1B2BB8 100%)" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Сохранение…
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      Подтвердить
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setDismissed(true)}
                  className="w-full py-2.5 text-xs font-medium rounded-[12px] transition-opacity hover:opacity-70 cursor-pointer"
                  style={{ color: "var(--text-3)" }}
                >
                  Пропустить — сделаю позже
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

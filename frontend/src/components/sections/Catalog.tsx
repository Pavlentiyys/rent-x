"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useWalletContext } from "@/components/ui/WalletContext";
import { useLanguage } from "@/components/LanguageProvider";
import { fetchPosts, type Post } from "@/lib/api-client";

type RentState = "idle" | "signing" | "done";

function CatalogCard({ item, index, inView }: { item: Post; index: number; inView: boolean }) {
  const { address, openModal } = useWalletContext();
  const { t } = useLanguage();
  const [rentState, setRentState] = useState<RentState>("idle");

  const imageUrl = item.images?.[0]?.url || `https://picsum.photos/seed/item-${item.id}/400/220`;
  const isAvailable = item.status === "active";

  const handleRent = async () => {
    if (!address) { openModal(); return; }
    if (!isAvailable) return;
    setRentState("signing");
    await new Promise((r) => setTimeout(r, 1800));
    setRentState("done");
    setTimeout(() => setRentState("idle"), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07, ease: "easeOut" }}
      whileHover={isAvailable ? { y: -4 } : {}}
      className="group rounded-[28px] overflow-hidden"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
        backdropFilter: "var(--card-blur)",
        WebkitBackdropFilter: "var(--card-blur)",
        transition: "box-shadow 0.25s ease, transform 0.25s ease",
      }}
    >
      {/* image */}
      <div className="relative h-44 overflow-hidden" style={{ background: "var(--surface-2)", position: "relative" }}>
        <Image
          src={imageUrl}
          alt={item.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to top, var(--main-bg) 0%, transparent 50%)", opacity: 0.5 }}
        />
        <div className="absolute top-3 left-3">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-2)",
              backdropFilter: "blur(8px)",
            }}
          >
            {item.category}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          {isAvailable ? (
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              {t.catalog.available}
            </span>
          ) : (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--surface)", color: "var(--text-3)" }}
            >
              {t.catalog.rented}
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <h3 className="font-bold text-[15px] mb-3 leading-snug" style={{ color: "var(--text-1)" }}>
          {item.title}
        </h3>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: "var(--text-1)" }}>
              {item.pricePerDay} SOL
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>{t.catalog.perDay}</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>
              {item.deposit} SOL
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>{t.catalog.deposit}</div>
          </div>
        </div>

        <button
          onClick={handleRent}
          disabled={!isAvailable || rentState === "signing"}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={
            !isAvailable
              ? { background: "var(--surface)", color: "var(--text-4)", cursor: "not-allowed" }
              : rentState === "done"
              ? { background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }
              : rentState === "signing"
              ? { background: "var(--surface)", color: "var(--text-2)", cursor: "wait" }
              : { background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-1)" }
          }
        >
          {rentState === "signing" && (
            <span className="inline-flex items-center gap-2">
              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              {t.catalog.signing}
            </span>
          )}
          {rentState === "done" && t.catalog.done}
          {rentState === "idle" && (!isAvailable ? t.catalog.unavailable : t.catalog.rent)}
        </button>
      </div>
    </motion.div>
  );
}

export const Catalog = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { t } = useLanguage();
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView || items.length > 0) return;

    fetchPosts(1, 6)
      .then((res) => setItems(res.data))
      .catch((err) => {
        console.error("Failed to fetch catalog items:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [inView, items]);

  return (
    <section id="catalog" ref={ref} className="py-20 px-6" style={{ borderTop: "1px solid var(--divider)" }}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-3"
            style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}
          >
            {t.catalog.title}
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
            {t.catalog.subtitle}
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
          </div>
        ) : items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item, i) => (
              <CatalogCard key={item.id} item={item} index={i} inView={inView} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12" style={{ color: "var(--text-3)" }}>
            {t.catalog.empty}
          </div>
        )}
      </div>
    </section>
  );
};

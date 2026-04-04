"use client";
import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import { useWalletContext } from "@/components/ui/WalletContext";

const items = [
  { id: 1, name: "DJI Mavic 3 Pro",       category: "Дроны",        price: 0.8,  deposit: 5,   status: "available" as const, seed: "drone-dji" },
  { id: 2, name: "Sony A7 IV",            category: "Фото / Видео", price: 0.5,  deposit: 4,   status: "available" as const, seed: "camera-sony" },
  { id: 3, name: "MacBook Pro M3",        category: "Электроника",  price: 0.6,  deposit: 6,   status: "rented" as const,    seed: "laptop-apple" },
  { id: 4, name: "Электросамокат Xiaomi", category: "Транспорт",    price: 0.15, deposit: 1,   status: "available" as const, seed: "scooter-city" },
  { id: 5, name: "Горный велосипед",      category: "Транспорт",    price: 0.1,  deposit: 0.8, status: "available" as const, seed: "bicycle-mountain" },
  { id: 6, name: "Палатка Coleman",       category: "Туризм",       price: 0.08, deposit: 0.5, status: "available" as const, seed: "tent-camping" },
];

type RentState = "idle" | "signing" | "done";

function CatalogCard({ item, index, inView }: { item: (typeof items)[0]; index: number; inView: boolean }) {
  const { address, openModal } = useWalletContext();
  const [rentState, setRentState] = useState<RentState>("idle");

  const handleRent = async () => {
    if (!address) { openModal(); return; }
    if (item.status === "rented") return;
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
      whileHover={item.status === "available" ? { y: -4 } : {}}
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
      <div className="relative h-44 overflow-hidden" style={{ background: "var(--surface-2)" }}>
        <Image
          src={`https://picsum.photos/seed/${item.seed}/400/220`}
          alt={item.name}
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
          {item.status === "available" ? (
            <span
              className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669" }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Доступно
            </span>
          ) : (
            <span
              className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--surface)", color: "var(--text-3)" }}
            >
              Арендовано
            </span>
          )}
        </div>
      </div>

      {/* body */}
      <div className="p-4">
        <h3 className="font-bold text-[15px] mb-3 leading-snug" style={{ color: "var(--text-1)" }}>
          {item.name}
        </h3>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: "var(--text-1)" }}>
              {item.price} SOL
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>в день</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>
              {item.deposit} SOL
            </div>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>залог</div>
          </div>
        </div>

        <button
          onClick={handleRent}
          disabled={item.status === "rented" || rentState === "signing"}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
          style={
            item.status === "rented"
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
              Подпись Phantom…
            </span>
          )}
          {rentState === "done" && "✓ Аренда оформлена!"}
          {rentState === "idle" && (item.status === "rented" ? "Недоступно" : "Арендовать")}
        </button>
      </div>
    </motion.div>
  );
}

export const Catalog = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

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
            Каталог товаров
          </h2>
          <p className="text-sm max-w-md mx-auto" style={{ color: "var(--text-3)" }}>
            Каждая аренда — это NFT на Solana. Верифицируй QR-кодом, перепродай на маркетплейсе.
          </p>
        </motion.div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <CatalogCard key={item.id} item={item} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
};

"use client";
import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpRight, Star } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { useWalletContext } from "@/components/ui/WalletContext";

const LISTINGS = [
  { id: 1,  name: "DJI Mavic 3 Pro",         category: "Дроны",        price: 0.8,  deposit: 5.0, rating: 4.9, reviews: 34, status: "available", seed: "drone-dji",       seller: "7xK3…mP9" },
  { id: 2,  name: "Sony A7 IV",               category: "Фото / Видео", price: 0.5,  deposit: 4.0, rating: 4.8, reviews: 21, status: "available", seed: "camera-sony",    seller: "Bz9n…4aW" },
  { id: 3,  name: "MacBook Pro M3",           category: "Электроника",  price: 0.6,  deposit: 6.0, rating: 5.0, reviews: 12, status: "rented",    seed: "laptop-apple",  seller: "Qr7p…2xK" },
  { id: 4,  name: "Электросамокат Xiaomi",    category: "Транспорт",    price: 0.15, deposit: 1.0, rating: 4.7, reviews: 58, status: "available", seed: "scooter-city",  seller: "Km9z…5bN" },
  { id: 5,  name: "Горный велосипед Trek",    category: "Транспорт",    price: 0.1,  deposit: 0.8, rating: 4.6, reviews: 19, status: "available", seed: "bicycle-mountain", seller: "Xw4p…8hR" },
  { id: 6,  name: "Палатка Coleman 4",        category: "Туризм",       price: 0.08, deposit: 0.5, rating: 4.8, reviews: 41, status: "available", seed: "tent-camping",  seller: "3rTy…6mW" },
  { id: 7,  name: "GoPro Hero 12",            category: "Фото / Видео", price: 0.12, deposit: 1.2, rating: 4.9, reviews: 63, status: "available", seed: "gopro-action",  seller: "9sLa…1nK" },
  { id: 8,  name: "PlayStation 5",            category: "Электроника",  price: 0.09, deposit: 0.8, rating: 4.7, reviews: 27, status: "available", seed: "gaming-ps5",    seller: "2jFd…4pC" },
  { id: 9,  name: "Сноуборд Burton",          category: "Туризм",       price: 0.2,  deposit: 1.5, rating: 4.5, reviews: 16, status: "rented",    seed: "snowboard-winter", seller: "7xK3…mP9" },
  { id: 10, name: "Квадроцикл ATV 250",       category: "Транспорт",    price: 1.2,  deposit: 8.0, rating: 4.8, reviews: 9,  status: "available", seed: "atv-offroad",   seller: "Bz9n…4aW" },
  { id: 11, name: "Canon EOS R5",             category: "Фото / Видео", price: 0.7,  deposit: 7.0, rating: 5.0, reviews: 18, status: "available", seed: "camera-canon",  seller: "Qr7p…2xK" },
  { id: 12, name: "iPad Pro 12.9",            category: "Электроника",  price: 0.18, deposit: 2.0, rating: 4.6, reviews: 33, status: "available", seed: "tablet-ipad",   seller: "Km9z…5bN" },
];

const CATEGORIES = ["Все", "Фото / Видео", "Электроника", "Транспорт", "Дроны", "Туризм"];

const SORTS = [
  { label: "По цене ↑",   value: "price_asc"  },
  { label: "По цене ↓",   value: "price_desc" },
  { label: "По рейтингу", value: "rating"     },
  { label: "Новые",       value: "new"        },
];

type RentState = "idle" | "signing" | "done";

function ListingCard({ item, index }: { item: typeof LISTINGS[0]; index: number }) {
  const { address, openModal } = useWalletContext();
  const [rentState, setRentState] = useState<RentState>("idle");

  const handleRent = async () => {
    if (item.status === "rented") return;
    if (!address) { openModal(); return; }
    setRentState("signing");
    await new Promise((r) => setTimeout(r, 1800));
    setRentState("done");
    setTimeout(() => setRentState("idle"), 3000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      whileHover={item.status === "available" ? { y: -3 } : {}}
      className="rounded-[24px] overflow-hidden flex flex-col"
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        boxShadow: "var(--card-shadow)",
      }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0" style={{ background: "var(--surface-2)" }}>
        <Image
          src={`https://picsum.photos/seed/${item.seed}/400/220`}
          alt={item.name}
          fill
          className="object-cover hover:scale-105 transition-transform duration-500"
          unoptimized
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, var(--main-bg) 0%, transparent 55%)", opacity: 0.45 }} />

        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)", backdropFilter: "blur(8px)" }}>
            {item.category}
          </span>
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          {item.status === "available" ? (
            <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#059669" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Доступно
            </span>
          ) : (
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{ background: "var(--surface)", color: "var(--text-3)" }}>
              Арендовано
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-[15px] mb-1 leading-snug" style={{ color: "var(--text-1)" }}>
          {item.name}
        </h3>

        {/* Rating + seller */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star size={11} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-2)" }}>{item.rating}</span>
            <span className="text-[11px]" style={{ color: "var(--text-4)" }}>({item.reviews})</span>
          </div>
          <span className="font-mono text-[10px]" style={{ color: "var(--text-4)" }}>{item.seller}</span>
        </div>

        {/* Price */}
        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: "var(--text-1)" }}>
              {item.price} SOL
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>в день</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>{item.deposit} SOL</div>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>залог</div>
          </div>
        </div>

        {/* Rent button */}
        <button
          onClick={handleRent}
          disabled={item.status === "rented" || rentState === "signing"}
          className="w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed"
          style={
            item.status === "rented"
              ? { background: "var(--surface)", color: "var(--text-4)" }
              : rentState === "done"
              ? { background: "rgba(16,185,129,0.12)", color: "#059669", border: "1px solid rgba(16,185,129,0.25)" }
              : rentState === "signing"
              ? { background: "var(--surface)", color: "var(--text-2)", cursor: "wait" }
              : {
                  background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)",
                  color: "#fff",
                  boxShadow: "0 2px 10px rgba(27,43,184,0.3)",
                }
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
          {rentState === "done"  && "✓ Аренда оформлена!"}
          {rentState === "idle"  && (item.status === "rented" ? "Недоступно" : !address ? "Подключить кошелёк" : "Арендовать")}
        </button>
      </div>
    </motion.div>
  );
}

export default function MarketplacePage() {
  const [query,   setQuery]  = useState("");
  const [cat,     setCat]    = useState("Все");
  const [sort,    setSort]   = useState("rating");
  const [filters, setFilters] = useState(false);

  let items = LISTINGS
    .filter((i) => cat === "Все" || i.category === cat)
    .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()));

  if (sort === "price_asc")  items = [...items].sort((a, b) => a.price - b.price);
  if (sort === "price_desc") items = [...items].sort((a, b) => b.price - a.price);
  if (sort === "rating")     items = [...items].sort((a, b) => b.rating - a.rating);

  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      {/* Page header */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}>
              Маркетплейс
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-3)" }}>
              {items.length} объявлений · NFT-аренда на Solana
            </p>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilters((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all"
              style={{
                background: filters ? "rgba(27,43,184,0.1)" : "var(--surface)",
                border: `1px solid ${filters ? "rgba(27,43,184,0.3)" : "var(--border)"}`,
                color: filters ? "#1B2BB8" : "var(--text-2)",
              }}
            >
              <SlidersHorizontal size={13} />
              Фильтры
            </button>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-2)",
                outline: "none",
              }}
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-4)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск по названию…"
            className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm outline-none transition-all"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
            }}
          />
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-2 flex-wrap mb-8">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              style={
                cat === c
                  ? { background: "linear-gradient(135deg, #2B44D0, #1B2BB8)", color: "#fff", boxShadow: "0 2px 8px rgba(27,43,184,0.3)" }
                  : { background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-3)" }
              }
            >
              {c}
            </button>
          ))}
        </div>

        {/* Grid */}
        {items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-16">
            {items.map((item, i) => (
              <ListingCard key={item.id} item={item} index={i} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-sm font-medium" style={{ color: "var(--text-3)" }}>Ничего не найдено</p>
            <button onClick={() => { setQuery(""); setCat("Все"); }}
              className="text-xs px-4 py-2 rounded-full cursor-pointer"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}>
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* List your item CTA */}
      <div style={{ borderTop: "1px solid var(--divider)" }}>
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base" style={{ color: "var(--text-1)" }}>Есть что сдать в аренду?</p>
            <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>Разместите объявление и зарабатывайте SOL</p>
          </div>
          <button
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold cursor-pointer"
            style={{
              background: "linear-gradient(135deg, #2B44D0, #1B2BB8)",
              color: "#fff",
              boxShadow: "0 2px 12px rgba(27,43,184,0.35)",
            }}
          >
            Разместить объявление <ArrowUpRight size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

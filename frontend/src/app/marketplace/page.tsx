"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpRight, Package } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { fetchPosts, type Post } from "@/lib/api-client";

function ListingCard({ item, index }: { item: Post; index: number }) {
  const imageUrl = item.images?.[0]?.url;
  const isAvailable = item.status === "active";
  const shortOwner = item.owner?.walletAddress
    ? item.owner.walletAddress.slice(0, 4) + "…" + item.owner.walletAddress.slice(-4)
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.04, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="rounded-[24px] overflow-hidden flex flex-col"
      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--card-shadow)" }}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden shrink-0" style={{ background: "var(--surface-2)" }}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            fill
            className="object-cover hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Package size={36} style={{ color: "var(--text-4)" }} />
          </div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.18) 0%, transparent 55%)" }} />

        {/* Category */}
        <div className="absolute top-3 left-3">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)", backdropFilter: "blur(8px)" }}>
            {item.category}
          </span>
        </div>

        {/* Status */}
        <div className="absolute top-3 right-3">
          {isAvailable ? (
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
          {item.title}
        </h3>

        {shortOwner && (
          <p className="font-mono text-[10px] mb-3" style={{ color: "var(--text-4)" }}>{shortOwner}</p>
        )}

        {/* Price */}
        <div className="flex items-end justify-between mb-4 mt-auto">
          <div>
            <div className="font-bold text-lg leading-none" style={{ color: "var(--text-1)" }}>
              {item.pricePerDay} SOL
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: "var(--text-3)" }}>в день</div>
          </div>
          <div className="text-right">
            <div className="text-[13px] font-semibold" style={{ color: "var(--text-2)" }}>{item.depositAmount} SOL</div>
            <div className="text-[11px]" style={{ color: "var(--text-3)" }}>залог</div>
          </div>
        </div>

        {/* View / Rent button → listing detail */}
        <Link
          href={`/listing/${item.id}`}
          className="w-full py-2.5 rounded-xl text-sm font-semibold text-center transition-all duration-200 cursor-pointer"
          style={
            isAvailable
              ? { background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)", color: "#fff", boxShadow: "0 2px 10px rgba(27,43,184,0.3)" }
              : { background: "var(--surface-2)", color: "var(--text-4)", border: "1px solid var(--border)" }
          }
        >
          {isAvailable ? "Арендовать" : "Просмотреть"}
        </Link>
      </div>
    </motion.div>
  );
}

const CATEGORIES = ["Все"];
const SORTS = [
  { label: "По цене ↑",   value: "price_asc"  },
  { label: "По цене ↓",   value: "price_desc" },
  { label: "По рейтингу", value: "rating"     },
  { label: "Новые",       value: "new"        },
];

export default function MarketplacePage() {
  const [query,   setQuery]  = useState("");
  const [cat,     setCat]    = useState("Все");
  const [sort,    setSort]   = useState("rating");
  const [filters, setFilters] = useState(false);
  const [items, setItems] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts(1, 50)
      .then((res) => {
        setItems(res.items);
        // Extract unique categories
        const cats = Array.from(new Set(res.items.map(p => p.category)));
        if (cats.length > 0) {
          const allCats = ["Все", ...cats];
          // Note: We'd need to update categories state here but keeping it simple for now
        }
      })
      .catch((err) => {
        console.error("Failed to fetch marketplace items:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, []);

  let filtered = items
    .filter((i) => cat === "Все" || i.category === cat)
    .filter((i) => i.title.toLowerCase().includes(query.toLowerCase()));

  if (sort === "price_asc")  filtered = [...filtered].sort((a, b) => parseFloat(a.pricePerDay) - parseFloat(b.pricePerDay));
  if (sort === "price_desc") filtered = [...filtered].sort((a, b) => parseFloat(b.pricePerDay) - parseFloat(a.pricePerDay));

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

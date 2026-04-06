"use client";
import Link from "next/link";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useLanguage, type Lang } from "@/components/LanguageProvider";
import { useWalletContext } from "@/components/ui/WalletContext";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";

const LANGS: Lang[] = ["en", "kz", "ru"];

export const Header = () => {
  const { theme, toggleTheme } = useTheme();
  const { address, connecting, openModal, disconnect } = useWalletContext();
  const { lang, setLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  const short = address ? `${address.slice(0, 4)}…${address.slice(-4)}` : null;

  return (
    <header className="sticky top-0 z-50 w-full px-4 py-3">
      <motion.div
        className="mx-auto flex items-center gap-3 h-12"
        animate={{ maxWidth: scrolled ? "560px" : "1280px" }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* floating pill */}
        <div
          className="flex-1 flex items-center justify-between px-5 h-full rounded-full overflow-hidden"
          style={{
            background: "var(--header-pill-bg)",
            boxShadow: "var(--header-pill-shadow)",
            border: "1px solid var(--header-pill-border)",
            backdropFilter: "var(--card-blur) var(--card-saturate)",
            WebkitBackdropFilter: "var(--card-blur) var(--card-saturate)",
          }}
        >
          {/* logo */}
          <Link href="/" className="flex items-center shrink-0">
            <span className="text-[15px] font-bold tracking-tight text-gray-900 dark:text-white">
              RentX
            </span>
          </Link>

          {/* navigation hides on scroll */}
          <AnimatePresence>
            {!scrolled && (
              <motion.nav
                className="hidden md:flex items-center gap-7"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden", whiteSpace: "nowrap" }}
              >
                {[
                  { href: "/#catalog",      label: t.nav.catalog },
                  { href: "/marketplace",   label: t.nav.marketplace },
                  { href: "/#how-it-works", label: t.nav.forHosts },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-sm font-medium transition-colors duration-150 cursor-pointer"
                    style={{ color: "var(--text-3)" }}
                  >
                    {label}
                  </Link>
                ))}
              </motion.nav>
            )}
          </AnimatePresence>

          {/* connect Wallet / connected */}
          {address ? (
            <motion.button
              whileHover={{ scale: 1.04, opacity: 0.9 }}
              whileTap={{ scale: 0.96 }}
              onClick={disconnect}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 cursor-pointer"
              style={{
                background: "rgba(16,185,129,0.1)",
                border: "1px solid rgba(16,185,129,0.25)",
                color: "#059669",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0" />
              <span className="font-mono">{short}</span>
              <LogOut size={12} />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 4px 18px rgba(27,43,184,0.55)" }}
              whileTap={{ scale: 0.96 }}
              onClick={openModal}
              disabled={connecting}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-white disabled:opacity-60 shrink-0 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)",
                boxShadow: "0 2px 10px rgba(27,43,184,0.35)",
              }}
            >
              {/* solana logo official 3-bar mark */}
              <svg width="16" height="13" viewBox="0 0 96 78" fill="none" className="shrink-0">
                <defs>
                  <linearGradient id="sg" x1="0" y1="39" x2="96" y2="39" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9945FF"/>
                    <stop offset="0.5" stopColor="#00C2FF"/>
                    <stop offset="1" stopColor="#14F195"/>
                  </linearGradient>
                </defs>
                <path d="M16 0h72a6 6 0 0 1 4.2 10.2L78.4 24H6.4A6 6 0 0 1 2.2 13.8L16 0Z" fill="url(#sg)"/>
                <path d="M80 27H8a6 6 0 0 0-4.2 10.2L17.6 51h72a6 6 0 0 0 4.2-10.2L80 27Z" fill="url(#sg)"/>
                <path d="M16 54h72a6 6 0 0 1 4.2 10.2L78.4 78H6.4A6 6 0 0 1 2.2 67.8L16 54Z" fill="url(#sg)"/>
              </svg>
              {connecting ? t.wallet.connecting : t.wallet.connect}
            </motion.button>
          )}
        </div>

        {/* language switcher */}
        <div
          className="flex items-center h-12 rounded-full px-1 gap-0.5 shrink-0"
          style={{
            background: "var(--header-pill-bg)",
            boxShadow: "var(--header-pill-shadow)",
            border: "1px solid var(--header-pill-border)",
            backdropFilter: "var(--card-blur) var(--card-saturate)",
            WebkitBackdropFilter: "var(--card-blur) var(--card-saturate)",
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className="w-9 h-9 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer"
              style={
                lang === l
                  ? {
                      background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)",
                      color: "#fff",
                      boxShadow: "0 2px 8px rgba(27,43,184,0.35)",
                    }
                  : { color: "var(--text-3)" }
              }
            >
              {l}
            </button>
          ))}
        </div>

        {/* theme toggle */}
        <motion.button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          style={{
            background: "var(--header-pill-bg)",
            boxShadow: "var(--header-pill-shadow)",
            border: "1px solid var(--header-pill-border)",
            color: "var(--text-2)",
            backdropFilter: "var(--card-blur) var(--card-saturate)",
            WebkitBackdropFilter: "var(--card-blur) var(--card-saturate)",
          }}
        >
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </motion.button>
      </motion.div>
    </header>
  );
};

"use client";
import dynamic from "next/dynamic";

// dynamic + ssr:false must live inside a Client Component
const SolanaCoins = dynamic(
  () => import("@/components/ui/SolanaCoins").then((m) => m.SolanaCoins),
  { ssr: false }
);

export function SolanaCoinsWrapper() {
  return <SolanaCoins />;
}

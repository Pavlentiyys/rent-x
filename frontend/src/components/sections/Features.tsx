"use client";
import { Shield, Smartphone, ArrowLeftRight, Coins } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: Shield,
    title: "Неизменяемое Владение",
    description: "Каждая аренда записывается как NFT на Solana. Это ваш ключ — его нельзя подделать или отозвать.",
  },
  {
    icon: Smartphone,
    title: "Мгновенная Верификация",
    description: "Никаких бумажных ваучеров. Ваш кошелёк — ваш ключ. Верифицируйте аренду по простому QR.",
  },
  {
    icon: ArrowLeftRight,
    title: "Вторичный Рынок",
    description: "Изменились планы? Не отменяйте. Продайте NFT аренды на P2P-маркетплейсе и верните деньги.",
  },
  {
    icon: Coins,
    title: "DeFi Интеграция",
    description: "Используйте NFT аренды как залог или зарабатывайте награды за частые поездки.",
  },
];

const marqueeItems = [...features, ...features];

export const Features = () => {
  return (
    <section id="features" className="py-20" style={{ borderTop: "1px solid var(--divider)" }}>
      <div className="max-w-5xl mx-auto px-6 mb-14 text-center">
        <h2
          className="text-3xl md:text-4xl font-bold"
          style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}
        >
          Ключевые Возможности
        </h2>
      </div>

      <div className="overflow-hidden mask-fade-edges">
        <div className="flex animate-marquee" style={{ width: "max-content", gap: "1.5rem" }}>
          {marqueeItems.map(({ icon: Icon, title, description }, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center shrink-0 w-72 px-7 py-8 rounded-[28px]"
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                boxShadow: "var(--card-shadow)",
                backdropFilter: "var(--card-blur)",
                WebkitBackdropFilter: "var(--card-blur)",
              }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shrink-0"
                style={{
                  background: "linear-gradient(135deg, #3B5BFF 0%, #1B36D8 50%, #0F22A8 100%)",
                  boxShadow: "0 8px 28px rgba(27,54,216,0.35)",
                }}
              >
                <Icon size={34} className="text-white" strokeWidth={1.5} />
              </div>
              <h3
                className="font-bold text-base mb-3 leading-snug"
                style={{ letterSpacing: "-0.01em", color: "var(--text-1)" }}
              >
                {title}
              </h3>
              <p className="text-[12px] leading-relaxed tracking-wide" style={{ color: "var(--text-3)" }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

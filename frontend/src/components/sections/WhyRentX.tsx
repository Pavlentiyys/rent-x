import { X, Check } from "lucide-react";

const traditional = [
  "Высокие комиссии платформ (15–20%)",
  "Невозвратные отмены аренды",
  "Централизованный контроль",
  "Региональные платёжные барьеры",
];

const rentx = [
  "Минимальные сетевые комиссии",
  "Продай NFT аренды и верни деньги",
  "Истинное владение (On-chain)",
  "Глобальные платежи в SOL/USDC",
];

export const WhyRentX = () => {
  return (
    <section id="why-rentx" className="px-6 py-20">
      <div className="max-w-3xl mx-auto">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-14"
          style={{ letterSpacing: "-0.02em", color: "var(--text-1)" }}
        >
          Почему RentX?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-0">
          {/* Traditional */}
          <div className="pr-0 md:pr-10 pb-10 md:pb-0">
            <h3 className="text-lg font-bold mb-7" style={{ color: "var(--text-1)" }}>
              Традиционная аренда
            </h3>
            <ul className="space-y-5">
              {traditional.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.25)" }}
                  >
                    <X size={20} className="text-red-500" strokeWidth={3} />
                  </div>
                  <span className="text-lg leading-snug" style={{ color: "var(--text-2)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* vertical divider */}
          <div className="hidden md:block w-px self-stretch" style={{ background: "var(--divider)" }} />
          {/* Horizontal divider (mobile) */}
          <div className="block md:hidden h-px w-full my-8" style={{ background: "var(--divider)" }} />

          {/* rentx */}
          <div className="pl-0 md:pl-10">
            <h3 className="text-lg font-bold mb-7" style={{ color: "var(--text-1)" }}>
              RentX (Web3)
            </h3>
            <ul className="space-y-5">
              {rentx.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
                  >
                    <Check size={20} strokeWidth={3} style={{ color: "var(--text-1)" }} />
                  </div>
                  <span className="text-lg leading-snug" style={{ color: "var(--text-2)" }}>
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useLanguage } from "@/components/LanguageProvider";

function CountUp({ target, suffix, active }: { target: number; suffix: string; active: boolean }) {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (!active) return;
    const duration = 1400;
    const start = performance.now();
    const raf = (now: number) => {
      const t = Math.min((now - start) / duration, 1);
      setCurrent(Math.floor((1 - Math.pow(1 - t, 3)) * target));
      if (t < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  }, [active, target]);
  return <span>{current.toLocaleString("ru-RU")}{suffix}</span>;
}

export const Stats = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const { t } = useLanguage();

  const stats = [
    { value: 400,   suffix: "мс",   label: t.stats.finalization },
    { value: null,  display: "~$0",  label: t.stats.fee },
    { value: 1240,  suffix: "+",     label: t.stats.activeRentals },
    { value: 48,    suffix: "k SOL", label: t.stats.escrowCollateral },
  ];

  return (
    <section ref={ref} className="py-8 px-4" style={{ borderBottom: "1px solid var(--divider)" }}>
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(({ value, display, suffix, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.45, delay: i * 0.08, ease: "easeOut" }}
            className="flex flex-col items-start px-5 py-5 rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <div
              className="text-3xl md:text-[2rem] font-bold leading-none mb-2"
              style={{ color: "var(--text-1)", letterSpacing: "-0.03em" }}
            >
              {display ?? <CountUp target={value!} suffix={suffix ?? ""} active={inView} />}
            </div>
            <div className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
              {label}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

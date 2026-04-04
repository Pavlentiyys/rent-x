"use client";
import { motion } from "framer-motion";
import { useWalletContext } from "@/components/ui/WalletContext";
import { SolanaCoinsWrapper } from "@/components/ui/SolanaCoinsWrapper";

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: "easeOut" as const },
});

export const Hero = () => {
  const { openModal } = useWalletContext();

  return (
    <section
      className="relative overflow-hidden text-center px-6"
      style={{
        paddingTop: "100px",
        paddingBottom: "180px",
        background: "var(--hero-bg)",
      }}
    >
      {/* 3d solana coins */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1 }}>
        <SolanaCoinsWrapper />
      </div>

      {/* animated background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* rotating aurora ring */}
        <div
          className="animate-aurora absolute"
          style={{
            width: "900px",
            height: "900px",
            top: "50%",
            left: "50%",
            marginTop: "-450px",
            marginLeft: "-450px",
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(15,42,210,0.55) 20%, rgba(60,90,255,0.35) 40%, transparent 55%, rgba(10,20,140,0.4) 75%, transparent 100%)",
            filter: "blur(60px)",
          }}
        />
        {/* orb A left */}
        <div
          className="animate-orb-a absolute"
          style={{
            width: "500px",
            height: "500px",
            top: "10%",
            left: "5%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(25,55,220,0.55) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* orrb B  right */}
        <div
          className="animate-orb-b absolute"
          style={{
            width: "450px",
            height: "450px",
            top: "20%",
            right: "5%",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(80,30,200,0.45) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
        />
        {/* orb C bottom anchor */}
        <div
          className="animate-orb-c absolute"
          style={{
            width: "700px",
            height: "400px",
            bottom: "-60px",
            left: "50%",
            transform: "translateX(-50%)",
            borderRadius: "50%",
            background:
              "radial-gradient(ellipse, rgba(15,42,210,0.7) 0%, rgba(8,20,100,0.3) 50%, transparent 72%)",
            filter: "blur(50px)",
          }}
        />
        {/* vignette keeps text readable */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 30%, var(--hero-bg) 100%)",
          }}
        />
      </div>

      {/* content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <motion.h1
          {...fade(0.05)}
          className="font-bold leading-tight mb-5"
          style={{
            fontSize: "clamp(2.8rem, 7vw, 5rem)",
            letterSpacing: "-0.02em",
            color: "var(--text-1)",
          }}
        >
          Превратите свои активы в
          <br />
          поток пассивного дохода.
        </motion.h1>

        <motion.p
          {...fade(0.18)}
          className="mb-10 max-w-md mx-auto leading-relaxed text-xl"
          style={{ color: "var(--text-2)" }}
        >
          Никаких бумаг и ожиданий — подключил кошелёк, подписал транзакцию и
          забрал товар. 400 мс финализация. Escrow-безопасность.
        </motion.p>

        <motion.div
          {...fade(0.3)}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={openModal}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: "1px solid var(--border)",
              background: "var(--surface)",
              color: "var(--text-1)",
            }}
          >
            Начать аренду
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold transition-all"
            style={{
              border: "1px solid var(--border-2)",
              background: "transparent",
              color: "var(--text-2)",
            }}
          >
            Разместить товар
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

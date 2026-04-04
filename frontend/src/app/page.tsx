import { Header } from "@/components/sections/Header";
import { Hero } from "@/components/sections/Hero";
import { Stats } from "@/components/sections/Stats";
import { WhyRentX } from "@/components/sections/WhyRentX";
import { Features } from "@/components/sections/Features";
import { Catalog } from "@/components/sections/Catalog";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Footer } from "@/components/sections/Footer";

export default function Home() {
  return (
    <div style={{ background: "var(--page-bg)" }}>
      <Header />
      <Hero />
      <main
        className="relative z-10 rounded-t-[2.5rem]"
        style={{ background: "var(--main-bg)" }}
      >
        <Stats />
        <WhyRentX />
        <Features />
        <Catalog />
        <HowItWorks />
        <Footer />
      </main>
    </div>
  );
}

"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "en" | "kz" | "ru";

export type Translations = {
  nav: { catalog: string; marketplace: string; faq: string };
  wallet: { connecting: string; connect: string };
  hero: { title: string; subtitle: string; startRenting: string; listItem: string };
  stats: { finalization: string; fee: string; activeRentals: string; escrowCollateral: string };
  why: {
    title: string;
    traditional: { title: string; items: string[] };
    rentx: { title: string; items: string[] };
  };
  features: {
    title: string;
    items: { title: string; description: string }[];
  };
  catalog: {
    title: string;
    subtitle: string;
    available: string;
    rented: string;
    perDay: string;
    deposit: string;
    signing: string;
    done: string;
    unavailable: string;
    rent: string;
    empty: string;
  };
  how: {
    title: string;
    subtitle: string;
    steps: { title: string; description: string }[];
  };
  footer: {
    description: string;
    platform: string;
    development: string;
    platformLinks: string[];
    devLinks: string[];
    rights: string;
    stats: string;
  };
};

const translations: Record<Lang, Translations> = {
  ru: {
    nav: { catalog: "Каталог", marketplace: "Маркетплейс", faq: "FAQ" },
    wallet: { connecting: "Подключение…", connect: "Connect Wallet" },
    hero: {
      title: "Превратите свои активы в\nпоток пассивного дохода.",
      subtitle: "Никаких бумаг и ожиданий — подключил кошелёк, подписал транзакцию и забрал товар. 400 мс финализация. Escrow-безопасность.",
      startRenting: "Начать аренду",
      listItem: "Разместить товар",
    },
    stats: { finalization: "Финализация", fee: "Комиссия", activeRentals: "Активных аренд", escrowCollateral: "Залог в escrow" },
    why: {
      title: "Почему RentX?",
      traditional: {
        title: "Традиционная аренда",
        items: [
          "Высокие комиссии платформ (15–20%)",
          "Невозвратные отмены аренды",
          "Централизованный контроль",
          "Региональные платёжные барьеры",
        ],
      },
      rentx: {
        title: "RentX (Web3)",
        items: [
          "Минимальные сетевые комиссии",
          "Продай NFT аренды и верни деньги",
          "Истинное владение (On-chain)",
          "Глобальные платежи в SOL/USDC",
        ],
      },
    },
    features: {
      title: "Ключевые Возможности",
      items: [
        { title: "Неизменяемое Владение", description: "Каждая аренда записывается как NFT на Solana. Это ваш ключ — его нельзя подделать или отозвать." },
        { title: "Мгновенная Верификация", description: "Никаких бумажных ваучеров. Ваш кошелёк — ваш ключ. Верифицируйте аренду по простому QR." },
        { title: "Вторичный Рынок", description: "Изменились планы? Не отменяйте. Продайте NFT аренды на P2P-маркетплейсе и верните деньги." },
        { title: "DeFi Интеграция", description: "Используйте NFT аренды как залог или зарабатывайте награды за частые поездки." },
      ],
    },
    catalog: {
      title: "Каталог товаров",
      subtitle: "Каждая аренда — это NFT на Solana. Верифицируй QR-кодом, перепродай на маркетплейсе.",
      available: "Доступно",
      rented: "Арендовано",
      perDay: "в день",
      deposit: "залог",
      signing: "Подпись Phantom…",
      done: "✓ Аренда оформлена!",
      unavailable: "Недоступно",
      rent: "Арендовать",
      empty: "Товары не найдены. Убедитесь, что backend запущен на localhost:3001",
    },
    how: {
      title: "Как это работает?",
      subtitle: "Четыре шага — от поиска до возврата залога",
      steps: [
        { title: "Поиск", description: "Найдите нужный товар и выберите даты аренды в нашем интерактивном каталоге." },
        { title: "Аренда", description: "Подтвердите аренду — смарт-контракт автоматически заблокирует залог в escrow." },
        { title: "Управление", description: "Просматривайте аренды в дашборде. Держите NFT или продайте на маркетплейсе." },
        { title: "Возврат", description: "Верните товар. Оператор подтверждает — залог автоматически возвращается вам." },
      ],
    },
    footer: {
      description: "Децентрализованная платформа быстрой аренды на блокчейне Solana. Никаких бумаг — только подпись.",
      platform: "Платформа",
      development: "Разработка",
      platformLinks: ["Каталог", "Маркетплейс", "FAQ", "Dashboard"],
      devLinks: ["Документация", "Smart Contract", "GitHub", "Devnet Explorer"],
      rights: "2026 RentX. Все права защищены.",
      stats: "Solana · ~400мс · $0.00025 комиссия",
    },
  },
  en: {
    nav: { catalog: "Catalog", marketplace: "Marketplace", faq: "FAQ" },
    wallet: { connecting: "Connecting…", connect: "Connect Wallet" },
    hero: {
      title: "Turn your assets into\na passive income stream.",
      subtitle: "No paperwork or waiting — connect your wallet, sign the transaction and pick up the item. 400ms finalization. Escrow security.",
      startRenting: "Start Renting",
      listItem: "List an Item",
    },
    stats: { finalization: "Finalization", fee: "Fee", activeRentals: "Active Rentals", escrowCollateral: "Escrow Collateral" },
    why: {
      title: "Why RentX?",
      traditional: {
        title: "Traditional Rental",
        items: [
          "High platform fees (15–20%)",
          "Non-refundable rental cancellations",
          "Centralized control",
          "Regional payment barriers",
        ],
      },
      rentx: {
        title: "RentX (Web3)",
        items: [
          "Minimal network fees",
          "Sell rental NFT and get your money back",
          "True ownership (On-chain)",
          "Global payments in SOL/USDC",
        ],
      },
    },
    features: {
      title: "Key Features",
      items: [
        { title: "Immutable Ownership", description: "Every rental is recorded as an NFT on Solana. This is your key — it can't be forged or revoked." },
        { title: "Instant Verification", description: "No paper vouchers. Your wallet is your key. Verify your rental with a simple QR code." },
        { title: "Secondary Market", description: "Plans changed? Don't cancel. Sell your rental NFT on the P2P marketplace and get your money back." },
        { title: "DeFi Integration", description: "Use your rental NFT as collateral or earn rewards for frequent trips." },
      ],
    },
    catalog: {
      title: "Product Catalog",
      subtitle: "Every rental is an NFT on Solana. Verify by QR code, resell on the marketplace.",
      available: "Available",
      rented: "Rented",
      perDay: "per day",
      deposit: "deposit",
      signing: "Phantom signing…",
      done: "✓ Rental confirmed!",
      unavailable: "Unavailable",
      rent: "Rent",
      empty: "No items found. Make sure the backend is running on localhost:3001",
    },
    how: {
      title: "How does it work?",
      subtitle: "Four steps — from search to deposit refund",
      steps: [
        { title: "Search", description: "Find the item you need and select rental dates in our interactive catalog." },
        { title: "Rent", description: "Confirm the rental — the smart contract will automatically lock the deposit in escrow." },
        { title: "Manage", description: "View rentals in the dashboard. Hold the NFT or sell it on the marketplace." },
        { title: "Return", description: "Return the item. The operator confirms — deposit automatically returns to you." },
      ],
    },
    footer: {
      description: "Decentralized fast rental platform on the Solana blockchain. No paperwork — just a signature.",
      platform: "Platform",
      development: "Development",
      platformLinks: ["Catalog", "Marketplace", "FAQ", "Dashboard"],
      devLinks: ["Documentation", "Smart Contract", "GitHub", "Devnet Explorer"],
      rights: "2026 RentX. All rights reserved.",
      stats: "Solana · ~400ms · $0.00025 fee",
    },
  },
  kz: {
    nav: { catalog: "Каталог", marketplace: "Нарық", faq: "FAQ" },
    wallet: { connecting: "Қосылуда…", connect: "Connect Wallet" },
    hero: {
      title: "Активтеріңізді пассивті\nтабыс ағынына айналдырыңыз.",
      subtitle: "Ешқандай қағаз және күту — әмиянды қосты, транзакцияны қол қойды және тауарды алды. 400 мс финализация. Escrow қауіпсіздігі.",
      startRenting: "Жалдауды бастау",
      listItem: "Тауарды орналастыру",
    },
    stats: { finalization: "Финализация", fee: "Комиссия", activeRentals: "Белсенді жалдаулар", escrowCollateral: "Escrow кепілі" },
    why: {
      title: "Неліктен RentX?",
      traditional: {
        title: "Дәстүрлі жалдау",
        items: [
          "Жоғары платформа комиссиялары (15–20%)",
          "Қайтарылмайтын жалдау бас тартулары",
          "Орталықтандырылған бақылау",
          "Аймақтық төлем кедергілері",
        ],
      },
      rentx: {
        title: "RentX (Web3)",
        items: [
          "Минималды желілік комиссиялар",
          "NFT жалдауды сатып ақшаңды қайтар",
          "Нақты иелік (On-chain)",
          "SOL/USDC глобалды төлемдер",
        ],
      },
    },
    features: {
      title: "Негізгі Мүмкіндіктер",
      items: [
        { title: "Өзгермейтін иелік", description: "Әр жалдау Solana-да NFT ретінде жазылады. Бұл сіздің кілтіңіз — оны жасандылауға немесе кері алуға болмайды." },
        { title: "Лездік тексеру", description: "Ешқандай қағаз ваучер жоқ. Сіздің әмияның — сіздің кілтіңіз. QR арқылы жалдауды тексеріңіз." },
        { title: "Қосымша нарық", description: "Жоспарлар өзгерді ме? Болдырмаңыз. NFT жалдауды P2P нарығында сатып ақшаңды қайтарыңыз." },
        { title: "DeFi интеграциясы", description: "NFT жалдауды кепіл ретінде пайдаланыңыз немесе жиі саяхаттар үшін сыйақы алыңыз." },
      ],
    },
    catalog: {
      title: "Тауарлар каталогы",
      subtitle: "Әр жалдау — Solana-дағы NFT. QR-кодпен тексеріп, нарықта қайта сат.",
      available: "Қол жетімді",
      rented: "Жалданған",
      perDay: "күніне",
      deposit: "кепіл",
      signing: "Phantom қолтаңбасы…",
      done: "✓ Жалдау рәсімделді!",
      unavailable: "Қол жетімсіз",
      rent: "Жалдау",
      empty: "Тауарлар табылмады. Backend localhost:3001 іске қосылғанын тексеріңіз",
    },
    how: {
      title: "Бұл қалай жұмыс істейді?",
      subtitle: "Төрт қадам — іздеуден кепілді қайтаруға дейін",
      steps: [
        { title: "Іздеу", description: "Интерактивті каталогымызда қажетті тауарды тауып, жалдау күндерін таңдаңыз." },
        { title: "Жалдау", description: "Жалдауды растаңыз — смарт-контракт кепілді escrow-да автоматты түрде бұғаттайды." },
        { title: "Басқару", description: "Жалдауларды бақылу тақтасынан қараңыз. NFT ұстаңыз немесе нарықта сатыңыз." },
        { title: "Қайтару", description: "Тауарды қайтарыңыз. Оператор растайды — кепіл автоматты түрде сізге қайтарылады." },
      ],
    },
    footer: {
      description: "Solana блокчейніндегі жылдам жалдаудың орталықсыздандырылған платформасы. Ешқандай қағаз — тек қолтаңба.",
      platform: "Платформа",
      development: "Әзірлеу",
      platformLinks: ["Каталог", "Нарық", "FAQ", "Dashboard"],
      devLinks: ["Құжаттама", "Smart Contract", "GitHub", "Devnet Explorer"],
      rights: "2026 RentX. Барлық құқықтар қорғалған.",
      stats: "Solana · ~400мс · $0.00025 комиссия",
    },
  },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "ru",
  setLang: () => {},
  t: translations.ru,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const stored = localStorage.getItem("lang") as Lang | null;
    if (stored && stored in translations) {
      setLangState(stored);
    }
  }, []);

  const setLang = (next: Lang) => {
    setLangState(next);
    localStorage.setItem("lang", next);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);

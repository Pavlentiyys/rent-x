"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, Wallet, ShieldCheck, Coins, ArrowLeftRight, Package } from "lucide-react";
import { Header } from "@/components/sections/Header";
import { Footer } from "@/components/sections/Footer";

const faqSections = [
  {
    icon: Wallet,
    title: "Кошелёк и аутентификация",
    color: "#9945FF",
    items: [
      {
        q: "Какой кошелёк поддерживается?",
        a: "RentX работает с любым Solana-кошельком — Phantom, Backpack, Solflare и другими. Рекомендуем Phantom: он прост в установке и поддерживает все функции платформы.",
      },
      {
        q: "Как происходит вход в систему?",
        a: "Мы используем Sign-In with Solana (SIWS) — стандарт Web3-аутентификации. При подключении кошелька вам предложат подписать сообщение (без токенов и комиссий), после чего платформа выдаст JWT-токен для работы с API.",
      },
      {
        q: "Мои приватные ключи передаются платформе?",
        a: "Нет, никогда. Подпись формируется внутри вашего кошелька. Платформа получает только публичный ключ и подпись сообщения — этого достаточно для верификации личности.",
      },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Escrow и безопасность",
    color: "#14F195",
    items: [
      {
        q: "Где хранится залог во время аренды?",
        a: "Залог блокируется в escrow-аккаунте смарт-контракта RentX на блокчейне Solana. Ни платформа, ни арендодатель не имеют доступа к этим средствам — они освобождаются только при подтверждении возврата.",
      },
      {
        q: "Что происходит, если владелец не вернёт залог?",
        a: "Смарт-контракт гарантирует автоматический возврат залога арендатору после подтверждения оператором. Человеческий фактор исключён — логика прописана в коде и не может быть изменена.",
      },
      {
        q: "Аудировался ли смарт-контракт?",
        a: "Контракт написан на Anchor (Rust) с проверкой overflow и строгими PDA-ограничениями. Код открыт на GitHub. Полный внешний аудит запланирован перед mainnet-запуском.",
      },
    ],
  },
  {
    icon: Package,
    title: "Аренда и листинги",
    color: "#00C2FF",
    items: [
      {
        q: "Как разместить товар на платформе?",
        a: "Подключите кошелёк → перейдите в Личный кабинет → нажмите «Добавить листинг». Заполните название, описание, цену за день и сумму залога. Листинг появится в каталоге сразу после публикации.",
      },
      {
        q: "В какой валюте производятся расчёты?",
        a: "На данный момент расчёты ведутся в SOL. В ближайших обновлениях планируется поддержка USDC для снижения волатильности.",
      },
      {
        q: "Можно ли арендовать товар без верификации?",
        a: "Для аренды необходима верификация аккаунта. Она происходит автоматически при первом входе через SIWS — ваш кошелёк становится вашим паспортом.",
      },
    ],
  },
  {
    icon: ArrowLeftRight,
    title: "Маркетплейс и P2P",
    color: "#FF6B9D",
    items: [
      {
        q: "Что такое P2P-маркетплейс?",
        a: "Если ваши планы изменились — не обязательно отменять аренду и терять деньги. Вы можете продать NFT-ключ аренды другому пользователю через маркетплейс. Новый владелец ключа получает права на товар.",
      },
      {
        q: "Как работает NFT-ключ аренды?",
        a: "Каждая аренда выпускается как NFT на Solana. Этот токен подтверждает ваше право доступа к товару: его можно верифицировать QR-кодом, передать, продать или использовать как DeFi-залог.",
      },
      {
        q: "Можно ли использовать NFT-ключ как залог?",
        a: "Да, это одна из ключевых DeFi-функций платформы. NFT аренды имеет реальную стоимость (залог + оставшееся время), поэтому его можно использовать в совместимых протоколах кредитования.",
      },
    ],
  },
  {
    icon: Coins,
    title: "Комиссии и экономика",
    color: "#F59E0B",
    items: [
      {
        q: "Какая комиссия у платформы?",
        a: "Комиссия RentX составляет 2.5% от суммы аренды — многократно ниже традиционных платформ (15–20%). Сетевая комиссия Solana — около $0.00025 за транзакцию.",
      },
      {
        q: "Когда возвращается залог?",
        a: "Залог возвращается автоматически после подтверждения возврата товара оператором. Перевод занимает ~400 мс — время финализации блока Solana.",
      },
      {
        q: "Есть ли скрытые платежи?",
        a: "Нет. Вся логика на-цепочная и прозрачна: комиссия, залог и арендная плата фиксируются в смарт-контракте до подписания сделки. Вы всегда видите итоговую сумму до подтверждения.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="rounded-[16px] overflow-hidden transition-all duration-200"
      style={{ border: "1px solid var(--border)", background: open ? "var(--surface-2)" : "var(--surface)" }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left cursor-pointer"
      >
        <span className="text-sm font-semibold pr-4" style={{ color: "var(--text-1)" }}>
          {q}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }} className="shrink-0">
          <ChevronDown size={16} style={{ color: "var(--text-3)" }} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <p className="px-5 pb-5 text-sm leading-relaxed" style={{ color: "var(--text-3)" }}>
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--page-bg)" }}>
      <Header />

      <main
        className="relative z-10 rounded-t-[2.5rem]"
        style={{ background: "var(--main-bg)" }}
      >
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 pt-16 pb-10 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-6"
            style={{
              background: "rgba(153,69,255,0.1)",
              border: "1px solid rgba(153,69,255,0.25)",
              color: "#9945FF",
            }}
          >
            <HelpCircle size={12} />
            Часто задаваемые вопросы
          </div>

          <h1
            className="text-4xl md:text-5xl font-black mb-4"
            style={{ letterSpacing: "-0.03em", color: "var(--text-1)" }}
          >
            Всё, что вы хотели
            <br />
            <span style={{ background: "linear-gradient(90deg, #9945FF 0%, #14F195 50%, #00C2FF 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              знать о RentX
            </span>
          </h1>

          <p className="text-base leading-relaxed" style={{ color: "var(--text-3)" }}>
            Отвечаем на главные вопросы об аренде, безопасности, кошельках и экономике платформы.
          </p>
        </section>

        {/* FAQ sections */}
        <section className="max-w-3xl mx-auto px-4 pb-20 space-y-10">
          {faqSections.map(({ icon: Icon, title, color, items }) => (
            <div key={title}>
              {/* Section header */}
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}
                >
                  <Icon size={16} style={{ color }} strokeWidth={1.8} />
                </div>
                <h2 className="text-base font-bold" style={{ color: "var(--text-1)" }}>
                  {title}
                </h2>
              </div>

              <div className="space-y-2">
                {items.map((item) => (
                  <FaqItem key={item.q} {...item} />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Bottom CTA */}
        <section className="max-w-3xl mx-auto px-4 pb-20">
          <div
            className="rounded-[24px] px-8 py-10 text-center"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <p className="text-lg font-bold mb-2" style={{ color: "var(--text-1)" }}>
              Не нашли ответ?
            </p>
            <p className="text-sm mb-6" style={{ color: "var(--text-3)" }}>
              Свяжитесь с нами в Telegram или откройте issue на GitHub
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <a
                href="https://t.me/rentx_support"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all hover:opacity-80"
                style={{ background: "linear-gradient(135deg, #2B44D0 0%, #1B2BB8 100%)" }}
              >
                Telegram
              </a>
              <a
                href="https://github.com/Pavlentiyys/rent-x/issues"
                className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-80"
                style={{
                  background: "var(--surface-2)",
                  border: "1px solid var(--border)",
                  color: "var(--text-1)",
                }}
              >
                GitHub Issues
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
}

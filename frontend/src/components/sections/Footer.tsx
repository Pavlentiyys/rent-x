import Link from "next/link";

const columns = [
  {
    title: "Платформа",
    links: [
      { label: "Каталог",    href: "#catalog" },
      { label: "Маркетплейс", href: "#why-rentx" },
      { label: "Для хостов", href: "#how-it-works" },
      { label: "Dashboard",  href: "#" },
    ],
  },
  {
    title: "Разработка",
    links: [
      { label: "Документация",   href: "#docs" },
      { label: "Smart Contract", href: "#" },
      { label: "GitHub",         href: "#" },
      { label: "Devnet Explorer", href: "#" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer style={{ borderTop: "1px solid var(--divider)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <span
              className="text-[17px] font-bold tracking-tight block mb-4"
              style={{ color: "var(--text-1)" }}
            >
              RentX
            </span>
            <p className="text-sm leading-relaxed mb-5" style={{ color: "var(--text-3)" }}>
              Децентрализованная платформа быстрой аренды на блокчейне Solana.
              Никаких бумаг — только подпись.
            </p>
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
            >
              <span className="text-[11px] font-semibold tracking-wide" style={{ color: "var(--text-2)" }}>
                ◎ Built on Solana
              </span>
            </div>
          </div>

          {columns.map(({ title, links }) => (
            <div key={title}>
              <h4
                className="text-xs font-bold uppercase tracking-widest mb-4"
                style={{ color: "var(--text-4)" }}
              >
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm transition-colors duration-150"
                      style={{ color: "var(--text-3)" }}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid var(--divider)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-4)" }}>
            2026 RentX. Все права защищены.
          </p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-4)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Solana · ~400мс · $0.00025 комиссия
          </p>
        </div>
      </div>
    </footer>
  );
};

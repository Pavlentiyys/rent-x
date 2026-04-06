"use client";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

const platformHrefs = ["#catalog", "#why-rentx", "#how-it-works", "#"];
const devHrefs = ["#docs", "#", "#", "#"];

export const Footer = () => {
  const { t } = useLanguage();

  const columns = [
    {
      title: t.footer.platform,
      links: t.footer.platformLinks.map((label, i) => ({ label, href: platformHrefs[i] })),
    },
    {
      title: t.footer.development,
      links: t.footer.devLinks.map((label, i) => ({ label, href: devHrefs[i] })),
    },
  ];

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
              {t.footer.description}
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
            {t.footer.rights}
          </p>
          <p className="text-xs flex items-center gap-1.5" style={{ color: "var(--text-4)" }}>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            {t.footer.stats}
          </p>
        </div>
      </div>
    </footer>
  );
};

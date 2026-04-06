import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SolanaProviders } from "./providers";
import { WalletProvider } from "@/components/ui/WalletContext";
import { WalletConnectModal } from "@/components/ui/WalletConnectModal";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RentX — Decentralized Rental on Solana",
  description:
    "Rent anything instantly with blockchain security. No paperwork, 400ms finalization, escrow protection.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <script
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('rentx-theme')||'dark';if(t==='dark')document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <SolanaProviders>
          <WalletProvider>
            <ThemeProvider>
              {children}
              <WalletConnectModal />
            </ThemeProvider>
          </WalletProvider>
        </SolanaProviders>
      </body>
    </html>
  );
}

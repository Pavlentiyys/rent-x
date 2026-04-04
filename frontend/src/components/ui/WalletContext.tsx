"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";

interface WalletContextType {
  address: string | null;
  connecting: boolean;
  connected: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connecting: false,
  connected: false,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  connect: async () => {},
  disconnect: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const {
    publicKey,
    connecting,
    connected,
    select,
    disconnect: adapterDisconnect,
    wallets,
  } = useWallet();

  const openModal  = useCallback(() => setIsModalOpen(true),  []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  /** Connect — selects Phantom and calls adapter.connect() directly
   *  to avoid the select() → React re-render → connect() race condition. */
  const connect = useCallback(async () => {
    try {
      const phantom = wallets.find((w) => w.adapter.name === "Phantom");
      if (!phantom) { openModal(); return; }
      select(phantom.adapter.name);
      closeModal();
      await phantom.adapter.connect();
      router.push("/dashboard");
    } catch (err) {
      console.error("Wallet connection failed:", err);
    }
  }, [wallets, select, openModal, closeModal, router]);

  const disconnect = useCallback(async () => {
    try {
      await adapterDisconnect();
      router.push("/");
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [adapterDisconnect, router]);

  return (
    <WalletContext.Provider
      value={{
        address: publicKey?.toBase58() ?? null,
        connecting,
        connected,
        isModalOpen,
        openModal,
        closeModal,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWalletContext = () => useContext(WalletContext);

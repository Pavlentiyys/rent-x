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
    disconnect: adapterDisconnect,
  } = useWallet();

  const openModal  = useCallback(() => setIsModalOpen(true),  []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const connect = useCallback(async () => {
    // With the standard wallet adapter, just open modal
    openModal();
  }, [openModal]);

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

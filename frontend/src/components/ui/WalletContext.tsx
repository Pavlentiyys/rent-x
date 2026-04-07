"use client";
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import bs58 from "bs58";
import {
  getAuthToken,
  setAuthToken,
  clearAuthToken,
  generateSiwsMessage,
  verifySiwsSignature,
  getMe,
  type UserProfile,
} from "@/lib/api-client";

interface WalletContextType {
  address: string | null;
  connecting: boolean;
  connected: boolean;
  authToken: string | null;
  userProfile: UserProfile | null;
  needsVerification: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connecting: false,
  connected: false,
  authToken: null,
  userProfile: null,
  needsVerification: false,
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
  connect: async () => {},
  disconnect: async () => {},
  refreshProfile: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [authToken, setAuthTokenState] = useState<string | null>(() => getAuthToken());
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const router = useRouter();

  const {
    publicKey,
    connecting,
    connected,
    signMessage,
    disconnect: adapterDisconnect,
  } = useWallet();

  const openModal  = useCallback(() => setIsModalOpen(true),  []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const connect = useCallback(async () => {
    openModal();
  }, [openModal]);

  const disconnect = useCallback(async () => {
    try {
      await adapterDisconnect();
      clearAuthToken();
      setAuthTokenState(null);
      setUserProfile(null);
      setNeedsVerification(false);
      router.push("/");
    } catch (err) {
      console.error("Disconnect failed:", err);
    }
  }, [adapterDisconnect, router]);

  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const profile = await getMe(token);
      setUserProfile(profile);
      setNeedsVerification(!profile.documentUrl);
    } catch (err) {
      console.error("Failed to refresh profile:", err);
    }
  }, []);

  // SIWS: authenticate when wallet connects
  useEffect(() => {
    if (!connected || !publicKey || !signMessage || authToken) return;

    const address = publicKey.toBase58();

    (async () => {
      try {
        const message = await generateSiwsMessage(address);
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = await signMessage(messageBytes);
        const signature = bs58.encode(signatureBytes);
        const token = await verifySiwsSignature(address, message, signature);
        setAuthToken(token);
        setAuthTokenState(token);

        // Fetch profile and check if KYC is needed
        const profile = await getMe(token);
        setUserProfile(profile);
        setNeedsVerification(!profile.documentUrl);
      } catch (err) {
        console.error("SIWS authentication failed:", err);
      }
    })();
  }, [connected, publicKey, signMessage, authToken]);

  // Restore profile from stored token on mount
  useEffect(() => {
    if (authToken && !userProfile) {
      getMe(authToken)
        .then((profile) => {
          setUserProfile(profile);
          setNeedsVerification(!profile.documentUrl);
        })
        .catch(() => {
          clearAuthToken();
          setAuthTokenState(null);
        });
    }
  }, [authToken, userProfile]);

  return (
    <WalletContext.Provider
      value={{
        address: publicKey?.toBase58() ?? null,
        connecting,
        connected,
        authToken,
        userProfile,
        needsVerification,
        isModalOpen,
        openModal,
        closeModal,
        connect,
        disconnect,
        refreshProfile,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWalletContext = () => useContext(WalletContext);

'use client';

import React, { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
} from '@solana/wallet-adapter-wallets';

// Use NEXT_PUBLIC_RPC_URL if set, otherwise fall back to Ankr public devnet
// (Ankr has significantly better rate limits than api.devnet.solana.com)
const DEFAULT_RPC = 'https://rpc.ankr.com/solana_devnet';

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL ?? DEFAULT_RPC,
    [],
  );

  // @solana/wallet-adapter-wallets includes all the adapters but
  // the tree is not shaken well yet so you may want to just import
  // the wallets you want to support.
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        {children}
      </WalletProvider>
    </ConnectionProvider>
  );
}

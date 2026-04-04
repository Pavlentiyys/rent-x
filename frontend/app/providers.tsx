'use client';

import React from 'react';
import {
  SelectedWalletAccountContextProvider,
} from '@solana/react';

const STORAGE_KEY = 'rentx-wallet-account';

export function SolanaProviders({ children }: { children: React.ReactNode }) {
  return (
    <SelectedWalletAccountContextProvider
      filterWallet={(wallet) => wallet.accounts.length > 0}
      stateSync={{
        getSelectedWallet: () => localStorage.getItem(STORAGE_KEY),
        storeSelectedWallet: (key) => localStorage.setItem(STORAGE_KEY, key),
        deleteSelectedWallet: () => localStorage.removeItem(STORAGE_KEY),
      }}
    >
      {children}
    </SelectedWalletAccountContextProvider>
  );
}

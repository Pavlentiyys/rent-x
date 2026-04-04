export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? 'https://api.devnet.solana.com';

export const SOLANA_WS_URL =
  process.env.NEXT_PUBLIC_SOLANA_WS_URL ??
  SOLANA_RPC_URL.replace('https://', 'wss://').replace('http://', 'ws://');

export const PROGRAM_ID =
  process.env.NEXT_PUBLIC_PROGRAM_ID ?? 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS';

export const CLUSTER: 'solana:devnet' | 'solana:mainnet' | 'solana:localnet' =
  (process.env.NEXT_PUBLIC_CLUSTER as any) ?? 'solana:devnet';

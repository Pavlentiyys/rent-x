import { Program, AnchorProvider, BN, type Idl } from "@coral-xyz/anchor";
import {
  Connection,
  PublicKey,
  SystemProgram,
  type TransactionSignature,
} from "@solana/web3.js";
import type { AnchorWallet } from "@solana/wallet-adapter-react";

import idlJson from "./rentx-idl.json";

export const PROGRAM_ID = new PublicKey("H8dxbPQhNTmDiJwpJPGeJ3QnA8zaYsYGHv1yumysws8k");

const SEED_USER = Buffer.from("user");
const SEED_LISTING = Buffer.from("listing");
const SEED_RENTAL = Buffer.from("rental");

/**
 * Truncates a string so its UTF-8 byte representation is at most 32 bytes —
 * the maximum length allowed for a single Solana PDA seed.
 * Cyrillic characters are 2 bytes each, so a pure-Cyrillic title is
 * limited to ~16 characters. This function must be used everywhere a
 * listing seed is derived (create + rent) so the PDA stays consistent.
 */
export function toListingSeed(title: string): string {
  const bytes = Buffer.from(title, "utf8");
  if (bytes.length <= 32) return title;
  // Slice to 32 bytes then decode; drop trailing incomplete multi-byte char
  const sliced = bytes.slice(0, 32);
  return new TextDecoder("utf-8", { fatal: false }).decode(sliced).replace(/\uFFFD+$/, "");
}

// ── PDA derivations ─────────────────────────────────────────────────────────

export function getUserProfilePDA(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([SEED_USER, owner.toBuffer()], PROGRAM_ID);
}

export function getListingPDA(owner: PublicKey, itemName: string): [PublicKey, number] {
  const seedStr = toListingSeed(itemName);
  return PublicKey.findProgramAddressSync(
    [SEED_LISTING, owner.toBuffer(), Buffer.from(seedStr, "utf8")],
    PROGRAM_ID,
  );
}

export function getRentalPDA(renter: PublicKey, listing: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [SEED_RENTAL, renter.toBuffer(), listing.toBuffer()],
    PROGRAM_ID,
  );
}

// ── Provider / Program helpers ──────────────────────────────────────────────

export function getProvider(connection: Connection, wallet: AnchorWallet): AnchorProvider {
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

export function getProgram(connection: Connection, wallet: AnchorWallet): Program {
  const provider = getProvider(connection, wallet);
  return new Program(idlJson as Idl, provider);
}

// ── On-chain account types ──────────────────────────────────────────────────

export interface OnChainUserProfile {
  owner: PublicKey;
  isVerified: boolean;
  verifiedAt: BN;
  totalRentals: number;
  bump: number;
}

export interface OnChainRentalListing {
  owner: PublicKey;
  itemName: string;
  description: string;
  pricePerDay: BN;
  depositAmount: BN;
  category: string;
  isAvailable: boolean;
  createdAt: BN;
  bump: number;
}

export interface OnChainRentalAgreement {
  renter: PublicKey;
  listing: PublicKey;
  owner: PublicKey;
  startTime: BN;
  endTime: BN;
  depositAmount: BN;
  rentalFee: BN;
  totalPaid: BN;
  status: { active: {} } | { completed: {} } | { cancelled: {} };
  bump: number;
}

// ── Instructions ────────────────────────────────────────────────────────────

/**
 * Marks the caller's UserProfile as KYC-verified.
 * In test-mode the program accepts any signer as platform authority.
 */
export async function verifyUser(
  connection: Connection,
  wallet: AnchorWallet,
  targetOwner: PublicKey,
): Promise<TransactionSignature> {
  const program = getProgram(connection, wallet);
  const [userProfile] = getUserProfilePDA(targetOwner);

  return program.methods
    .verifyUser()
    .accounts({
      userProfile,
      platform: wallet.publicKey,
    })
    .rpc();
}

/** Creates a UserProfile PDA (call once per wallet) */
export async function initializeUser(
  connection: Connection,
  wallet: AnchorWallet,
): Promise<TransactionSignature> {
  const program = getProgram(connection, wallet);
  const [userProfile] = getUserProfilePDA(wallet.publicKey);

  return program.methods
    .initializeUser()
    .accounts({
      userProfile,
      user: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/** Creates an on-chain RentalListing PDA */
export async function createOnChainListing(
  connection: Connection,
  wallet: AnchorWallet,
  itemName: string,
  description: string,
  pricePerDayLamports: BN,
  depositAmountLamports: BN,
  category: string,
): Promise<TransactionSignature> {
  const program = getProgram(connection, wallet);
  const [rentalListing] = getListingPDA(wallet.publicKey, itemName);

  return program.methods
    .createListing(itemName, description, pricePerDayLamports, depositAmountLamports, category)
    .accounts({
      rentalListing,
      owner: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/** Renter locks deposit + fee into escrow */
export async function rentItem(
  connection: Connection,
  wallet: AnchorWallet,
  listingPDA: PublicKey,
  startTime: BN,
  endTime: BN,
): Promise<TransactionSignature> {
  const program = getProgram(connection, wallet);
  const [rentalAgreement] = getRentalPDA(wallet.publicKey, listingPDA);
  const [renterProfile] = getUserProfilePDA(wallet.publicKey);

  return program.methods
    .rentItem(startTime, endTime)
    .accounts({
      rentalAgreement,
      rentalListing: listingPDA,
      renterProfile,
      renter: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

/** Platform/owner confirms return — distributes escrow */
export async function returnItem(
  connection: Connection,
  wallet: AnchorWallet,
  rentalAgreementPDA: PublicKey,
  listingPDA: PublicKey,
  renterPubkey: PublicKey,
  ownerPubkey: PublicKey,
): Promise<TransactionSignature> {
  const program = getProgram(connection, wallet);
  const [renterProfile] = getUserProfilePDA(renterPubkey);

  return program.methods
    .returnItem()
    .accounts({
      rentalAgreement: rentalAgreementPDA,
      rentalListing: listingPDA,
      renterProfile,
      renter: renterPubkey,
      owner: ownerPubkey,
      platform: wallet.publicKey,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
}

// ── Account reads ───────────────────────────────────────────────────────────

export async function fetchUserProfile(
  connection: Connection,
  wallet: AnchorWallet,
  owner: PublicKey,
): Promise<OnChainUserProfile | null> {
  const program = getProgram(connection, wallet);
  const [pda] = getUserProfilePDA(owner);
  try {
    return await (program.account as any).userProfile.fetch(pda) as unknown as OnChainUserProfile;
  } catch {
    return null;
  }
}

export async function fetchListing(
  connection: Connection,
  wallet: AnchorWallet,
  listingPDA: PublicKey,
): Promise<OnChainRentalListing | null> {
  const program = getProgram(connection, wallet);
  try {
    return await (program.account as any).rentalListing.fetch(listingPDA) as unknown as OnChainRentalListing;
  } catch {
    return null;
  }
}

export async function fetchRentalAgreement(
  connection: Connection,
  wallet: AnchorWallet,
  rentalPDA: PublicKey,
): Promise<OnChainRentalAgreement | null> {
  const program = getProgram(connection, wallet);
  try {
    return await (program.account as any).rentalAgreement.fetch(rentalPDA) as unknown as OnChainRentalAgreement;
  } catch {
    return null;
  }
}

/** Check if UserProfile PDA exists on-chain */
export async function userProfileExists(
  connection: Connection,
  wallet: AnchorWallet,
  owner: PublicKey,
): Promise<boolean> {
  const profile = await fetchUserProfile(connection, wallet, owner);
  return profile !== null;
}

/** Check if a RentalListing PDA already exists on-chain */
export async function listingExists(
  connection: Connection,
  wallet: AnchorWallet,
  owner: PublicKey,
  itemName: string,
): Promise<boolean> {
  const [pda] = getListingPDA(owner, itemName);
  const info = await connection.getAccountInfo(pda);
  return info !== null;
}

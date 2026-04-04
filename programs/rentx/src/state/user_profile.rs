use anchor_lang::prelude::*;

/// On-chain KYC + reputation record for each wallet.
/// PDA seeds: ["user", owner]
#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    /// Wallet that owns this profile.
    pub owner: Pubkey,       // 32
    /// Set to true by the platform after successful KYC.
    pub is_verified: bool,   // 1
    /// Unix timestamp of verification (0 if not verified).
    pub verified_at: i64,    // 8
    /// Total completed rentals — forms on-chain reputation score.
    pub total_rentals: u32,  // 4
    /// PDA bump stored to avoid recomputation in CPIs.
    pub bump: u8,            // 1
}

impl UserProfile {
    pub const SEED_PREFIX: &'static [u8] = b"user";
}

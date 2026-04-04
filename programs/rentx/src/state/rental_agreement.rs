use anchor_lang::prelude::*;

/// Lifecycle state of a single rental.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum RentalStatus {
    /// Deposit is locked; item has been handed to renter.
    Active,
    /// Operator confirmed return; funds distributed.
    Completed,
    /// Cancelled before item was handed out.
    Cancelled,
}

/// Escrow account created when a renter locks funds.
/// Holds deposit + rental fee until `return_item` is called.
/// PDA seeds: ["rental", renter, listing]
#[account]
#[derive(InitSpace)]
pub struct RentalAgreement {
    /// Wallet of the renter.
    pub renter: Pubkey,       // 32
    /// Public key of the RentalListing PDA.
    pub listing: Pubkey,      // 32
    /// Wallet of the item owner (cached to avoid extra account look-ups).
    pub owner: Pubkey,        // 32
    /// Rental start timestamp (Unix).
    pub start_time: i64,      // 8
    /// Rental end timestamp (Unix).
    pub end_time: i64,        // 8
    /// Deposit portion — returned to renter on `return_item`.
    pub deposit_amount: u64,  // 8
    /// Rental fee portion — paid to owner on `return_item`.
    pub rental_fee: u64,      // 8
    /// deposit_amount + rental_fee — total lamports locked in this account.
    pub total_paid: u64,      // 8
    /// Current lifecycle state.
    pub status: RentalStatus, // 1
    /// PDA bump.
    pub bump: u8,             // 1
}

impl RentalAgreement {
    pub const SEED_PREFIX: &'static [u8] = b"rental";
}

use anchor_lang::prelude::*;

/// An item available for rent, created by the owner.
/// PDA seeds: ["listing", owner, item_name]
#[account]
#[derive(InitSpace)]
pub struct RentalListing {
    /// Wallet of the item owner / lessor.
    pub owner: Pubkey,               // 32
    /// Short name used as PDA seed — immutable after creation.
    #[max_len(64)]
    pub item_name: String,           // 4 + 64
    /// Human-readable description shown in the catalog.
    #[max_len(256)]
    pub description: String,         // 4 + 256
    /// Rental price per day in lamports.
    pub price_per_day: u64,          // 8
    /// Deposit held in escrow for the duration of the rental.
    pub deposit_amount: u64,         // 8
    /// UI category tag (e.g. "Electronics", "Sports").
    #[max_len(32)]
    pub category: String,            // 4 + 32
    /// False while the item is actively rented out.
    pub is_available: bool,          // 1
    /// Unix timestamp when the listing was created.
    pub created_at: i64,             // 8
    /// PDA bump.
    pub bump: u8,                    // 1
}

impl RentalListing {
    pub const SEED_PREFIX: &'static [u8] = b"listing";
}

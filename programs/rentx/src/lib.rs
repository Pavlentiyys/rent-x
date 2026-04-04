use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod instructions;
pub mod state;

// Re-export account types at the crate root so Anchor's IDL generator
// can resolve `crate::UserProfile` etc. during `--features idl-build` pass.
pub use state::*;

// The #[program] macro generates `use crate::__client_accounts_*` for each
// instruction. When #[derive(Accounts)] structs live in sub-modules those
// generated modules must be re-exported here so the path resolves.
pub(crate) use instructions::create_listing::__client_accounts_create_listing;
pub(crate) use instructions::initialize_user::__client_accounts_initialize_user;
pub(crate) use instructions::rent_item::__client_accounts_rent_item;
pub(crate) use instructions::return_item::__client_accounts_return_item;
pub(crate) use instructions::verify_user::__client_accounts_verify_user;

use instructions::{CreateListing, InitializeUser, RentItem, ReturnItem, VerifyUser};

declare_id!("H8dxbPQhNTmDiJwpJPGeJ3QnA8zaYsYGHv1yumysws8k");

#[program]
pub mod rentx {
    use super::*;

    /// Creates a UserProfile PDA. Must be called once before any rental action.
    pub fn initialize_user(ctx: Context<InitializeUser>) -> Result<()> {
        instructions::initialize_user::handler(ctx)
    }

    /// Platform marks the user as KYC-verified on-chain.
    pub fn verify_user(ctx: Context<VerifyUser>) -> Result<()> {
        instructions::verify_user::handler(ctx)
    }

    /// Owner creates a RentalListing PDA with price and deposit terms.
    pub fn create_listing(
        ctx: Context<CreateListing>,
        item_name: String,
        description: String,
        price_per_day: u64,
        deposit_amount: u64,
        category: String,
    ) -> Result<()> {
        instructions::create_listing::handler(
            ctx,
            item_name,
            description,
            price_per_day,
            deposit_amount,
            category,
        )
    }

    /// Renter locks deposit + rental fee into escrow. Listing becomes unavailable.
    pub fn rent_item(ctx: Context<RentItem>, start_time: i64, end_time: i64) -> Result<()> {
        instructions::rent_item::handler(ctx, start_time, end_time)
    }

    /// Operator confirms return. Deposit → renter, rental fee → owner.
    pub fn return_item(ctx: Context<ReturnItem>) -> Result<()> {
        instructions::return_item::handler(ctx)
    }
}

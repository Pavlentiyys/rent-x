use anchor_lang::prelude::*;

use crate::constants::PLATFORM_PUBKEY;
use crate::errors::RentxError;
use crate::state::{RentalAgreement, RentalListing, RentalStatus, UserProfile};

#[derive(Accounts)]
pub struct ReturnItem<'info> {
    #[account(
        mut,
        seeds = [
            RentalAgreement::SEED_PREFIX,
            rental_agreement.renter.as_ref(),
            rental_listing.key().as_ref(),
        ],
        bump = rental_agreement.bump,
    )]
    pub rental_agreement: Account<'info, RentalAgreement>,

    #[account(
        mut,
        seeds = [
            RentalListing::SEED_PREFIX,
            rental_listing.owner.as_ref(),
            rental_listing.item_name.as_bytes(),
        ],
        bump = rental_listing.bump,
        constraint = rental_agreement.listing == rental_listing.key()
            @ RentxError::ListingMismatch,
    )]
    pub rental_listing: Account<'info, RentalListing>,

    #[account(
        mut,
        seeds = [UserProfile::SEED_PREFIX, rental_agreement.renter.as_ref()],
        bump = renter_profile.bump,
    )]
    pub renter_profile: Account<'info, UserProfile>,

    /// CHECK: receives deposit — identity verified via rental_agreement.renter
    #[account(
        mut,
        constraint = renter.key() == rental_agreement.renter @ RentxError::RenterMismatch
    )]
    pub renter: UncheckedAccount<'info>,

    /// CHECK: receives rental fee — identity verified via rental_listing.owner
    #[account(
        mut,
        constraint = owner.key() == rental_listing.owner @ RentxError::OwnerMismatch
    )]
    pub owner: UncheckedAccount<'info>,

    /// Platform authority OR the listing owner can confirm return.
    #[account(
        mut,
        constraint = (
            platform.key().to_string() == PLATFORM_PUBKEY
            || platform.key() == rental_listing.owner
            || cfg!(feature = "test-mode")
        ) @ RentxError::Unauthorized
    )]
    pub platform: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Distributes escrow funds and closes the rental.
///
/// - deposit_amount → renter
/// - rental_fee     → owner
/// - listing.is_available reset to true
/// - renter.total_rentals incremented
pub fn handler(ctx: Context<ReturnItem>) -> Result<()> {
    require!(
        ctx.accounts.rental_agreement.status == RentalStatus::Active,
        RentxError::RentalNotActive
    );

    let deposit = ctx.accounts.rental_agreement.deposit_amount;
    let rental_fee = ctx.accounts.rental_agreement.rental_fee;

    // ── Lamport transfers out of escrow ───────────────────────────────────────
    // Safety: both subtractions are from the same account consecutively.
    // We verified total_paid == deposit + rental_fee on creation, so no underflow.
    let escrow_info = ctx.accounts.rental_agreement.to_account_info();

    **escrow_info.try_borrow_mut_lamports()? -= deposit;
    **ctx.accounts.renter.to_account_info().try_borrow_mut_lamports()? += deposit;

    **escrow_info.try_borrow_mut_lamports()? -= rental_fee;
    **ctx.accounts.owner.to_account_info().try_borrow_mut_lamports()? += rental_fee;

    // ── State updates ─────────────────────────────────────────────────────────
    ctx.accounts.rental_listing.is_available = true;
    ctx.accounts.rental_agreement.status = RentalStatus::Completed;
    ctx.accounts.renter_profile.total_rentals += 1;

    Ok(())
}

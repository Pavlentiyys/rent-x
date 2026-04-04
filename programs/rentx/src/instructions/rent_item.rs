use anchor_lang::prelude::*;
use anchor_lang::system_program;

use crate::errors::RentxError;
use crate::state::{RentalAgreement, RentalListing, RentalStatus, UserProfile};

#[derive(Accounts)]
pub struct RentItem<'info> {
    /// New escrow account that will hold deposit + rental fee.
    #[account(
        init,
        payer = renter,
        space = 8 + RentalAgreement::INIT_SPACE,
        seeds = [
            RentalAgreement::SEED_PREFIX,
            renter.key().as_ref(),
            rental_listing.key().as_ref(),
        ],
        bump
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
    )]
    pub rental_listing: Account<'info, RentalListing>,

    /// Renter's UserProfile — must be KYC-verified.
    #[account(
        seeds = [UserProfile::SEED_PREFIX, renter.key().as_ref()],
        bump = renter_profile.bump,
    )]
    pub renter_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub renter: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Locks deposit + rental fee into the RentalAgreement escrow.
/// Marks the listing unavailable for the duration.
pub fn handler(ctx: Context<RentItem>, start_time: i64, end_time: i64) -> Result<()> {
    require!(ctx.accounts.renter_profile.is_verified, RentxError::UserNotVerified);
    require!(ctx.accounts.rental_listing.is_available, RentxError::ListingNotAvailable);
    require!(end_time > start_time, RentxError::InvalidRentalPeriod);

    // Ceiling-divide to get full days
    let days = ((end_time - start_time) as u64 + 86_399) / 86_400;
    require!(days > 0, RentxError::InvalidRentalPeriod);

    // Copy scalar values from listing before any mutable borrow of accounts.
    // (All types are Copy, so no heap allocation.)
    let price_per_day = ctx.accounts.rental_listing.price_per_day;
    let deposit_amount = ctx.accounts.rental_listing.deposit_amount;
    let listing_owner = ctx.accounts.rental_listing.owner;
    let listing_key = ctx.accounts.rental_listing.key();

    let rental_fee = price_per_day
        .checked_mul(days)
        .ok_or(RentxError::Overflow)?;
    let total_locked = rental_fee
        .checked_add(deposit_amount)
        .ok_or(RentxError::Overflow)?;

    // Transfer lamports renter → escrow (agreement account)
    system_program::transfer(
        CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            system_program::Transfer {
                from: ctx.accounts.renter.to_account_info(),
                to: ctx.accounts.rental_agreement.to_account_info(),
            },
        ),
        total_locked,
    )?;

    // Block listing — mutable borrow starts here, after all reads are done
    ctx.accounts.rental_listing.is_available = false;

    // Populate agreement
    let agreement = &mut ctx.accounts.rental_agreement;
    agreement.renter = ctx.accounts.renter.key();
    agreement.listing = listing_key;
    agreement.owner = listing_owner;
    agreement.start_time = start_time;
    agreement.end_time = end_time;
    agreement.deposit_amount = deposit_amount;
    agreement.rental_fee = rental_fee;
    agreement.total_paid = total_locked;
    agreement.status = RentalStatus::Active;
    agreement.bump = ctx.bumps.rental_agreement;

    Ok(())
}

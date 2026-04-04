use anchor_lang::prelude::*;

use crate::constants::{MAX_CATEGORY_LEN, MAX_DESCRIPTION_LEN, MAX_ITEM_NAME_LEN};
use crate::errors::RentxError;
use crate::state::RentalListing;

#[derive(Accounts)]
#[instruction(item_name: String)]
pub struct CreateListing<'info> {
    #[account(
        init,
        payer = owner,
        space = 8 + RentalListing::INIT_SPACE,
        seeds = [
            RentalListing::SEED_PREFIX,
            owner.key().as_ref(),
            item_name.as_bytes(),
        ],
        bump
    )]
    pub rental_listing: Account<'info, RentalListing>,

    #[account(mut)]
    pub owner: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates a RentalListing PDA owned by the signing wallet.
pub fn handler(
    ctx: Context<CreateListing>,
    item_name: String,
    description: String,
    price_per_day: u64,
    deposit_amount: u64,
    category: String,
) -> Result<()> {
    require!(item_name.len() <= MAX_ITEM_NAME_LEN, RentxError::ItemNameTooLong);
    require!(description.len() <= MAX_DESCRIPTION_LEN, RentxError::DescriptionTooLong);
    require!(category.len() <= MAX_CATEGORY_LEN, RentxError::CategoryTooLong);
    require!(price_per_day > 0, RentxError::InvalidPrice);
    require!(deposit_amount > 0, RentxError::InvalidDeposit);

    let listing = &mut ctx.accounts.rental_listing;
    listing.owner = ctx.accounts.owner.key();
    listing.item_name = item_name;
    listing.description = description;
    listing.price_per_day = price_per_day;
    listing.deposit_amount = deposit_amount;
    listing.category = category;
    listing.is_available = true;
    listing.created_at = Clock::get()?.unix_timestamp;
    listing.bump = ctx.bumps.rental_listing;
    Ok(())
}

use anchor_lang::prelude::*;

use crate::state::UserProfile;

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [UserProfile::SEED_PREFIX, user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/// Creates a UserProfile PDA for the signing wallet.
/// Must be called once before any rental activity.
pub fn handler(ctx: Context<InitializeUser>) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    profile.owner = ctx.accounts.user.key();
    profile.is_verified = false;
    profile.verified_at = 0;
    profile.total_rentals = 0;
    profile.bump = ctx.bumps.user_profile;
    Ok(())
}

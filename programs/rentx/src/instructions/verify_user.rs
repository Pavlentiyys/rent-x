use anchor_lang::prelude::*;

use crate::constants::PLATFORM_PUBKEY;
use crate::errors::RentxError;
use crate::state::UserProfile;

#[derive(Accounts)]
pub struct VerifyUser<'info> {
    #[account(
        mut,
        seeds = [UserProfile::SEED_PREFIX, user_profile.owner.as_ref()],
        bump = user_profile.bump,
    )]
    pub user_profile: Account<'info, UserProfile>,

    /// Platform authority. Must match PLATFORM_PUBKEY (or test-mode feature).
    #[account(
        mut,
        constraint = (
            platform.key().to_string() == PLATFORM_PUBKEY
            || cfg!(feature = "test-mode")
        ) @ RentxError::Unauthorized
    )]
    pub platform: Signer<'info>,
}

/// Marks the user's profile as KYC-verified.
/// Only callable by the platform keypair.
pub fn handler(ctx: Context<VerifyUser>) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    profile.is_verified = true;
    profile.verified_at = Clock::get()?.unix_timestamp;
    Ok(())
}

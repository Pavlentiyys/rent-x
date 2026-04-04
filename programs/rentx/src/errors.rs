use anchor_lang::prelude::*;

#[error_code]
pub enum RentxError {
    // ── User ──────────────────────────────────────────────────────────────────
    #[msg("User is not verified. Complete KYC first.")]
    UserNotVerified,
    #[msg("Unauthorized: caller is not the platform authority.")]
    Unauthorized,

    // ── Listing ───────────────────────────────────────────────────────────────
    #[msg("Listing is not available for rent.")]
    ListingNotAvailable,
    #[msg("Item name exceeds 64 characters.")]
    ItemNameTooLong,
    #[msg("Description exceeds 256 characters.")]
    DescriptionTooLong,
    #[msg("Category exceeds 32 characters.")]
    CategoryTooLong,
    #[msg("Price must be greater than zero.")]
    InvalidPrice,
    #[msg("Deposit must be greater than zero.")]
    InvalidDeposit,

    // ── Rental ────────────────────────────────────────────────────────────────
    #[msg("Rental period is invalid (end must be after start).")]
    InvalidRentalPeriod,
    #[msg("Rental agreement is not active.")]
    RentalNotActive,
    #[msg("Listing key does not match rental agreement.")]
    ListingMismatch,
    #[msg("Renter key does not match rental agreement.")]
    RenterMismatch,
    #[msg("Owner key does not match listing.")]
    OwnerMismatch,

    // ── Math ──────────────────────────────────────────────────────────────────
    #[msg("Arithmetic overflow.")]
    Overflow,
}

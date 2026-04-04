/// Platform authority pubkey (base58).
/// Replace before mainnet: `solana-keygen new -o keypairs/platform.json`
pub const PLATFORM_PUBKEY: &str = "11111111111111111111111111111111";

/// PDA seeds
pub const SEED_USER: &[u8] = b"user";
pub const SEED_LISTING: &[u8] = b"listing";
pub const SEED_RENTAL: &[u8] = b"rental";

/// Field length limits (enforced in instruction handlers)
pub const MAX_ITEM_NAME_LEN: usize = 64;
pub const MAX_DESCRIPTION_LEN: usize = 256;
pub const MAX_CATEGORY_LEN: usize = 32;

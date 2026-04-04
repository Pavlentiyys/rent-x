import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { assert } from "chai";
import { Rentx } from "../programs/target/types/rentx";

describe("rentx", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Rentx as Program<Rentx>;
  const connection = provider.connection;

  // Wallets
  const platform = (provider.wallet as anchor.Wallet).payer;
  const owner = Keypair.generate();
  const renter = Keypair.generate();

  // Test item data
  const itemName = "DJI Mavic 3 Pro";
  const description = "Professional drone for aerial photography";
  const pricePerDay = new BN(0.05 * LAMPORTS_PER_SOL); // 0.05 SOL/day
  const depositAmount = new BN(0.5 * LAMPORTS_PER_SOL);  // 0.5 SOL deposit
  const category = "Electronics";

  // PDA helpers
  const getUserProfilePDA = (wallet: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("user"), wallet.toBuffer()],
      program.programId
    );

  const getListingPDA = (ownerKey: PublicKey, name: string) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("listing"), ownerKey.toBuffer(), Buffer.from(name)],
      program.programId
    );

  const getRentalAgreementPDA = (renterKey: PublicKey, listingKey: PublicKey) =>
    PublicKey.findProgramAddressSync(
      [Buffer.from("rental"), renterKey.toBuffer(), listingKey.toBuffer()],
      program.programId
    );

  before(async () => {
    // Fund test wallets
    const latestBlockhash = await connection.getLatestBlockhash();

    const airdropOwner = await connection.requestAirdrop(
      owner.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    await connection.confirmTransaction({
      signature: airdropOwner,
      ...latestBlockhash,
    });

    const airdropRenter = await connection.requestAirdrop(
      renter.publicKey,
      2 * LAMPORTS_PER_SOL
    );
    const latestBlockhash2 = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: airdropRenter,
      ...latestBlockhash2,
    });
  });

  it("initialize_user: creates a user profile for the owner", async () => {
    const [ownerProfile] = getUserProfilePDA(owner.publicKey);

    await program.methods
      .initializeUser()
      .accounts({
        userProfile: ownerProfile,
        user: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const profile = await program.account.userProfile.fetch(ownerProfile);
    assert.equal(profile.owner.toBase58(), owner.publicKey.toBase58());
    assert.equal(profile.isVerified, false);
    assert.equal(profile.totalRentals, 0);
  });

  it("initialize_user: creates a user profile for the renter", async () => {
    const [renterProfile] = getUserProfilePDA(renter.publicKey);

    await program.methods
      .initializeUser()
      .accounts({
        userProfile: renterProfile,
        user: renter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([renter])
      .rpc();

    const profile = await program.account.userProfile.fetch(renterProfile);
    assert.equal(profile.isVerified, false);
  });

  it("verify_user: platform verifies the renter", async () => {
    const [renterProfile] = getUserProfilePDA(renter.publicKey);

    await program.methods
      .verifyUser()
      .accounts({
        userProfile: renterProfile,
        platform: platform.publicKey,
      })
      .signers([platform])
      .rpc();

    const profile = await program.account.userProfile.fetch(renterProfile);
    assert.equal(profile.isVerified, true);
    assert.isAbove(profile.verifiedAt.toNumber(), 0);
  });

  it("create_listing: owner creates a rental listing", async () => {
    const [listingPDA] = getListingPDA(owner.publicKey, itemName);

    await program.methods
      .createListing(itemName, description, pricePerDay, depositAmount, category)
      .accounts({
        rentalListing: listingPDA,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const listing = await program.account.rentalListing.fetch(listingPDA);
    assert.equal(listing.owner.toBase58(), owner.publicKey.toBase58());
    assert.equal(listing.itemName, itemName);
    assert.equal(listing.isAvailable, true);
    assert.ok(listing.pricePerDay.eq(pricePerDay));
    assert.ok(listing.depositAmount.eq(depositAmount));
  });

  it("rent_item: renter locks deposit + payment in escrow", async () => {
    const [listingPDA] = getListingPDA(owner.publicKey, itemName);
    const [renterProfilePDA] = getUserProfilePDA(renter.publicKey);
    const [agreementPDA] = getRentalAgreementPDA(renter.publicKey, listingPDA);

    const now = Math.floor(Date.now() / 1000);
    const startTime = new BN(now + 60);           // 1 min from now
    const endTime = new BN(now + 60 + 2 * 86400); // 2 days

    const renterBalanceBefore = await connection.getBalance(renter.publicKey);

    await program.methods
      .rentItem(startTime, endTime)
      .accounts({
        rentalAgreement: agreementPDA,
        rentalListing: listingPDA,
        renterProfile: renterProfilePDA,
        renter: renter.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([renter])
      .rpc();

    const agreement = await program.account.rentalAgreement.fetch(agreementPDA);
    assert.equal(agreement.renter.toBase58(), renter.publicKey.toBase58());
    assert.ok("active" in agreement.status);

    // 2 days × 0.05 SOL + 0.5 SOL deposit = 0.6 SOL
    const expectedLocked =
      pricePerDay.toNumber() * 2 + depositAmount.toNumber();
    assert.ok(agreement.totalPaid.toNumber() === expectedLocked);

    // Listing should now be unavailable
    const listing = await program.account.rentalListing.fetch(listingPDA);
    assert.equal(listing.isAvailable, false);

    // Renter balance decreased
    const renterBalanceAfter = await connection.getBalance(renter.publicKey);
    assert.isBelow(renterBalanceAfter, renterBalanceBefore);
  });

  it("return_item: platform confirms return, deposit returned to renter", async () => {
    const [listingPDA] = getListingPDA(owner.publicKey, itemName);
    const [renterProfilePDA] = getUserProfilePDA(renter.publicKey);
    const [agreementPDA] = getRentalAgreementPDA(renter.publicKey, listingPDA);

    const renterBalanceBefore = await connection.getBalance(renter.publicKey);
    const ownerBalanceBefore = await connection.getBalance(owner.publicKey);

    await program.methods
      .returnItem()
      .accounts({
        rentalAgreement: agreementPDA,
        rentalListing: listingPDA,
        renterProfile: renterProfilePDA,
        renter: renter.publicKey,
        owner: owner.publicKey,
        platform: platform.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([platform])
      .rpc();

    const agreement = await program.account.rentalAgreement.fetch(agreementPDA);
    assert.ok("completed" in agreement.status);

    // Listing is available again
    const listing = await program.account.rentalListing.fetch(listingPDA);
    assert.equal(listing.isAvailable, true);

    // Renter got deposit back
    const renterBalanceAfter = await connection.getBalance(renter.publicKey);
    assert.isAbove(renterBalanceAfter, renterBalanceBefore);

    // Owner got rental fee
    const ownerBalanceAfter = await connection.getBalance(owner.publicKey);
    assert.isAbove(ownerBalanceAfter, ownerBalanceBefore);

    // Renter's total_rentals incremented
    const renterProfile = await program.account.userProfile.fetch(renterProfilePDA);
    assert.equal(renterProfile.totalRentals, 1);
  });

  it("rent_item: fails if renter is not verified", async () => {
    // Owner tries to rent their own item (not verified as renter)
    const [listingPDA] = getListingPDA(owner.publicKey, itemName);
    const [ownerProfilePDA] = getUserProfilePDA(owner.publicKey);

    // Create a second listing to test
    const itemName2 = "Sony A7R V Camera";
    const [listingPDA2] = getListingPDA(owner.publicKey, itemName2);

    await program.methods
      .createListing(
        itemName2,
        "Full-frame mirrorless camera",
        pricePerDay,
        depositAmount,
        category
      )
      .accounts({
        rentalListing: listingPDA2,
        owner: owner.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    const [agreementPDA] = getRentalAgreementPDA(owner.publicKey, listingPDA2);
    const now = Math.floor(Date.now() / 1000);

    try {
      await program.methods
        .rentItem(new BN(now + 60), new BN(now + 86460))
        .accounts({
          rentalAgreement: agreementPDA,
          rentalListing: listingPDA2,
          renterProfile: ownerProfilePDA,
          renter: owner.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([owner])
        .rpc();
      assert.fail("Should have thrown UserNotVerified error");
    } catch (err: any) {
      assert.include(err.message, "UserNotVerified");
    }
  });
});

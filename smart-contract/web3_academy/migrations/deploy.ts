import * as anchor from "@project-serum/anchor";
import { Keypair } from "@solana/web3.js";

const main = async () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.LmsContract;

  // Generate a new cohort account
  const cohort = Keypair.generate();

  await program.methods
    .createCohort("Solana Devs", "Learn Solana smart contracts", 1700000000, 1700600000)
    .accounts({
      cohort: cohort.publicKey,
      signer: provider.wallet.publicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .signers([cohort])
    .rpc();

  console.log("✅ Cohort deployed:", cohort.publicKey.toBase58());
};

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
});
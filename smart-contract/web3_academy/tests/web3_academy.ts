import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Web3Academy } from "../target/types/web3_academy";

describe("web3_academy", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Web3Academy as Program<Web3Academy>;

  it("Is initialized!", async () => {
    const cohort = anchor.web3.Keypair.generate();

    await program.methods
      .createCohort("Solana Devs", "Learn Solana smart contracts", 1700000000, 1700600000)
      .accounts({
        cohort: cohort.publicKey,
        signer: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([cohort])
      .rpc();

    const cohortAccount = await program.account.cohortAccount.fetch(cohort.publicKey);
    console.log("Cohort created:", cohortAccount);
  });
});
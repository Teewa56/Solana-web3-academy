import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Web3Academy } from "../target/types/web3_academy";
import { PublicKey, Keypair, SystemProgram } from "@solana/web3.js";
import { expect } from "chai";

describe("web3_academy", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Web3Academy as Program<Web3Academy>;
  const authority = provider.wallet as anchor.Wallet;

  let roleAccount: PublicKey;
  let cohortAccount: PublicKey;
  let courseAccount: PublicKey;
  let enrollmentAccount: PublicKey;
  let assignmentAccount: PublicKey;
  let submissionAccount: PublicKey;

  const cohortName = "Solana Bootcamp 2024";
  const courseTitle = "Intro to Anchor";

  it("Creates an admin role", async () => {
    [roleAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("role"), authority.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .createRole(true, false)
      .accounts({
        role: roleAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const role = await program.account.roleAccount.fetch(roleAccount);
    expect(role.isAdmin).to.be.true;
    expect(role.authority.toBase58()).to.equal(authority.publicKey.toBase58());
    
    console.log("✅ Role created:", roleAccount.toBase58());
  });

  it("Creates a cohort", async () => {
    [cohortAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("cohort"), Buffer.from(cohortName)],
      program.programId
    );

    const startDate = Math.floor(Date.now() / 1000);
    const endDate = startDate + 90 * 24 * 60 * 60; // 90 days later

    await program.methods
      .createCohort(
        cohortName,
        "Learn Solana development from scratch",
        new anchor.BN(startDate),
        new anchor.BN(endDate)
      )
      .accounts({
        cohort: cohortAccount,
        role: roleAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const cohort = await program.account.cohortAccount.fetch(cohortAccount);
    expect(cohort.name).to.equal(cohortName);
    expect(cohort.status).to.deep.equal({ upcoming: {} });
    
    console.log("✅ Cohort created:", cohortAccount.toBase58());
  });

  it("Updates cohort status to Active", async () => {
    await program.methods
      .updateCohortStatus({ active: {} })
      .accounts({
        cohort: cohortAccount,
        role: roleAccount,
        authority: authority.publicKey,
      })
      .rpc();

    const cohort = await program.account.cohortAccount.fetch(cohortAccount);
    expect(cohort.status).to.deep.equal({ active: {} });
    
    console.log("✅ Cohort status updated to Active");
  });

  it("Creates a course", async () => {
    [courseAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("course"), Buffer.from(courseTitle)],
      program.programId
    );

    await program.methods
      .createCourse(
        courseTitle,
        "Learn the fundamentals of Anchor framework",
        "https://ipfs.io/ipfs/QmExample",
        cohortAccount
      )
      .accounts({
        course: courseAccount,
        role: roleAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const course = await program.account.courseAccount.fetch(courseAccount);
    expect(course.title).to.equal(courseTitle);
    expect(course.cohort.toBase58()).to.equal(cohortAccount.toBase58());
    
    console.log("✅ Course created:", courseAccount.toBase58());
  });

  it("Enrolls a student", async () => {
    const student = Keypair.generate();
    
    // Airdrop SOL to student
    const signature = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    [enrollmentAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("enrollment"), student.publicKey.toBuffer()],
      program.programId
    );

    await program.methods
      .enrollStudent(cohortAccount)
      .accounts({
        enrollment: enrollmentAccount,
        student: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    const enrollment = await program.account.enrollmentAccount.fetch(enrollmentAccount);
    expect(enrollment.student.toBase58()).to.equal(student.publicKey.toBase58());
    expect(enrollment.cohort.toBase58()).to.equal(cohortAccount.toBase58());
    
    console.log("✅ Student enrolled:", enrollmentAccount.toBase58());
  });

  it("Creates an assignment template", async () => {
    const assignmentTitle = "Build a Token Program";
    
    [assignmentAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("assignment"), Buffer.from(assignmentTitle)],
      program.programId
    );

    const deadline = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 days

    await program.methods
      .createAssignmentTemplate(
        assignmentTitle,
        "Create a SPL token with custom metadata",
        new anchor.BN(deadline),
        courseAccount
      )
      .accounts({
        template: assignmentAccount,
        role: roleAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const assignment = await program.account.assignmentTemplateAccount.fetch(assignmentAccount);
    expect(assignment.title).to.equal(assignmentTitle);
    
    console.log("✅ Assignment created:", assignmentAccount.toBase58());
  });

  it("Student submits assignment", async () => {
    const student = Keypair.generate();
    
    // Airdrop SOL to student
    const signature = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
    
    [submissionAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("submission"), student.publicKey.toBuffer(), assignmentAccount.toBuffer()],
      program.programId
    );
    
    await program.methods
      .submitAssignment(
        "https://ipfs.io/ipfs/QmStudentSubmission",
        assignmentAccount
      )
      .accounts({
        submission: submissionAccount,
        student: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();
      
    const submission = await program.account.submissionAccount.fetch(submissionAccount);
    expect(submission.student.toBase58()).to.equal(student.publicKey.toBase58());
    expect(submission.assignment.toBase58()).to.equal(assignmentAccount.toBase58());

    console.log("✅ Assignment submitted:", submissionAccount.toBase58());
  });

  it("Grades the submission", async () => {
    await program.methods
      .gradeSubmission(95)
      .accounts({
        submission: submissionAccount,
        role: roleAccount,
        authority: authority.publicKey,
      })
      .rpc();
      
    const submission = await program.account.submissionAccount.fetch(submissionAccount);
    expect(submission.grade).to.equal(95);

    console.log("✅ Submission graded with score:", submission.grade);
  });

  it("Issues a certificate", async () => {
    const student = Keypair.generate();

    // Airdrop SOL to student
    const signature = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);
    
    let certificateAccount: PublicKey;
    [certificateAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("certificate"), student.publicKey.toBuffer(), courseAccount.toBuffer()],
      program.programId
    );
    await program.methods
      .issueCertificate(courseAccount, student.publicKey)
      .accounts({
        certificate: certificateAccount,
        role: roleAccount,
        authority: authority.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const certificate = await program.account.certificateAccount.fetch(certificateAccount);
    expect(certificate.student.toBase58()).to.equal(student.publicKey.toBase58());
    expect(certificate.course.toBase58()).to.equal(courseAccount.toBase58());
    
    console.log("✅ Certificate issued:", certificateAccount.toBase58());
  });

  it("Prevents non-admin from creating a cohort", async () => {
    const nonAdmin = Keypair.generate();

    // Airdrop SOL to non-admin
    const signature = await provider.connection.requestAirdrop(
      nonAdmin.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const fakeRoleAccount = Keypair.generate();
    await program.methods
      .createRole(false, false)
      .accounts({
        role: fakeRoleAccount.publicKey,
        authority: nonAdmin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([nonAdmin, fakeRoleAccount])
      .rpc();

    let fakeCohortAccount: PublicKey;
    [fakeCohortAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from("cohort"), Buffer.from("Fake Cohort")],
      program.programId
    );

    try {
      await program.methods
        .createCohort(
          "Fake Cohort",
          "This should fail",
          new anchor.BN(Math.floor(Date.now() / 1000)),
          new anchor.BN(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)
        )
        .accounts({
          cohort: fakeCohortAccount,
          role: fakeRoleAccount.publicKey,
          authority: nonAdmin.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([nonAdmin])
        .rpc();
      expect.fail("Non-admin was able to create a cohort");
    } catch (err) {
      expect(err.message).to.include("Unauthorized");
      console.log("✅ Non-admin prevented from creating a cohort");
    }
  });
});
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
      [Buffer.from("submission"), student.publicKey.toBuffer(), courseAccount.toBuffer()],
      program.programId
    );

    const submissionLink = "https://github.com/student/assignment-submission";

    await program.methods
      .submitAssignment(courseAccount, submissionLink)
      .accounts({
        submission: submissionAccount,
        course: courseAccount,
        student: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    const submission = await program.account.assignmentSubmissionAccount.fetch(submissionAccount);
    expect(submission.student.toBase58()).to.equal(student.publicKey.toBase58());
    expect(submission.submissionLink).to.equal(submissionLink);
    expect(submission.grade).to.be.null;
    
    console.log("✅ Assignment submitted:", submissionAccount.toBase58());
  });

  it("Instructor grades assignment", async () => {
    const grade = 85;

    await program.methods
      .gradeAssignment(grade)
      .accounts({
        submission: submissionAccount,
        role: roleAccount,
        instructor: authority.publicKey,
      })
      .rpc();

    const submission = await program.account.assignmentSubmissionAccount.fetch(submissionAccount);
    expect(submission.grade).to.equal(grade);
    
    console.log("✅ Assignment graded with score:", grade);
  });

  it("Rejects invalid grade", async () => {
    const student = Keypair.generate();
    const invalidGrade = 150; // > 100

    // Airdrop SOL
    const sig = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(sig);

    const [invalidSubmission] = PublicKey.findProgramAddressSync(
      [Buffer.from("submission"), student.publicKey.toBuffer(), courseAccount.toBuffer()],
      program.programId
    );

    // Try to grade with invalid score
    try {
      await program.methods
        .gradeAssignment(invalidGrade)
        .accounts({
          submission: invalidSubmission,
          role: roleAccount,
          instructor: authority.publicKey,
        })
        .rpc();
      
      expect.fail("Should have thrown error for invalid grade");
    } catch (error) {
      expect(error.message).to.include("Grade must be between 0 and 100");
      console.log("✅ Invalid grade correctly rejected");
    }
  });

  it("Creates role with instructor permissions", async () => {
    const instructor = Keypair.generate();

    const [instructorRole] = PublicKey.findProgramAddressSync(
      [Buffer.from("role"), instructor.publicKey.toBuffer()],
      program.programId
    );

    // Airdrop SOL to instructor
    const signature = await provider.connection.requestAirdrop(
      instructor.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    await program.methods
      .createRole(false, true)
      .accounts({
        role: instructorRole,
        authority: instructor.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([instructor])
      .rpc();

    const role = await program.account.roleAccount.fetch(instructorRole);
    expect(role.isAdmin).to.be.false;
    expect(role.isInstructor).to.be.true;
    expect(role.authority.toBase58()).to.equal(instructor.publicKey.toBase58());
    
    console.log("✅ Instructor role created");
  });

  it("Enforces role-based access control", async () => {
    const student = Keypair.generate();

    // Airdrop SOL to student
    const signature = await provider.connection.requestAirdrop(
      student.publicKey,
      2 * anchor.web3.LAMPORTS_PER_SOL
    );
    await provider.connection.confirmTransaction(signature);

    const [studentRole] = PublicKey.findProgramAddressSync(
      [Buffer.from("role"), student.publicKey.toBuffer()],
      program.programId
    );

    // Create student role (not admin, not instructor)
    await program.methods
      .createRole(false, false)
      .accounts({
        role: studentRole,
        authority: student.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([student])
      .rpc();

    const newCohortName = "Unauthorized Cohort";
    const [unAuthCohort] = PublicKey.findProgramAddressSync(
      [Buffer.from("cohort"), Buffer.from(newCohortName)],
      program.programId
    );

    // Try to create cohort as student (should fail)
    try {
      await program.methods
        .createCohort(
          newCohortName,
          "This should fail",
          new anchor.BN(Math.floor(Date.now() / 1000)),
          new anchor.BN(Math.floor(Date.now() / 1000) + 1000)
        )
        .accounts({
          cohort: unAuthCohort,
          role: studentRole,
          authority: student.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([student])
        .rpc();
      
      expect.fail("Should have thrown unauthorized error");
    } catch (error) {
      expect(error.message).to.include("Unauthorized");
      console.log("✅ Role-based access control enforced");
    }
  });
});
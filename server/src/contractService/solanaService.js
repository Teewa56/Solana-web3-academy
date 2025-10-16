const anchor = require('@coral-xyz/anchor');
const { Connection, PublicKey, Keypair, SystemProgram } = require('@solana/web3.js');
const { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, getAssociatedTokenAddress } = require('@solana/spl-token');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

class SolanaService {
    constructor() {
        this.connection = null;
        this.provider = null;
        this.program = null;
        this.wallet = null;
        this.programId = null;
    }

    async initialize() {
        try {
            // Connect to Solana devnet
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
            this.connection = new Connection(rpcUrl, 'confirmed');

            // Load wallet from filesystem
            const walletPath = process.env.WALLET_PATH || path.join(process.env.HOME, '.config/solana/id.json');
            const walletKeypair = Keypair.fromSecretKey(
                Buffer.from(JSON.parse(fs.readFileSync(walletPath, 'utf-8')))
            );

            // Create wallet
            this.wallet = new anchor.Wallet(walletKeypair);

            // Create provider
            this.provider = new anchor.AnchorProvider(
                this.connection,
                this.wallet,
                { commitment: 'confirmed' }
            );

            anchor.setProvider(this.provider);

            // Load program
            this.programId = new PublicKey(process.env.CONTRACT_PROGRAM_ID);
            
            // Load IDL
            const idlPath = path.join(__dirname, '../../idl/web3_academy.json');
            const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
            
            this.program = new anchor.Program(idl, this.programId, this.provider);

            logger.info('Solana service initialized successfully');
            logger.info(`Program ID: ${this.programId.toBase58()}`);
            logger.info(`Wallet: ${this.wallet.publicKey.toBase58()}`);

            return true;
        } catch (error) {
            logger.error('Failed to initialize Solana service:', error);
            throw error;
        }
    }

    // Create role account for user
    async createRole(userPubkey, isAdmin = false, isInstructor = false) {
        try {
            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(userPubkey).toBuffer()],
                this.programId
            );

            const tx = await this.program.methods
                .createRole(isAdmin, isInstructor)
                .accounts({
                    role: roleAccount,
                    authority: new PublicKey(userPubkey),
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            logger.info(`Role created for ${userPubkey}: ${tx}`);
            
            return {
                success: true,
                roleAccount: roleAccount.toBase58(),
                txId: tx
            };
        } catch (error) {
            logger.error('Error creating role:', error);
            throw error;
        }
    }

    // Create cohort
    async createCohort(name, description, startDate, endDate, creatorPubkey) {
        try {
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(name)],
                this.programId
            );

            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(creatorPubkey).toBuffer()],
                this.programId
            );

            const tx = await this.program.methods
                .createCohort(
                    name,
                    description,
                    new anchor.BN(startDate),
                    new anchor.BN(endDate)
                )
                .accounts({
                    cohort: cohortAccount,
                    role: roleAccount,
                    authority: new PublicKey(creatorPubkey),
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            logger.info(`Cohort created: ${tx}`);
            
            return {
                success: true,
                cohortAccount: cohortAccount.toBase58(),
                txId: tx
            };
        } catch (error) {
            logger.error('Error creating cohort:', error);
            throw error;
        }
    }

    // Update cohort status
    async updateCohortStatus(cohortName, newStatus, authorityPubkey) {
        try {
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(cohortName)],
                this.programId
            );

            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(authorityPubkey).toBuffer()],
                this.programId
            );

            // Convert status string to enum
            const statusEnum = { [newStatus.toLowerCase()]: {} };

            const tx = await this.program.methods
                .updateCohortStatus(statusEnum)
                .accounts({
                    cohort: cohortAccount,
                    role: roleAccount,
                    authority: new PublicKey(authorityPubkey),
                })
                .rpc();

            logger.info(`Cohort status updated: ${tx}`);
            
            return {
                success: true,
                txId: tx
            };
        } catch (error) {
            logger.error('Error updating cohort status:', error);
            throw error;
        }
    }

    // Create course
    async createCourse(title, description, mediaUrl, cohortPubkey, instructorPubkey) {
        try {
            const [courseAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('course'), Buffer.from(title)],
                this.programId
            );

            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(instructorPubkey).toBuffer()],
                this.programId
            );

            const tx = await this.program.methods
                .createCourse(
                    title,
                    description,
                    mediaUrl,
                    new PublicKey(cohortPubkey)
                )
                .accounts({
                    course: courseAccount,
                    role: roleAccount,
                    authority: new PublicKey(instructorPubkey),
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            logger.info(`Course created: ${tx}`);
            
            return {
                success: true,
                courseAccount: courseAccount.toBase58(),
                txId: tx
            };
        } catch (error) {
            logger.error('Error creating course:', error);
            throw error;
        }
    }

    // Enroll student
    async enrollStudent(studentPubkey, cohortPubkey) {
        try {
            const [enrollmentAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('enrollment'), new PublicKey(studentPubkey).toBuffer()],
                this.programId
            );

            const tx = await this.program.methods
                .enrollStudent(new PublicKey(cohortPubkey))
                .accounts({
                    enrollment: enrollmentAccount,
                    student: new PublicKey(studentPubkey),
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            logger.info(`Student enrolled: ${tx}`);
            
            return {
                success: true,
                enrollmentAccount: enrollmentAccount.toBase58(),
                txId: tx
            };
        } catch (error) {
            logger.error('Error enrolling student:', error);
            throw error;
        }
    }

    // Submit assignment
    async submitAssignment(studentPubkey, coursePubkey, submissionLink) {
        try {
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );

            const tx = await this.program.methods
                .submitAssignment(new PublicKey(coursePubkey), submissionLink)
                .accounts({
                    submission: submissionAccount,
                    course: new PublicKey(coursePubkey),
                    student: new PublicKey(studentPubkey),
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            logger.info(`Assignment submitted: ${tx}`);
            
            return {
                success: true,
                submissionAccount: submissionAccount.toBase58(),
                txId: tx
            };
        } catch (error) {
            logger.error('Error submitting assignment:', error);
            throw error;
        }
    }

    // Grade assignment
    async gradeAssignment(studentPubkey, coursePubkey, grade, instructorPubkey) {
        try {
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );

            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(instructorPubkey).toBuffer()],
                this.programId
            );

            const tx = await this.program.methods
                .gradeAssignment(grade)
                .accounts({
                    submission: submissionAccount,
                    role: roleAccount,
                    instructor: new PublicKey(instructorPubkey),
                })
                .rpc();

            logger.info(`Assignment graded: ${tx}`);
            
            return {
                success: true,
                txId: tx,
                grade
            };
        } catch (error) {
            logger.error('Error grading assignment:', error);
            throw error;
        }
    }

    // Mint certificate NFT
    async mintCertificate(studentPubkey, coursePubkey, metadata) {
        try {
            const mintKeypair = Keypair.generate();
            
            const [metadataAddress] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('metadata'),
                    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                ],
                new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
            );

            const [masterEditionAddress] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('metadata'),
                    new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s').toBuffer(),
                    mintKeypair.publicKey.toBuffer(),
                    Buffer.from('edition'),
                ],
                new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s')
            );

            const tokenAccount = await getAssociatedTokenAddress(
                mintKeypair.publicKey,
                this.wallet.publicKey
            );

            const tx = await this.program.methods
                .mintCertificate(
                    new PublicKey(coursePubkey),
                    metadata.uri,
                    metadata.name,
                    metadata.symbol
                )
                .accounts({
                    mint: mintKeypair.publicKey,
                    tokenAccount: tokenAccount,
                    metadataAccount: metadataAddress,
                    masterEditionAccount: masterEditionAddress,
                    payer: this.wallet.publicKey,
                    rent: anchor.web3.SYSVAR_RENT_PUBKEY,
                    systemProgram: SystemProgram.programId,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
                    tokenMetadataProgram: new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s'),
                })
                .signers([mintKeypair])
                .rpc();

            logger.info(`Certificate NFT minted: ${tx}`);
            
            return {
                success: true,
                mintAddress: mintKeypair.publicKey.toBase58(),
                txId: tx,
                metadataUri: metadata.uri
            };
        } catch (error) {
            logger.error('Error minting certificate:', error);
            throw error;
        }
    }

    // Transfer certificate to student
    async transferCertificate(mintPubkey, fromPubkey, toPubkey) {
        try {
            const fromTokenAccount = await getAssociatedTokenAddress(
                new PublicKey(mintPubkey),
                new PublicKey(fromPubkey)
            );

            const toTokenAccount = await getAssociatedTokenAddress(
                new PublicKey(mintPubkey),
                new PublicKey(toPubkey)
            );

            const tx = await this.program.methods
                .transferCertificate(new anchor.BN(1))
                .accounts({
                    from: fromTokenAccount,
                    to: toTokenAccount,
                    authority: this.wallet.publicKey,
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            logger.info(`Certificate transferred: ${tx}`);
            
            return {
                success: true,
                txId: tx
            };
        } catch (error) {
            logger.error('Error transferring certificate:', error);
            throw error;
        }
    }

    // Get account data
    async getCohortData(cohortName) {
        try {
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(cohortName)],
                this.programId
            );

            const data = await this.program.account.cohortAccount.fetch(cohortAccount);
            return data;
        } catch (error) {
            logger.error('Error fetching cohort:', error);
            throw error;
        }
    }

    async getSubmissionData(studentPubkey, coursePubkey) {
        try {
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );

            const data = await this.program.account.assignmentSubmissionAccount.fetch(submissionAccount);
            return data;
        } catch (error) {
            logger.error('Error fetching submission:', error);
            throw error;
        }
    }
}

const solanaService = new SolanaService();

module.exports = solanaService;
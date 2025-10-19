const { Connection, PublicKey, Keypair, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const logger = require('../utils/logger');

class SolanaService {
    constructor() {
        this.connection = null;
        this.wallet = null;
        this.programId = null;
    }

    async initialize() {
        try {
            await this.setupConnection();
            await this.loadAndDecryptWallet();
            logger.info('✅ Solana service initialized for mainnet');
            return true;
        } catch (error) {
            logger.error('Failed to initialize Solana service:', error);
            throw error;
        }
    }

    async setupConnection() {
        try {
            const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
            this.connection = new Connection(rpcUrl, 'confirmed');
            logger.info(`✅ Connected to Solana: ${rpcUrl}`);

            const programIdStr = process.env.CONTRACT_PROGRAM_ID;
            if (!programIdStr) {
                throw new Error('CONTRACT_PROGRAM_ID environment variable not set');
            }

            this.programId = new PublicKey(programIdStr);
            logger.info(`✅ Program ID: ${this.programId.toBase58()}`);
        } catch (error) {
            logger.error('Failed to setup connection:', error);
            throw error;
        }
    }

    async loadAndDecryptWallet() {
        try {
            const encryptedKey = process.env.SOLANA_SECRET_KEY;
            const encryptionKey = process.env.ENCRYPTION_KEY;

            if (!encryptedKey || !encryptionKey) {
                throw new Error('SOLANA_SECRET_KEY or ENCRYPTION_KEY not configured');
            }

            // Decrypt the wallet
            const decryptedSecretKey = this.decryptSecretKey(encryptedKey, encryptionKey);
            
            // Convert string back to array format
            const secretKeyArray = decryptedSecretKey.split(',').map(Number);
            
            // Create keypair from decrypted key
            this.wallet = Keypair.fromSecretKey(Buffer.from(secretKeyArray));

            logger.info(`✅ Wallet loaded: ${this.wallet.publicKey.toBase58()}`);
        } catch (error) {
            logger.error('Failed to load and decrypt wallet:', error);
            throw error;
        }
    }

    decryptSecretKey(encryptedData, encryptionKey) {
        try {
            const algorithm = 'aes-256-cbc';
            const key = Buffer.from(encryptionKey, 'hex');
            const parts = encryptedData.split(':');
            const iv = Buffer.from(parts[0], 'hex');
            const encrypted = Buffer.from(parts[1], 'hex');

            const decipher = crypto.createDecipheriv(algorithm, key, iv);
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            logger.error('Failed to decrypt wallet:', error);
            throw new Error('Invalid encryption key or corrupted wallet data');
        }
    }

    // STEP 1: Generate PDA (local - no RPC)
    // STEP 2: Check if exists (RPC call)
    // STEP 3: Prepare for transaction (return data to frontend)
    async createRole(userPubkey, isAdmin = false, isInstructor = false) {
        try {
            // STEP 1: Generate PDA locally
            const [roleAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('role'), new PublicKey(userPubkey).toBuffer()],
                this.programId
            );
            logger.info(`STEP 1 - PDA generated: ${roleAccount.toBase58()}`);

            // STEP 2: Check if account exists on blockchain (RPC call)
            const accountInfo = await this.connection.getAccountInfo(roleAccount);
            logger.info(`STEP 2 - RPC Check: Account ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (accountInfo) {
                return {
                    success: true,
                    roleAccount: roleAccount.toBase58(),
                    exists: true,
                    message: 'Role account already exists on-chain'
                };
            }

            // STEP 3: Account doesn't exist - prepare data for frontend to send transaction
            return {
                success: true,
                roleAccount: roleAccount.toBase58(),
                exists: false,
                isAdmin,
                isInstructor,
                message: 'Role account ready to be created. Frontend must send transaction.',
                instruction: {
                    programId: this.programId.toBase58(),
                    accounts: [
                        { pubkey: roleAccount.toBase58(), isMut: true, isSigner: false },
                        { pubkey: userPubkey, isMut: true, isSigner: true },
                        { pubkey: SystemProgram.programId.toBase58(), isMut: false, isSigner: false }
                    ]
                }
            };
        } catch (error) {
            logger.error('Error creating role:', error);
            throw error;
        }
    }

    async createCohort(name, description, startDate, endDate, creatorPubkey) {
        try {
            // STEP 1: Generate PDA locally
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(name)],
                this.programId
            );
            logger.info(`STEP 1 - Cohort PDA generated: ${cohortAccount.toBase58()}`);

            // STEP 2: Check if account exists on blockchain (RPC call)
            const accountInfo = await this.connection.getAccountInfo(cohortAccount);
            logger.info(`STEP 2 - RPC Check: Cohort ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (accountInfo) {
                return {
                    success: true,
                    cohortAccount: cohortAccount.toBase58(),
                    exists: true,
                    message: 'Cohort account already exists on-chain'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                cohortAccount: cohortAccount.toBase58(),
                exists: false,
                name,
                description,
                startDate,
                endDate,
                creatorPubkey,
                message: 'Cohort account ready to be created. Frontend must send transaction.',
                instruction: {
                    programId: this.programId.toBase58(),
                    accounts: [
                        { pubkey: cohortAccount.toBase58(), isMut: true, isSigner: false },
                        { pubkey: creatorPubkey, isMut: true, isSigner: true },
                        { pubkey: SystemProgram.programId.toBase58(), isMut: false, isSigner: false }
                    ]
                }
            };
        } catch (error) {
            logger.error('Error creating cohort:', error);
            throw error;
        }
    }

    async updateCohortStatus(cohortName, newStatus, authorityPubkey) {
        try {
            // STEP 1: Generate PDA locally
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(cohortName)],
                this.programId
            );
            logger.info(`STEP 1 - Cohort PDA: ${cohortAccount.toBase58()}`);

            // STEP 2: Check if account exists (RPC call)
            const accountInfo = await this.connection.getAccountInfo(cohortAccount);
            logger.info(`STEP 2 - RPC Check: Cohort ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (!accountInfo) {
                return {
                    success: false,
                    message: 'Cohort account does not exist on-chain'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                cohortAccount: cohortAccount.toBase58(),
                newStatus,
                message: 'Cohort ready for status update. Frontend must send transaction.',
                instruction: {
                    programId: this.programId.toBase58(),
                    accounts: [
                        { pubkey: cohortAccount.toBase58(), isMut: true, isSigner: false },
                        { pubkey: authorityPubkey, isMut: false, isSigner: true }
                    ]
                }
            };
        } catch (error) {
            logger.error('Error updating cohort status:', error);
            throw error;
        }
    }

    async createCourse(title, description, mediaUrl, cohortPubkey, instructorPubkey) {
        try {
            // STEP 1: Generate PDA locally
            const [courseAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('course'), Buffer.from(title)],
                this.programId
            );
            logger.info(`STEP 1 - Course PDA: ${courseAccount.toBase58()}`);

            // STEP 2: Check if exists (RPC call)
            const accountInfo = await this.connection.getAccountInfo(courseAccount);
            logger.info(`STEP 2 - RPC Check: Course ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (accountInfo) {
                return {
                    success: true,
                    courseAccount: courseAccount.toBase58(),
                    exists: true,
                    message: 'Course account already exists'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                courseAccount: courseAccount.toBase58(),
                exists: false,
                title,
                description,
                mediaUrl,
                cohortPubkey,
                instructorPubkey,
                message: 'Course ready to be created. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error creating course:', error);
            throw error;
        }
    }

    async enrollStudent(studentPubkey, cohortPubkey) {
        try {
            // STEP 1: Generate PDA locally
            const [enrollmentAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('enrollment'), new PublicKey(studentPubkey).toBuffer()],
                this.programId
            );
            logger.info(`STEP 1 - Enrollment PDA: ${enrollmentAccount.toBase58()}`);

            // STEP 2: Check if exists (RPC call)
            const accountInfo = await this.connection.getAccountInfo(enrollmentAccount);
            logger.info(`STEP 2 - RPC Check: Enrollment ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (accountInfo) {
                return {
                    success: true,
                    enrollmentAccount: enrollmentAccount.toBase58(),
                    exists: true,
                    message: 'Student already enrolled'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                enrollmentAccount: enrollmentAccount.toBase58(),
                exists: false,
                studentPubkey,
                cohortPubkey,
                message: 'Student ready to enroll. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error enrolling student:', error);
            throw error;
        }
    }

    async submitAssignment(studentPubkey, coursePubkey, submissionLink) {
        try {
            if (!studentPubkey) throw new Error("studentPubkey is undefined");
            if (!coursePubkey) throw new Error("coursePubkey is undefined");
            
            // STEP 1: Generate PDA locally
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );
            logger.info(`STEP 1 - Submission PDA: ${submissionAccount.toBase58()}`);

            // STEP 2: Check if exists (RPC call)
            const accountInfo = await this.connection.getAccountInfo(submissionAccount);
            logger.info(`STEP 2 - RPC Check: Submission ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (accountInfo) {
                return {
                    success: false,
                    message: 'Assignment already submitted'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                submissionAccount: submissionAccount.toBase58(),
                studentPubkey,
                coursePubkey,
                submissionLink,
                message: 'Assignment ready to submit. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error submitting assignment:', error);
            throw error;
        }
    }

    async gradeAssignment(studentPubkey, coursePubkey, grade, instructorPubkey) {
        try {
            if (grade < 0 || grade > 100) {
                return {
                    success: false,
                    message: 'Grade must be between 0 and 100'
                };
            }

            // STEP 1: Generate PDA locally
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );
            logger.info(`STEP 1 - Submission PDA: ${submissionAccount.toBase58()}`);

            // STEP 2: Check if exists (RPC call)
            const accountInfo = await this.connection.getAccountInfo(submissionAccount);
            logger.info(`STEP 2 - RPC Check: Submission ${accountInfo ? 'EXISTS' : 'DOES NOT EXIST'}`);

            if (!accountInfo) {
                return {
                    success: false,
                    message: 'Submission account not found'
                };
            }

            // STEP 3: Return data for frontend
            return {
                success: true,
                submissionAccount: submissionAccount.toBase58(),
                grade,
                instructorPubkey,
                message: 'Assignment ready to be graded. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error grading assignment:', error);
            throw error;
        }
    }

    async mintCertificate(studentPubkey, coursePubkey, metadata) {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not loaded');
            }
            logger.info(`Preparing certificate mint for student: ${studentPubkey}`);
            
            return {
                success: true,
                studentPubkey,
                coursePubkey,
                metadata,
                message: 'Certificate ready to mint. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error minting certificate:', error);
            throw error;
        }
    }

    async transferCertificate(mintPubkey, fromPubkey, toPubkey) {
        try {
            logger.info(`Preparing certificate transfer from ${fromPubkey} to ${toPubkey}`);
            
            return {
                success: true,
                mintPubkey,
                fromPubkey,
                toPubkey,
                message: 'Certificate ready to transfer. Frontend must send transaction.'
            };
        } catch (error) {
            logger.error('Error transferring certificate:', error);
            throw error;
        }
    }

    // Read data from blockchain (RPC call)
    async getCohortData(cohortName) {
        try {
            // STEP 1: Generate PDA locally
            const [cohortAccount] = PublicKey.findProgramAddressSync(
                [Buffer.from('cohort'), Buffer.from(cohortName)],
                this.programId
            );

            // STEP 2: Fetch account data (RPC call)
            const accountInfo = await this.connection.getAccountInfo(cohortAccount);
            logger.info(`STEP 2 - RPC: Fetched cohort account data`);
            
            if (!accountInfo) {
                return {
                    success: false,
                    message: 'Cohort account not found on-chain'
                };
            }

            return {
                success: true,
                cohortAccount: cohortAccount.toBase58(),
                data: accountInfo.data,
                owner: accountInfo.owner.toBase58()
            };
        } catch (error) {
            logger.error('Error fetching cohort:', error);
            throw error;
        }
    }

    async getSubmissionData(studentPubkey, coursePubkey) {
        try {
            // STEP 1: Generate PDA locally
            const [submissionAccount] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from('submission'),
                    new PublicKey(studentPubkey).toBuffer(),
                    new PublicKey(coursePubkey).toBuffer()
                ],
                this.programId
            );

            // STEP 2: Fetch account data (RPC call)
            const accountInfo = await this.connection.getAccountInfo(submissionAccount);
            logger.info(`STEP 2 - RPC: Fetched submission account data`);
            
            if (!accountInfo) {
                return {
                    success: false,
                    message: 'Submission account not found on-chain'
                };
            }

            return {
                success: true,
                submissionAccount: submissionAccount.toBase58(),
                data: accountInfo.data,
                owner: accountInfo.owner.toBase58()
            };
        } catch (error) {
            logger.error('Error fetching submission:', error);
            throw error;
        }
    }

    // Get wallet balance (RPC call)
    async getWalletBalance() {
        try {
            if (!this.wallet) {
                throw new Error('Wallet not loaded');
            }
            const balance = await this.connection.getBalance(this.wallet.publicKey);
            logger.info(`Wallet balance: ${balance / 1e9} SOL`);
            
            return {
                success: true,
                balance: balance / 1e9,
                lamports: balance
            };
        } catch (error) {
            logger.error('Error getting wallet balance:', error);
            throw error;
        }
    }
}

const solanaService = new SolanaService();
module.exports = solanaService;
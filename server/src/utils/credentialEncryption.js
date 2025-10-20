const crypto = require('crypto');
const logger = require('./logger');

class CredentialEncryptor {
    constructor() {
        this.algorithm = 'aes-256-cbc';
        this.masterKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
        if (this.masterKey.length !== 32) {
            throw new Error('ENCRYPTION_MASTER_KEY must be 32 bytes (64 hex chars)');
        }
    }

    encrypt(plaintext) {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }

    decrypt(encryptedData) {
        try {
            const [iv, encrypted] = encryptedData.split(':');
            const decipher = crypto.createDecipheriv(
                this.algorithm,
                this.masterKey,
                Buffer.from(iv, 'hex')
            );
            let decrypted = decipher.update(encrypted, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            logger.error('Decryption failed:', error);
            throw new Error('Failed to decrypt credential');
        }
    }

    static generateMasterKey() {
        return crypto.randomBytes(32).toString('hex');
    }
}

module.exports = new CredentialEncryptor();
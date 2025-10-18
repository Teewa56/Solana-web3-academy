const bs58 = require('bs58');
const { PublicKey } = require('@solana/web3.js');

const validateSolanaAddress = (address) => {
    try {
        if (!address || typeof address !== 'string') {
            return false;
        }
        const decoded = bs58.decode(address);
        if (decoded.length !== 32) {
            return false;
        }
        new PublicKey(address);
        return true;
    } catch (error) {
        return false;
    }
};

module.exports = { validateSolanaAddress };
const bcrypt = require('bcryptjs');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const verifyOTP = (inputOTP, storedOTP) => inputOTP === storedOTP;

const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

const comparePassword = async (password, hashed) => {
    return bcrypt.compare(password, hashed);
};

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
};

module.exports = {
    generateOTP,
    verifyOTP,
    hashPassword,
    comparePassword,
    cookieOptions,
};
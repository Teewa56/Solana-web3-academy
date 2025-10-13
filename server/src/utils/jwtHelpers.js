const jwt = require('jsonwebtoken');
const { 
    access_token_secret, 
    access_token_expires_in, 
    refresh_token_expires_in, 
    refresh_token_secret 
} = require('../config/env');

const generateAccessToken = (payload) => {
    return jwt.sign(payload, access_token_secret, { expiresIn: access_token_expires_in });
};

const generateRefreshToken = (payload) => {
    return jwt.sign(payload, refresh_token_secret, { expiresIn: refresh_token_expires_in });
};

const verifyAccessToken = (token) => {
    return jwt.verify(token, access_token_secret);
};

const verifyRefreshToken = (token) => {
    return jwt.verify(token, refresh_token_secret);
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
};
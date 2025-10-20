const jsonwebtoken = require('jsonwebtoken');
const { access_token_secret } = require('../config/env');
const User = require('../modules/models/userModel');
const solanaService = require('../contractService/solanaService');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
    const path = req.path;
    const prefix = '/api/v1/auth';
    
    if (path == '/api/v1/health' || path.startsWith(prefix)) {
        return next();
    }
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const user = jsonwebtoken.verify(token, access_token_secret);
        
        // VERIFY ROLE IN DATABASE (don't trust JWT alone)
        const dbUser = await User.findById(user.id).select('role');
        if (!dbUser) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        req.user = {
            id: user.id,
            role: dbUser.role
        };
        
        next();
    } catch (err) {
        return res.status(403).json({ success: false, message: 'Invalid token' });
    }
};

module.exports = authMiddleware;
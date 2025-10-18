const jsonwebtoken = require('jsonwebtoken');
const { access_token_secret } = require('../config/env');

const authMiddleware = (req, res, next) => {
    const path = req.path;
    const prefix = ['/api/v1/auth', '/api/v1/health'];
    
    if (prefix.some(p => path.startsWith(p))) {
        return next();
    }
    
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    jsonwebtoken.verify(token, access_token_secret, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        req.user = user;
        next(); 
    });
};

module.exports = authMiddleware;
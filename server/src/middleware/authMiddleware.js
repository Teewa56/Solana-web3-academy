const jsonwebtoken = require('jsonwebtoken');
const { access_token_secret } = require('../config/env');

const authMiddleware = (req, res, next) => {
    const path = req.path;
    const accessiblePaths = [
        '/api/v1/auth/login', 
        '/api/v1/auth/register'
    ];
    if (accessiblePaths.find(p => p.startsWith(path))) {
        return next();
    }
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);
    jsonwebtoken.verify(token, access_token_secret, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
    });
    next();
}

module.exports = authMiddleware;
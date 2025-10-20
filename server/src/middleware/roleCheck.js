const logger = require('../utils/logger');

const requireAdmin = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Role available to admin only' 
            });
        }
        next();
    } catch (error) {
        logger.error('Role check error:', error);
        res.status(500).json({ message: 'Authorization check failed' });
    }
};

module.exports = { requireAdmin };
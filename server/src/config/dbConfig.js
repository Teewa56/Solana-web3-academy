const mongoose = require('mongoose');
const logger = require('../utils/logger');
const { mongo_uri } = require('./env');

const connectDB = async () => {
    try {
        await mongoose.connect(mongo_uri);
        logger.info('Database connected successfully');
    } catch (error) {
        logger.error('Database connection error:', error);
        process.exit(1);
    }
};

module.exports = connectDB;
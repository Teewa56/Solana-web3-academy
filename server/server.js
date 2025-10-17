const http = require('http');
const app = require('./app');
const { port } = require('./src/config/env');
const connectDB = require('./src/config/dbConfig');
const solanaService = require('./src/contractService/solanaService');
const logger = require('./src/utils/logger');

const server = http.createServer(app);

// Initialize database and services
const initializeServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();
        logger.info('✅ Database connected successfully');

        // Initialize Solana service
        try {
            await solanaService.initialize();
            logger.info('✅ Solana service initialized successfully');
        } catch (solanaError) {
            logger.warn('⚠️  Solana service initialization failed. Blockchain features will be unavailable.');
            logger.error(solanaError.message);
        }

        // Start server
        server.listen(port, () => {
            logger.info(`🚀 Server is running on port ${port}`);
            logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`🌐 API: http://localhost:${port}/api/v1`);
        });
    } catch (error) {
        logger.error('❌ Failed to initialize server:', error);
        process.exit(1);
    }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

// Initialize and start server
initializeServer();
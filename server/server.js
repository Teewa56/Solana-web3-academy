const http = require('http');
const app = require('./app');
const { port } = require('./src/config/env');
const connectDB = require('./src/config/dbConfig');
const solanaService = require('./src/contractService/solanaService');
const logger = require('./src/utils/logger');

const server = http.createServer(app);

const initializeServer = async () => {
    try {
        await connectDB();
        logger.info('✅ Database connected successfully');
        try {
            await solanaService.initialize();
            logger.info('✅ Solana service initialized successfully');
        } catch (solanaError) {
            logger.warn('⚠️  Solana service initialization failed.');
            logger.error(solanaError.message);
        }
        server.listen(port, () => {
            logger.info(`🚀 Server is running on port ${port}`);
        });
    } catch (error) {
        logger.error('❌ Failed to initialize server:', error);
        process.exit(1);
    }
};

initializeServer();
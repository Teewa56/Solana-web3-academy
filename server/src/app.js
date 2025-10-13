const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const {cors_origin_dev, cors_origin_prod, production_enviroment} = require('./config/env');
const rateLimiter = require('./middleware/rateLimiter');
const errorMiddleware = require('./middleware/errorMiddleware');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: production_enviroment === 'production' ? cors_origin_prod : cors_origin_dev,
    credentials: true,
}));
app.use(morgan('combined'));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(compression());
app.use(rateLimiter);
app.use(authMiddleware);
app.use(errorMiddleware);

app.get('/api/v1/', (req, res) => {
    res.send('This is the backend for solana web3 academy');
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
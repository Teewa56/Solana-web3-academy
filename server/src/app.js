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

const authRoutes = require('./modules/auth/authRoutes');
const userRoutes = require('./modules/users/userRoutes');
const studentRoutes = require('./modules/students/studentRoutes');
const cohortRoutes = require('./modules/cohorts/cohortRoutes');
const courseRoutes = require('./modules/courses/courseRoutes');
const assignmentRoutes = require('./modules/cohorts/assignmentRoutes');
const submissionRoutes = require('./modules/cohorts/submissionRoutes');
const certificateRoutes = require('./modules/chain-logic/certificateRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');

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

app.get('/api/v1/health', (req, res) => {
    res.json({ success: true, message: 'Server is healthy' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/students', studentRoutes);
app.use('/api/v1/cohorts', cohortRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/assignments', assignmentRoutes);
app.use('/api/v1/submissions', submissionRoutes);
app.use('/api/v1/certificates', certificateRoutes);
app.use('/api/v1/admin', adminRoutes);

app.get('/api/v1/', (req, res) => {
    res.send('This is the backend for solana web3 academy');
});

app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;
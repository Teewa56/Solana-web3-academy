require('dotenv').config();

const env = {
    production_enviroment: process.env.NODE_ENV,
    port: process.env.PORT,
    db_host: process.env.DB_HOST,
    mongo_uri: process.env.MONGO_URI,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
    access_token_expires_in: process.env.ACCESS_TOKEN_EXPIRES_IN,
    refresh_token_secret: process.env.REFRESH_TOKEN_SECRET,
    refresh_token_expires_in: process.env.REFRESH_TOKEN_EXPIRES_IN,
    salt_rounds: process.env.SALT_ROUNDS,
    cors_origin_dev: process.env.CORS_ORIGIN_LOCAL,
    cors_origin_prod: process.env.CORS_ORIGIN_PROD,
    email: process.env.EMAIL,
    email_password: process.env.EMAIL_PASSWORD,
    smtp_host: process.env.EMAIL_HOST,
    contract_program_id: process.env.CONTRACT_PROGRAM_ID
};

module.exports = env;
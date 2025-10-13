const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { email, email_password, smtp_host } = require('../config/env');

const transporter = nodemailer.createTransport({
    host: smtp_host,
    port: 587,
    secure: false,
    auth: {
        user: email,
        pass: email_password,
    },
});

const sendEmail = async ({ to, subject, template, data }) => {
    const html = await ejs.renderFile(path.join(__dirname, `../templates/${template}.ejs`), data);

    return transporter.sendMail({
        from: `"Gideon from Web3 Academy <${email}>`,
        to,
        subject,
        html,
    });
};

module.exports = sendEmail;
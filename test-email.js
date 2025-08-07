require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    try {
        console.log('Testing email configuration...');
        console.log('Email User:', process.env.EMAIL_USER);
        console.log('App Password Length:', process.env.EMAIL_APP_PASSWORD?.length);
        console.log('Recipients:', process.env.EMAIL_RECIPIENTS);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            debug: true
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_RECIPIENTS,
            subject: 'Test Email Configuration',
            text: 'This is a test email to verify the configuration is working.'
        };

        console.log('Sending test email...');
        const result = await transporter.sendMail(mailOptions);
        console.log('Test email sent successfully:', result);
    } catch (error) {
        console.error('Error sending test email:', error);
    }
}

testEmail();

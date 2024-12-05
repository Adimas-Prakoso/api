const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 8000;

// Middleware
app.use(bodyParser.json());

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    service: "Gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API endpoint for sending HTML email
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, htmlContent } = req.body;

        // Validate required fields
        if (!to || !subject || !htmlContent) {
            return res.status(400).json({ 
                error: 'Missing required fields: to, subject, and htmlContent are required' 
            });
        }

        // Email options
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: htmlContent
        };

        // Send email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ 
            message: 'Email sent successfully' 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            details: error.message 
        });
    }
});

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
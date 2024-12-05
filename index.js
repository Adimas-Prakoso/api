const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: true,
    auth: {
        user: 'adimasdevs@gmail.com',
        pass: 'fmrrdckwkqcemfbv' // Use App Password, not regular password
    }
});

// Verify transporter configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error with email configuration:', error);
    } else {
        console.log('Email server is ready to send messages');
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
            from: `E-Perpustakaan App`,
            to: to,
            subject: subject,
            html: htmlContent
        };

        // Send email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);

        res.status(200).json({ 
            message: 'Email sent successfully',
            messageId: info.messageId
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
    res.json({ 
        message: 'API is running',
        emailConfigured: process.env.EMAIL_USER ? true : false
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
    console.log('Email user configured:', process.env.EMAIL_USER ? 'Yes' : 'No');
});
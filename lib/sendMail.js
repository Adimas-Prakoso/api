import nodemailer from 'nodemailer';

// Create transporter for sending emails
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: 'adimasdevs@gmail.com',
        pass: 'fmrrdckwkqcemfbv'
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

export const sendEmail = async ({ to, subject, htmlContent }) => {
    if (!to || !subject || !htmlContent) {
        throw new Error('Missing required fields: to, subject, and htmlContent are required');
    }

    const mailOptions = {
        from: 'adimasdevs@gmail.com',
        to,
        subject,
        html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    
    return {
        message: 'Email sent successfully',
        messageId: info.messageId
    };
};

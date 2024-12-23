import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sendEmail } from './lib/sendMail.js';

const fastify = Fastify({
    logger: true
});
const port = 8000;

// Middleware
await fastify.register(cors, { 
    origin: true
});

// API endpoint for sending HTML email
fastify.post('/send-email', async (request, reply) => {
    try {
        const result = await sendEmail(request.body);
        return reply.code(200).send(result);
    } catch (error) {
        console.error('Error sending email:', error);
        return reply.code(500).send({ 
            error: 'Failed to send email',
            details: error.message 
        });
    }
});

// Test route
fastify.get('/', async (request, reply) => {
    return { message: 'Fastify API is running' };
});

// Start server
try {
    await fastify.listen({ port: port, host: '0.0.0.0' });
    console.log(`Server is running on port ${port}`);
} catch (err) {
    fastify.log.error(err);
    process.exit(1);
}
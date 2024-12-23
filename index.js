import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sendEmail } from './src/sendMail.js';

const fastify = Fastify({
    logger: true
});

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

// For local development
if (process.env.NODE_ENV !== 'production') {
    try {
        await fastify.listen({ port: 8000, host: '0.0.0.0' });
        console.log(`Server is running on port 8000`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// For Vercel serverless deployment
export default async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
}
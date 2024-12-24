import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sendEmail } from './src/sendMail.js';
import { getAllDoujindesu } from './src/doujindesu.js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fastifyStatic from '@fastify/static';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({
    logger: true
});

// Register CORS
await fastify.register(cors, {
    origin: true
});

// Register static file serving
await fastify.register(fastifyStatic, {
    root: resolve(__dirname, 'views'),
    prefix: '/'
});

// Send Email API
fastify.post('/send-email', async (request, reply) => {
    try {
        const { to, subject, text, html } = request.body;
        await sendEmail(to, subject, text, html);
        return reply.code(200).send({
            success: true,
            message: 'Email sent successfully'
        });
    } catch (error) {
        return reply.code(500).send({
            success: false,
            message: 'Failed to send email',
            error: error.message
        });
    }
});

// Documentation Send Email
fastify.get('/send-email', async (request, reply) => {
    return reply.sendFile('email.html');
});

// Doujindesu API Documentation
fastify.get('/doujindesu', async (request, reply) => {
    return reply.sendFile('doujindesu.html');
});

// Get New Upload Doujinshi From Doujindesu.tv
fastify.get('/doujindesu/searchtype', async (request, reply) => {
    try {
        const page = parseInt(request.query.page) || 1;
        const type = request.query.type || 'Doujinshi';
        const data = await getAllDoujindesu(page, type);
        return reply.code(200).send(data);
    } catch (error) {
        console.error('Error getting doujindesu data:', error);
        return reply.code(500).send({ 
            error: 'Failed to get doujindesu data',
            details: error.message 
        });
    }
});

// Root documentation
fastify.get('/', async (request, reply) => {
    return reply.sendFile('index.html');
});

// Start local server if not in Vercel
if (!process.env.VERCEL) {
    try {
        await fastify.listen({ 
            port: process.env.PORT || 8000,
            host: '0.0.0.0'
        });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

// Export handler for Vercel
export default async function handler(req, res) {
    await fastify.ready();
    fastify.server.emit('request', req, res);
}
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { sendEmail } from './src/sendMail.js';
import { getTypeDoujindesu, searchDoujin } from './src/doujindesu.js';
import { scrapeWebsite } from './src/scraping.js';
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

// Search By Type From Doujindesu.tv
fastify.get('/doujindesu/searchtype', async (request, reply) => {
    try {
        const page = parseInt(request.query.page) || 1;
        const type = request.query.type || 'Doujinshi';
        const data = await getTypeDoujindesu(page, type);
        return reply.code(200).send(data);
    } catch (error) {
        console.error('Error getting doujindesu data:', error);
        return reply.code(500).send({ 
            error: 'Failed to get doujindesu data',
            details: error.message 
        });
    }
});

// Search Doujin From Doujindesu.tv
fastify.get('/doujindesu/search', async (request, reply) => {
    try {
        let page = 1;
        if (request.query.page && !isNaN(parseInt(request.query.page))) {
            page = parseInt(request.query.page);
        }

        const genreString = request.query.genre || '';
        // Convert genre string to array and clean it
        const genres = genreString
            .replace(/[\[\]]/g, '') // Remove square brackets
            .split(',')
            .map(g => g.trim())
            .filter(g => g !== ''); // Remove empty strings

        console.log('Page:', page); // Debug log
        console.log('Received genres:', genres); // Debug log

        const query = {
            title: request.query.title || '',
            author: request.query.author || '',
            character: request.query.character || '',
            status: request.query.status || '',
            type: request.query.type || '',
            genre: genres
        };

        console.log('Search query:', query); // Debug log
        const data = await searchDoujin(page, query);
        return reply.code(200).send(data);
    } catch (error) {
        console.error('Error searching doujindesu:', error);
        return reply.code(500).send({
            error: 'Failed to search doujindesu',
            details: error.message
        });
    }
});

// Scraping Api
fastify.post('/scraping', async (request, reply) => {
    try {
        const { url } = request.body;
        
        if (!url) {
            return reply.code(400).send({
                error: 'URL is required'
            });
        }

        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            return reply.code(400).send({
                error: 'Invalid URL format'
            });
        }

        const result = await scrapeWebsite(url);
        
        if (!result.success) {
            return reply.code(500).send({
                error: result.error
            });
        }

        return reply.code(200).send(result.data);
    } catch (error) {
        console.error('Error in scraping endpoint:', error);
        return reply.code(500).send({
            error: 'Failed to process scraping request',
            details: error.message
        });
    }
});

// Dokumentasi Scraping Api
fastify.get('/scraping', async (request, reply) => {
    return reply.sendFile('scraping.html');
});

// Show Image From Url
fastify.get('/image', async (request, reply) => {
    try {
        const { url } = request.query;
        
        if (!url) {
            return reply.code(400).send({
                error: 'URL gambar diperlukan'
            });
        }

        // Decode URL jika mengandung karakter khusus
        const decodedUrl = decodeURIComponent(url.replace(/^@/, ''));

        try {
            // Validasi URL
            new URL(decodedUrl);
            
            // Fetch gambar
            const response = await fetch(decodedUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });
            
            if (!response.ok) {
                throw new Error('Gagal mengambil gambar');
            }

            // Dapatkan content-type dari response
            const contentType = response.headers.get('content-type');
            
            // Validasi content-type untuk memastikan ini adalah gambar
            if (!contentType || !contentType.startsWith('image/')) {
                return reply.code(400).send({
                    error: 'URL yang diberikan bukan file gambar'
                });
            }

            // Set headers untuk caching dan content-type
            reply
                .header('Content-Type', contentType)
                .header('Cache-Control', 'public, max-age=86400') // Cache selama 24 jam
                .header('Access-Control-Allow-Origin', '*');

            // Stream gambar langsung ke response
            return reply.send(response.body);

        } catch (error) {
            console.error('Error fetching image:', error);
            return reply.code(400).send({
                error: 'Gagal mengambil gambar atau URL tidak valid',
                details: error.message
            });
        }
    } catch (error) {
        console.error('Server error:', error);
        return reply.code(500).send({
            error: 'Gagal memproses permintaan gambar',
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
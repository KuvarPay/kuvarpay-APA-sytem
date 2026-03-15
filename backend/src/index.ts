import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import payrollRoutes from './api/routes';
import './workers/scheduler'; // Import to initialize worker
import { startFundingMonitor } from './workers/funding-monitor';


dotenv.config();

console.log('Initializing Fastify...');
const fastify = Fastify({
    logger: true,
    bodyLimit: 10 * 1024 * 1024, // 10MB limit for file uploads
});

console.log('Registering plugins...');
// Register Plugins
fastify.register(cors, { origin: '*' });
fastify.register(multipart);

console.log('Registering routes...');
// Register Routes
fastify.register(payrollRoutes, { prefix: '/api/v1/payroll' });

fastify.get('/ping', async () => {
    return { status: 'ok', service: 'apa-backend' };
});

const start = async () => {
    try {
        const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
        await fastify.listen({ port, host: '0.0.0.0' });
        console.log(`APA Backend listening on port ${port}`);
        
        // Start background monitors
        startFundingMonitor();
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};

start();


import { EventEmitter } from 'events';
import { createClient } from 'redis';

export const thoughtEmitter = new EventEmitter();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
let redisPublisher: any = null;
let redisSubscriber: any = null;

export interface AgentThought {
  scheduleId: string;
  batchId?: string;
  type: 'INFO' | 'TOOL' | 'SUCCESS' | 'ERROR';
  message: string;
}

/**
 * Initialize Redis Pub/Sub if running in a distributed environment.
 * This allows thoughts emitted in the WORKER to be received by the BACKEND.
 */
async function initRedis(retries = 5) {
    if (redisPublisher) return;

    for (let i = 0; i < retries; i++) {
        try {
            redisPublisher = createClient({ url: REDIS_URL });
            redisSubscriber = createClient({ url: REDIS_URL });

            redisPublisher.on('error', (err: any) => console.error('[Thought-Emitter] Redis Pub Error:', err));
            redisSubscriber.on('error', (err: any) => console.error('[Thought-Emitter] Redis Sub Error:', err));

            await redisPublisher.connect();
            await redisSubscriber.connect();

            console.log(`[Thought-Emitter] 📡 Connected to Redis Pub/Sub for distributed thoughts`);

            // Backend side: Listen for thoughts from other nodes
            await redisSubscriber.subscribe('apa-thoughts', (message: string) => {
                try {
                    const thought = JSON.parse(message);
                    console.log(`[Thought-Emitter] 📥 Received distributed thought for ${thought.scheduleId}: ${thought.message}`);
                    thoughtEmitter.emit('thought', thought);
                } catch (e) {
                    console.error('[Thought-Emitter] Error parsing Redis thought:', e);
                }
            });
            return; // Success!
        } catch (err: any) {
            console.warn(`[Thought-Emitter] Redis connection attempt ${i + 1} failed:`, err.message);
            if (i === retries - 1) {
                console.warn('[Thought-Emitter] Falling back to local events only.');
                redisPublisher = null;
                redisSubscriber = null;
            } else {
                await new Promise(r => setTimeout(r, 2000 * (i + 1))); // Incremental backoff
            }
        }
    }
}

// Kick off initialization
initRedis();

export function emitThought(thought: AgentThought) {
    console.log(`[Thought-Emitter] ${thought.scheduleId}: ${thought.message}`);
    
    // Emit locally for immediate consumption (if in same process)
    thoughtEmitter.emit('thought', thought);

    // Broadcast via Redis for other processes (Dashboard API)
    if (redisPublisher?.isOpen) {
        redisPublisher.publish('apa-thoughts', JSON.stringify(thought));
    }
}

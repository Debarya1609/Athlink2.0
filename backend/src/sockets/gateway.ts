import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { UserRole } from '../types';
import { setSession, removeSession } from '../services/sessionCache';
import { Queue } from 'bullmq';
import os from 'os';

interface JwtPayload {
  id: string;
  role: UserRole;
}

const redisConfig = { url: process.env.REDIS_URL || 'redis://localhost:6379' };
export const messageQueue = new Queue('messages', { connection: redisConfig });

let io: Server | null = null;
const SERVER_IP = os.networkInterfaces()['eth0']?.[0]?.address || '127.0.0.1'; // Mock IP for node identification

// Rate limiting in-memory store
const rateLimitCache = new Map<string, { tokens: number, lastRefill: number }>();
const MAX_TOKENS = 5; // 5 messages per second
const REFILL_RATE = 1000; // 1 second

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] }
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
    if (!token) return next(new Error('Authentication error: No token provided'));

    try {
      const secret = process.env.JWT_SECRET || 'secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user as JwtPayload;
    
    // Bind to Global Redis
    await setSession(user.id, SERVER_IP, socket.id);
    socket.join(user.id);
    console.log(`User connected: ${user.id} to node ${SERVER_IP}`);

    socket.on('send_message', async (payload) => {
      // 64KB Payload Limit Check
      const payloadSize = Buffer.byteLength(JSON.stringify(payload));
      if (payloadSize > 64 * 1024) {
        socket.emit('error', { code: 413, message: 'Payload too large (Max 64KB)' });
        return;
      }

      // Token Bucket Rate Limiting (5 msgs/sec)
      const now = Date.now();
      const userLimiter = rateLimitCache.get(user.id) || { tokens: MAX_TOKENS, lastRefill: now };
      
      if (now - userLimiter.lastRefill > REFILL_RATE) {
        userLimiter.tokens = MAX_TOKENS;
        userLimiter.lastRefill = now;
      }

      if (userLimiter.tokens <= 0) {
        socket.emit('error', { code: 429, message: 'Too Many Requests' });
        return;
      }

      userLimiter.tokens -= 1;
      rateLimitCache.set(user.id, userLimiter);

      // Decoupled Persistence: Push to Queue instead of blocking
      await messageQueue.add('new_message', {
        ...payload,
        sender_id: user.id,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('disconnect', async () => {
      await removeSession(user.id);
      rateLimitCache.delete(user.id);
      console.log(`User disconnected: ${user.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) throw new Error('Socket.io not initialized!');
  return io;
};

export const emitToUser = async (userId: string, event: string, payload: any) => {
  if (!io) return;
  // If we had the socket ID from Redis, we could emit directly.
  // For now, emit to a room named after the user ID.
  io.to(userId).emit(event, payload);
};

export const broadcast = (event: string, payload: any) => {
  if (!io) return;
  io.emit(event, payload);
};

import { createClient } from 'redis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({ url: redisUrl });

redisClient.on('error', (err) => console.log('Redis Client Error', err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Connected to Redis');
  }
};

export const setSession = async (userId: string, serverIp: string, socketId: string) => {
  await redisClient.hSet(`session:${userId}`, {
    serverIp,
    socketId,
    lastSeen: Date.now().toString()
  });
};

export const removeSession = async (userId: string) => {
  await redisClient.del(`session:${userId}`);
};

export const getSession = async (userId: string) => {
  const session = await redisClient.hGetAll(`session:${userId}`);
  if (Object.keys(session).length === 0) return null;
  return session;
};

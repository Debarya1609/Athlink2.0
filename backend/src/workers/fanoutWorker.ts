import { Worker } from 'bullmq';
import { getSession } from '../services/sessionCache';
import { sendPushNotification } from '../services/pushGateway';
import pool from '../models/db';
import { getIo } from '../sockets/gateway';

const redisConfig = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

export const fanoutWorker = new Worker('messages', async job => {
  const { sender_id, chat_id, content, type } = job.data;
  
  if (type === 'read_receipt') return; // Handled by persistence worker

  try {
    // 1. Fetch active member IDs belonging to the chat_id
    // Mock logic: In a real app, this queries a chat_members table
    const result = await pool.query('SELECT user_id FROM follows WHERE following_id = $1 LIMIT 50', [sender_id]);
    const members = result.rows.map(r => r.user_id);

    // 2. Cross-reference against Redis Session Cache
    const activeSockets = [];
    const offlineUsers = [];

    for (const memberId of members) {
      if (memberId === sender_id) continue;

      const session = await getSession(memberId);
      if (session && session.socketId) {
        activeSockets.push({ memberId, socketId: session.socketId });
      } else {
        offlineUsers.push(memberId);
      }
    }

    // 3. For Online Members: Push directly to active sockets
    const io = getIo();
    for (const { socketId } of activeSockets) {
      io.to(socketId).emit('new_message', job.data);
    }

    // 4. For Offline Members: Batch FCM Push
    if (offlineUsers.length > 0) {
      // Look up FCM tokens (mocking DB column fetch here)
      for (const offlineId of offlineUsers) {
        // Mock token
        const dummyToken = `fcm_token_${offlineId}`;
        await sendPushNotification(dummyToken, job.data, 'Group');
      }
    }

  } catch (error) {
    console.error('Fanout failed', error);
  }
}, { connection: redisConfig });

fanoutWorker.on('completed', job => console.log(`Fanout Job ${job.id} done`));
fanoutWorker.on('failed', (job, err) => console.log(`Fanout Job failed`, err));

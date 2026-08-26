import { Worker } from 'bullmq';
import pool from '../models/db';

const redisConfig = { url: process.env.REDIS_URL || 'redis://localhost:6379' };

// Debounced Write-Back Buffer for Receipts
let receiptBuffer: any[] = [];
const DEBOUNCE_INTERVAL = 2000;

const flushReceipts = async () => {
  if (receiptBuffer.length === 0) return;
  const currentBatch = [...receiptBuffer];
  receiptBuffer = [];

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const receipt of currentBatch) {
      await client.query('UPDATE messages SET read = true WHERE id = $1', [receipt.message_id]);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Batch receipt update failed', error);
  } finally {
    client.release();
  }
};

setInterval(flushReceipts, DEBOUNCE_INTERVAL);

export const persistenceWorker = new Worker('messages', async job => {
  const { sender_id, chat_id, content, type, message_id } = job.data;
  
  if (type === 'read_receipt') {
    receiptBuffer.push({ message_id });
    return;
  }

  // Insert message into DB
  try {
    await pool.query(
      'INSERT INTO messages (chat_id, sender_id, content) VALUES ($1, $2, $3)',
      [chat_id, sender_id, content]
    );
  } catch (error) {
    console.error('Failed to persist message', error);
  }
}, { connection: redisConfig });

persistenceWorker.on('completed', job => console.log(`Persistence Job ${job.id} done`));
persistenceWorker.on('failed', (job, err) => console.log(`Persistence Job failed`, err));

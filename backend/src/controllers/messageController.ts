import { Request, Response } from 'express'
import pool from '../models/db'
import { UserRole } from '../types'
import { emitToUser } from '../sockets/socketManager'

interface SendMessageBody {
  content: string
}

interface MessageRow {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: Date
}

interface MessageWithSenderRow extends MessageRow {
  sender_name: string
  sender_role: UserRole
  sender_photo_url: string | null
}

interface ConversationRow {
  user_id: string
  name: string
  role: UserRole
  photo_url: string | null
  last_message: string
  last_message_at: Date
  unread_count: string
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isValidUuid = (value: string): boolean => {
  return uuidRegex.test(value)
}

const getParamString = (value: string | string[] | undefined): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  return value
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  return 'Internal server error'
}

const mapConversation = (row: ConversationRow) => {
  return {
    user: {
      id: row.user_id,
      name: row.name,
      role: row.role,
      photo_url: row.photo_url
    },
    last_message: row.last_message,
    last_message_at: row.last_message_at,
    unread_count: Number(row.unread_count)
  }
}

const mapMessage = (row: MessageWithSenderRow) => {
  return {
    id: row.id,
    sender_id: row.sender_id,
    receiver_id: row.receiver_id,
    content: row.content,
    read: row.read,
    created_at: row.created_at,
    sender: {
      id: row.sender_id,
      name: row.sender_name,
      role: row.sender_role,
      photo_url: row.sender_photo_url
    }
  }
}

export const getConversations = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const result = await pool.query<ConversationRow>(
      `SELECT
         partner.id AS user_id,
         partner.name,
         partner.role,
         p.photo_url,
         latest_msg.content AS last_message,
         latest_msg.created_at AS last_message_at,
         COALESCE(unread.cnt, 0) AS unread_count
       FROM (
         SELECT DISTINCT
           CASE
             WHEN sender_id = $1 THEN receiver_id
             ELSE sender_id
           END AS partner_id
         FROM messages
         WHERE sender_id = $1 OR receiver_id = $1
       ) AS conversations
       INNER JOIN users partner ON partner.id = conversations.partner_id
       LEFT JOIN profiles p ON p.user_id = partner.id
       INNER JOIN LATERAL (
         SELECT content, created_at
         FROM messages
         WHERE (sender_id = $1 AND receiver_id = conversations.partner_id)
            OR (sender_id = conversations.partner_id AND receiver_id = $1)
         ORDER BY created_at DESC
         LIMIT 1
       ) latest_msg ON TRUE
       LEFT JOIN LATERAL (
         SELECT COUNT(*) AS cnt
         FROM messages
         WHERE sender_id = conversations.partner_id
           AND receiver_id = $1
           AND read = FALSE
       ) unread ON TRUE
       ORDER BY latest_msg.created_at DESC`,
      [req.user.id]
    )

    res.status(200).json({ data: result.rows.map(mapConversation) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const userId = getParamString(req.params.userId)

    if (!userId || !isValidUuid(userId)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    if (userId === req.user.id) {
      res.status(400).json({ error: 'You cannot message yourself' })
      return
    }

    const userResult = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    // Mark messages from this user as read
    await pool.query(
      `UPDATE messages
       SET read = TRUE
       WHERE sender_id = $1
         AND receiver_id = $2
         AND read = FALSE`,
      [userId, req.user.id]
    )

    // Support cursor pagination (high-watermark)
    const afterTimestamp = req.query.after_timestamp as string;
    const beforeTimestamp = req.query.before_timestamp as string;

    let timeFilter = '';
    const queryParams: any[] = [req.user.id, userId];
    let paramIndex = 3;

    if (afterTimestamp) {
      timeFilter = `AND m.created_at > $${paramIndex}`;
      queryParams.push(afterTimestamp);
      paramIndex++;
    } else if (beforeTimestamp) {
      timeFilter = `AND m.created_at < $${paramIndex}`;
      queryParams.push(beforeTimestamp);
      paramIndex++;
    }

    const result = await pool.query<MessageWithSenderRow>(
      `SELECT
         m.id,
         m.sender_id,
         m.receiver_id,
         m.content,
         m.read,
         m.created_at,
         u.name AS sender_name,
         u.role AS sender_role,
         p.photo_url AS sender_photo_url
       FROM messages m
       INNER JOIN users u ON u.id = m.sender_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE ((m.sender_id = $1 AND m.receiver_id = $2)
          OR (m.sender_id = $2 AND m.receiver_id = $1))
          ${timeFilter}
       ORDER BY m.created_at DESC
       LIMIT 50`,
      queryParams
    )

    // Reverse to send oldest first for UI
    const reversedRows = result.rows.reverse();
    res.status(200).json({ data: reversedRows.map(mapMessage) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const sendMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const userId = getParamString(req.params.userId)

    if (!userId || !isValidUuid(userId)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    if (userId === req.user.id) {
      res.status(400).json({ error: 'You cannot message yourself' })
      return
    }

    if (!isRecord(req.body)) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const contentValue = req.body.content

    if (typeof contentValue !== 'string') {
      res.status(400).json({ error: 'Message content is required' })
      return
    }

    const content = contentValue.trim()

    if (!content) {
      res.status(400).json({ error: 'Message content is required' })
      return
    }

    if (content.length > 2000) {
      res.status(400).json({ error: 'Message content must be 2000 characters or less' })
      return
    }

    const userResult = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE id = $1',
      [userId]
    )

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const body: SendMessageBody = { content }

    const result = await pool.query<MessageRow>(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, sender_id, receiver_id, content, read, created_at`,
      [req.user.id, userId, body.content]
    )

    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, $2, $3)`,
      [userId, 'message', 'You have a new message']
    )

    emitToUser(userId, 'new_message', result.rows[0])

    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

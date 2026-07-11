import { Request, Response } from 'express'
import pool from '../models/db'
import { NotificationType } from '../types'

interface NotificationRow {
  id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: Date
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

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

export const getNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const result = await pool.query<NotificationRow>(
      `SELECT id, user_id, type, message, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.id]
    )

    res.status(200).json({ data: result.rows })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const notificationId = getParamString(req.params.id)

    if (!notificationId || !isValidUuid(notificationId)) {
      res.status(400).json({ error: 'Valid notification id is required' })
      return
    }

    const result = await pool.query<NotificationRow>(
      `UPDATE notifications
       SET read = TRUE
       WHERE id = $1 AND user_id = $2
       RETURNING id, user_id, type, message, read, created_at`,
      [notificationId, req.user.id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Notification not found' })
      return
    }

    res.status(200).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const markAllAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    await pool.query(
      `UPDATE notifications
       SET read = TRUE
       WHERE user_id = $1 AND read = FALSE`,
      [req.user.id]
    )

    res.status(200).json({ data: { message: 'All notifications marked as read' } })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

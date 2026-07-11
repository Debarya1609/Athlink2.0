import { Router } from 'express'
import {
  getNotifications,
  markAsRead,
  markAllAsRead
} from '../controllers/notificationController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getNotifications)
router.put('/read-all', authMiddleware, markAllAsRead)
router.put('/:id/read', authMiddleware, markAsRead)

export default router

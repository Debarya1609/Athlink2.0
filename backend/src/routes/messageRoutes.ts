import { Router } from 'express'
import {
  getConversations,
  getMessages,
  sendMessage
} from '../controllers/messageController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/conversations', authMiddleware, getConversations)
router.get('/:userId', authMiddleware, getMessages)
router.post('/:userId', authMiddleware, sendMessage)

export default router

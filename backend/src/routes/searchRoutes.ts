import { Router } from 'express'
import { searchUsers } from '../controllers/searchController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/users', authMiddleware, searchUsers)

export default router

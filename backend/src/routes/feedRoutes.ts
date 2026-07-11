import { Router } from 'express'
import {
  commentOnPost,
  createPost,
  deletePost,
  getFeed,
  getPostComments,
  likePost,
  unlikePost
} from '../controllers/feedController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getFeed)
router.post('/', authMiddleware, createPost)
router.delete('/:id', authMiddleware, deletePost)
router.post('/:id/like', authMiddleware, likePost)
router.delete('/:id/like', authMiddleware, unlikePost)
router.post('/:id/comment', authMiddleware, commentOnPost)
router.get('/:id/comments', authMiddleware, getPostComments)

export default router

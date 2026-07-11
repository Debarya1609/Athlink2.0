import { NextFunction, Request, Response, Router } from 'express'
import multer, { MulterError } from 'multer'
import {
  followUser,
  getProfile,
  unfollowUser,
  updateMyProfile,
  uploadProfilePhoto
} from '../controllers/profileController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
  }
})

const handleProfilePhotoUpload = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  upload.single('photo')(req, res, (err: unknown): void => {
    if (err instanceof MulterError) {
      res.status(400).json({ error: err.message })
      return
    }

    if (err instanceof Error) {
      res.status(500).json({ error: err.message })
      return
    }

    next()
  })
}

router.get('/:id', getProfile)
router.put('/me', authMiddleware, updateMyProfile)
router.post('/me/photo', authMiddleware, handleProfilePhotoUpload, uploadProfilePhoto)
router.post('/:id/follow', authMiddleware, followUser)
router.delete('/:id/follow', authMiddleware, unfollowUser)

export default router

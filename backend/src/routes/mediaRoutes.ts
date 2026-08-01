import { Router } from 'express'
import multer from 'multer'
import { uploadMedia } from '../controllers/mediaController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

// Configure multer for memory storage
// Files will be stored in memory as Buffers, which we then send to Cloudinary
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

router.post('/upload', authMiddleware, upload.single('file'), uploadMedia)

export default router

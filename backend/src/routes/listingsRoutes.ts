import { Router } from 'express'
import {
  applyToListing,
  createListing,
  getListing,
  getListings
} from '../controllers/listingsController'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()

router.get('/', authMiddleware, getListings)
router.post('/', authMiddleware, createListing)
router.get('/:id', authMiddleware, getListing)
router.post('/:id/apply', authMiddleware, applyToListing)

export default router

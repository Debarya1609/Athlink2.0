import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import feedRoutes from './routes/feedRoutes'
import searchRoutes from './routes/searchRoutes'
import listingsRoutes from './routes/listingsRoutes'
import messageRoutes from './routes/messageRoutes'
import notificationRoutes from './routes/notificationRoutes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/feed', feedRoutes)
app.use('/api/search', searchRoutes)
app.use('/api/listings', listingsRoutes)
app.use('/api/messages', messageRoutes)
app.use('/api/notifications', notificationRoutes)

const PORT = process.env.PORT ?? 5000

app.listen(PORT, () => {
  console.log(`Athlink backend running on port ${PORT}`)
})

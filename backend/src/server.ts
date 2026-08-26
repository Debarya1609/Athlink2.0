import express from 'express'
import http from 'http'
import { initSocket } from './sockets/gateway'
import { connectRedis } from './services/sessionCache'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import feedRoutes from './routes/feedRoutes'
import searchRoutes from './routes/searchRoutes'
import listingsRoutes from './routes/listingsRoutes'
import messageRoutes from './routes/messageRoutes'
import notificationRoutes from './routes/notificationRoutes'
import mediaRoutes from './routes/mediaRoutes'

dotenv.config()

connectRedis().catch(console.error);
import './workers/persistenceWorker';
import './workers/fanoutWorker';

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
app.use('/api/media', mediaRoutes)

const server = http.createServer(app)
initSocket(server)

const PORT = process.env.PORT ?? 5000

server.listen(PORT, () => {
  console.log(`Athlink backend running on port ${PORT}`)
})

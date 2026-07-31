import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { UserRole } from '../types'

interface JwtPayload {
  id: string
  role: UserRole
}

let io: Server | null = null

// Map user IDs to their active socket IDs
const userSockets = new Map<string, string>()

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, restrict to frontend URL
      methods: ['GET', 'POST']
    }
  })

  // Middleware for JWT authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1]

    if (!token) {
      return next(new Error('Authentication error: No token provided'))
    }

    try {
      const secret = process.env.JWT_SECRET || 'secret'
      const decoded = jwt.verify(token, secret) as JwtPayload
      socket.data.user = decoded
      next()
    } catch (err) {
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user as JwtPayload
    
    // Store mapping of user_id -> socket_id
    userSockets.set(user.id, socket.id)
    
    console.log(`User connected: ${user.id} (Socket: ${socket.id})`)

    socket.on('disconnect', () => {
      userSockets.delete(user.id)
      console.log(`User disconnected: ${user.id}`)
    })
  })

  return io
}

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!')
  }
  return io
}

// Utility functions to emit events from REST controllers
export const emitToUser = (userId: string, event: string, payload: any) => {
  if (!io) return
  const socketId = userSockets.get(userId)
  if (socketId) {
    io.to(socketId).emit(event, payload)
  }
}

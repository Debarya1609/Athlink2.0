import { Request, Response } from 'express'
import { PoolClient } from 'pg'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../models/db'
import { UserRole } from '../types'

interface RegisterBody {
  name: string
  email: string
  password: string
  role: UserRole
}

interface LoginBody {
  email: string
  password: string
}

interface AuthUserRow {
  id: string
  name: string
  email: string
  role: UserRole
}

interface LoginUserRow extends AuthUserRow {
  password_hash: string | null
}

interface PgError extends Error {
  code?: string
}

const validRoles: UserRole[] = ['athlete', 'coach', 'academy']

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getString = (
  body: Record<string, unknown>,
  key: string
): string | null => {
  const value = body[key]

  if (typeof value !== 'string') {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

const isUserRole = (value: string): value is UserRole => {
  return validRoles.includes(value as UserRole)
}

const isEmailValid = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  return 'Internal server error'
}

const isUniqueViolation = (err: unknown): err is PgError => {
  return err instanceof Error && (err as PgError).code === '23505'
}

export const register = async (req: Request, res: Response): Promise<void> => {
  let client: PoolClient | null = null

  try {
    if (!isRecord(req.body)) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const name = getString(req.body, 'name')
    const email = getString(req.body, 'email')?.toLowerCase() ?? null
    const password = getString(req.body, 'password')
    const roleValue = getString(req.body, 'role')

    if (!name || !email || !password || !roleValue) {
      res.status(400).json({ error: 'All fields are required' })
      return
    }

    if (!isEmailValid(email)) {
      res.status(400).json({ error: 'Valid email is required' })
      return
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' })
      return
    }

    if (!isUserRole(roleValue)) {
      res.status(400).json({ error: 'Invalid role' })
      return
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret is not configured' })
      return
    }

    const body: RegisterBody = {
      name,
      email,
      password,
      role: roleValue
    }

    const existing = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [body.email]
    )

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already exists' })
      return
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    client = await pool.connect()

    await client.query('BEGIN')

    const result = await client.query<AuthUserRow>(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      [body.name, body.email, passwordHash, body.role]
    )

    const user = result.rows[0]

    await client.query(
      'INSERT INTO profiles (user_id) VALUES ($1)',
      [user.id]
    )

    await client.query('COMMIT')

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.status(201).json({ token, user })
  } catch (err) {
    if (client) {
      await client.query('ROLLBACK')
    }

    if (isUniqueViolation(err)) {
      res.status(409).json({ error: 'Email already exists' })
      return
    }

    res.status(500).json({ error: getErrorMessage(err) })
  } finally {
    if (client) {
      client.release()
    }
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!isRecord(req.body)) {
      res.status(400).json({ error: 'Invalid request body' })
      return
    }

    const email = getString(req.body, 'email')?.toLowerCase() ?? null
    const password = getString(req.body, 'password')

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' })
      return
    }

    if (!isEmailValid(email)) {
      res.status(400).json({ error: 'Valid email is required' })
      return
    }

    const jwtSecret = process.env.JWT_SECRET

    if (!jwtSecret) {
      res.status(500).json({ error: 'JWT secret is not configured' })
      return
    }

    const body: LoginBody = {
      email,
      password
    }

    const result = await pool.query<LoginUserRow>(
      'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
      [body.email]
    )

    if (result.rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const user = result.rows[0]

    if (!user.password_hash) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const valid = await bcrypt.compare(body.password, user.password_hash)

    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      jwtSecret,
      { expiresIn: '7d' }
    )

    res.status(200).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

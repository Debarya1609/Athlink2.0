import { Request, Response } from 'express'
import pool from '../models/db'
import { UserRole } from '../types'

interface SearchUsersQuery {
  sport?: string
  city?: string
  role?: UserRole
  available_for_trials?: boolean
}

interface SearchUserRow {
  user_id: string
  name: string
  email: string
  role: UserRole
  created_at: Date
  profile_id: string
  photo_url: string | null
  bio: string | null
  city: string | null
  state: string | null
  sport: string | null
  position: string | null
  age: number | null
  available_for_trials: boolean
  height: string | null
  weight: string | null
  experience_years: number | null
  certifications: string | null
  open_to_opportunities: boolean
  academy_type: string | null
  established_year: number | null
  website_url: string | null
  member_count: number | null
  updated_at: Date
  followers_count: string
}

const validRoles: UserRole[] = ['athlete', 'coach', 'academy']

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  return 'Internal server error'
}

const getQueryString = (
  value: unknown
): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const getQueryBoolean = (
  value: unknown
): boolean | undefined | null => {
  if (value === undefined) {
    return undefined
  }

  if (typeof value !== 'string') {
    return null
  }

  const normalized = value.trim().toLowerCase()

  if (normalized === 'true') {
    return true
  }

  if (normalized === 'false') {
    return false
  }

  return null
}

const validateSearchUsersQuery = (
  req: Request
): { data: SearchUsersQuery | null; error: string | null } => {
  const sport = getQueryString(req.query.sport)
  const city = getQueryString(req.query.city)
  const roleValue = getQueryString(req.query.role)
  const availableForTrials = getQueryBoolean(req.query.available_for_trials)

  if (sport && sport.length > 100) {
    return { data: null, error: 'sport must be 100 characters or less' }
  }

  if (city && city.length > 100) {
    return { data: null, error: 'city must be 100 characters or less' }
  }

  if (roleValue && !validRoles.includes(roleValue as UserRole)) {
    return { data: null, error: 'role must be athlete, coach, or academy' }
  }

  if (availableForTrials === null) {
    return { data: null, error: 'available_for_trials must be true or false' }
  }

  return {
    data: {
      sport,
      city,
      role: roleValue as UserRole | undefined,
      available_for_trials: availableForTrials
    },
    error: null
  }
}

const mapSearchUser = (row: SearchUserRow) => {
  return {
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: row.created_at
    },
    profile: {
      id: row.profile_id,
      user_id: row.user_id,
      photo_url: row.photo_url,
      bio: row.bio,
      city: row.city,
      state: row.state,
      sport: row.sport,
      position: row.position,
      age: row.age,
      available_for_trials: row.available_for_trials,
      height: row.height,
      weight: row.weight,
      experience_years: row.experience_years,
      certifications: row.certifications,
      open_to_opportunities: row.open_to_opportunities,
      academy_type: row.academy_type,
      established_year: row.established_year,
      website_url: row.website_url,
      member_count: row.member_count,
      updated_at: row.updated_at
    },
    stats: {
      followers_count: Number(row.followers_count)
    }
  }
}

export const searchUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const validation = validateSearchUsersQuery(req)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid query params' })
      return
    }

    const query = validation.data

    const result = await pool.query<SearchUserRow>(
      `SELECT
         u.id AS user_id,
         u.name,
         u.email,
         u.role,
         u.created_at,
         p.id AS profile_id,
         p.photo_url,
         p.bio,
         p.city,
         p.state,
         p.sport,
         p.position,
         p.age,
         p.available_for_trials,
         p.height,
         p.weight,
         p.experience_years,
         p.certifications,
         p.open_to_opportunities,
         p.academy_type,
         p.established_year,
         p.website_url,
         p.member_count,
         p.updated_at,
         COUNT(f.follower_id) AS followers_count
       FROM users u
       INNER JOIN profiles p ON p.user_id = u.id
       LEFT JOIN follows f ON f.following_id = u.id
       WHERE ($1::TEXT IS NULL OR p.sport ILIKE $1)
         AND ($2::TEXT IS NULL OR p.city ILIKE $2)
         AND ($3::TEXT IS NULL OR u.role = $3)
         AND ($4::BOOLEAN IS NULL OR p.available_for_trials = $4)
       GROUP BY u.id, p.id
       ORDER BY
         CASE WHEN p.available_for_trials = TRUE THEN 0 ELSE 1 END,
         COUNT(f.follower_id) DESC,
         p.updated_at DESC
       LIMIT 50`,
      [
        query.sport ? `%${query.sport}%` : null,
        query.city ? `%${query.city}%` : null,
        query.role ?? null,
        query.available_for_trials ?? null
      ]
    )

    res.status(200).json({ data: result.rows.map(mapSearchUser) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

import { Request, Response } from 'express'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'
import pool from '../models/db'
import { UserRole } from '../types'

interface UpdateProfileBody {
  photo_url?: string | null
  bio?: string | null
  city?: string | null
  state?: string | null
  sport?: string | null
  position?: string | null
  age?: number | null
  available_for_trials?: boolean
  height?: string | null
  weight?: string | null
  experience_years?: number | null
  certifications?: string | null
  open_to_opportunities?: boolean
  academy_type?: string | null
  established_year?: number | null
  website_url?: string | null
  member_count?: number | null
}

interface PublicProfileRow {
  user_id: string
  name: string
  email: string
  role: UserRole
  user_created_at: Date
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
  following_count: string
}

interface ProfileRow {
  id: string
  user_id: string
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
}

interface UserNameRow {
  id: string
  name: string
}

interface FollowRow {
  follower_id: string
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const isValidUuid = (value: string): boolean => {
  return uuidRegex.test(value)
}

const getParamString = (value: string | string[] | undefined): string | null => {
  if (typeof value !== 'string') {
    return null
  }

  return value
}

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  return 'Internal server error'
}

const validateNullableString = (
  body: Record<string, unknown>,
  key: keyof UpdateProfileBody,
  maxLength: number,
  errors: string[]
): string | null | undefined => {
  if (!(key in body)) {
    return undefined
  }

  const value = body[key]

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    errors.push(`${String(key)} must be a string or null`)
    return undefined
  }

  const trimmed = value.trim()

  if (trimmed.length > maxLength) {
    errors.push(`${String(key)} must be ${maxLength} characters or less`)
    return undefined
  }

  return trimmed.length > 0 ? trimmed : null
}

const validateNullableInteger = (
  body: Record<string, unknown>,
  key: keyof UpdateProfileBody,
  min: number,
  max: number,
  errors: string[]
): number | null | undefined => {
  if (!(key in body)) {
    return undefined
  }

  const value = body[key]

  if (value === null) {
    return null
  }

  if (typeof value !== 'number' || !Number.isInteger(value)) {
    errors.push(`${String(key)} must be an integer or null`)
    return undefined
  }

  if (value < min || value > max) {
    errors.push(`${String(key)} must be between ${min} and ${max}`)
    return undefined
  }

  return value
}

const validateBoolean = (
  body: Record<string, unknown>,
  key: keyof UpdateProfileBody,
  errors: string[]
): boolean | undefined => {
  if (!(key in body)) {
    return undefined
  }

  const value = body[key]

  if (typeof value !== 'boolean') {
    errors.push(`${String(key)} must be a boolean`)
    return undefined
  }

  return value
}

const validateUpdateProfileBody = (
  body: unknown
): { data: UpdateProfileBody | null; error: string | null } => {
  if (!isRecord(body)) {
    return { data: null, error: 'Invalid request body' }
  }

  const errors: string[] = []
  const currentYear = new Date().getFullYear()

  const data: UpdateProfileBody = {
    photo_url: validateNullableString(body, 'photo_url', 500, errors),
    bio: validateNullableString(body, 'bio', 300, errors),
    city: validateNullableString(body, 'city', 100, errors),
    state: validateNullableString(body, 'state', 100, errors),
    sport: validateNullableString(body, 'sport', 100, errors),
    position: validateNullableString(body, 'position', 100, errors),
    age: validateNullableInteger(body, 'age', 5, 80, errors),
    available_for_trials: validateBoolean(body, 'available_for_trials', errors),
    height: validateNullableString(body, 'height', 20, errors),
    weight: validateNullableString(body, 'weight', 20, errors),
    experience_years: validateNullableInteger(
      body,
      'experience_years',
      0,
      70,
      errors
    ),
    certifications: validateNullableString(body, 'certifications', 5000, errors),
    open_to_opportunities: validateBoolean(body, 'open_to_opportunities', errors),
    academy_type: validateNullableString(body, 'academy_type', 50, errors),
    established_year: validateNullableInteger(
      body,
      'established_year',
      1800,
      currentYear,
      errors
    ),
    website_url: validateNullableString(body, 'website_url', 255, errors),
    member_count: validateNullableInteger(body, 'member_count', 0, 1000000, errors)
  }

  if (data.website_url && !/^https?:\/\/\S+\.\S+$/.test(data.website_url)) {
    errors.push('website_url must be a valid http or https URL')
  }

  if (errors.length > 0) {
    return { data: null, error: errors[0] }
  }

  return { data, error: null }
}

const configureCloudinary = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return false
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  })

  return true
}

const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  userId: string
): Promise<UploadApiResponse> => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`

  return cloudinary.uploader.upload(dataUri, {
    folder: 'athlink/profile-photos',
    public_id: userId,
    overwrite: true,
    resource_type: 'image'
  })
}

const mapPublicProfile = (row: PublicProfileRow) => {
  return {
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      role: row.role,
      created_at: row.user_created_at
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
      followers_count: Number(row.followers_count),
      following_count: Number(row.following_count)
    }
  }
}

export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = getParamString(req.params.id)

    if (!id || !isValidUuid(id)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    const result = await pool.query<PublicProfileRow>(
      `SELECT
         u.id AS user_id,
         u.name,
         u.email,
         u.role,
         u.created_at AS user_created_at,
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
         (SELECT COUNT(*) FROM follows WHERE following_id = u.id) AS followers_count,
         (SELECT COUNT(*) FROM follows WHERE follower_id = u.id) AS following_count
       FROM users u
       INNER JOIN profiles p ON p.user_id = u.id
       WHERE u.id = $1`,
      [id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    res.status(200).json({ data: mapPublicProfile(result.rows[0]) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const updateMyProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const validation = validateUpdateProfileBody(req.body)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid request body' })
      return
    }

    const existing = await pool.query<ProfileRow>(
      'SELECT * FROM profiles WHERE user_id = $1',
      [req.user.id]
    )

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    const current = existing.rows[0]
    const data = validation.data

    const result = await pool.query<ProfileRow>(
      `UPDATE profiles
       SET photo_url = $1,
           bio = $2,
           city = $3,
           state = $4,
           sport = $5,
           position = $6,
           age = $7,
           available_for_trials = $8,
           height = $9,
           weight = $10,
           experience_years = $11,
           certifications = $12,
           open_to_opportunities = $13,
           academy_type = $14,
           established_year = $15,
           website_url = $16,
           member_count = $17,
           updated_at = NOW()
       WHERE user_id = $18
       RETURNING *`,
      [
        data.photo_url !== undefined ? data.photo_url : current.photo_url,
        data.bio !== undefined ? data.bio : current.bio,
        data.city !== undefined ? data.city : current.city,
        data.state !== undefined ? data.state : current.state,
        data.sport !== undefined ? data.sport : current.sport,
        data.position !== undefined ? data.position : current.position,
        data.age !== undefined ? data.age : current.age,
        data.available_for_trials !== undefined
          ? data.available_for_trials
          : current.available_for_trials,
        data.height !== undefined ? data.height : current.height,
        data.weight !== undefined ? data.weight : current.weight,
        data.experience_years !== undefined
          ? data.experience_years
          : current.experience_years,
        data.certifications !== undefined
          ? data.certifications
          : current.certifications,
        data.open_to_opportunities !== undefined
          ? data.open_to_opportunities
          : current.open_to_opportunities,
        data.academy_type !== undefined
          ? data.academy_type
          : current.academy_type,
        data.established_year !== undefined
          ? data.established_year
          : current.established_year,
        data.website_url !== undefined ? data.website_url : current.website_url,
        data.member_count !== undefined
          ? data.member_count
          : current.member_count,
        req.user.id
      ]
    )

    res.status(200).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const uploadProfilePhoto = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'Profile photo is required' })
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(req.file.mimetype)) {
      res.status(400).json({ error: 'Only JPEG, PNG, and WEBP images are allowed' })
      return
    }

    if (!configureCloudinary()) {
      res.status(500).json({ error: 'Cloudinary is not configured' })
      return
    }

    const existing = await pool.query<{ id: string }>(
      'SELECT id FROM profiles WHERE user_id = $1',
      [req.user.id]
    )

    if (existing.rows.length === 0) {
      res.status(404).json({ error: 'Profile not found' })
      return
    }

    const uploadResult = await uploadBufferToCloudinary(req.file, req.user.id)

    const result = await pool.query<ProfileRow>(
      `UPDATE profiles
       SET photo_url = $1,
           updated_at = NOW()
       WHERE user_id = $2
       RETURNING *`,
      [uploadResult.secure_url, req.user.id]
    )

    res.status(200).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const followUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const id = getParamString(req.params.id)

    if (!id || !isValidUuid(id)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    if (id === req.user.id) {
      res.status(400).json({ error: 'You cannot follow yourself' })
      return
    }

    const userResult = await pool.query<UserNameRow>(
      'SELECT id, name FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const existingFollow = await pool.query<FollowRow>(
      'SELECT follower_id FROM follows WHERE follower_id = $1 AND following_id = $2',
      [req.user.id, id]
    )

    if (existingFollow.rows.length > 0) {
      res.status(409).json({ error: 'Already following user' })
      return
    }

    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2)',
      [req.user.id, id]
    )

    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, $2, $3)`,
      [id, 'follow', 'You have a new follower']
    )

    res.status(201).json({
      data: {
        follower_id: req.user.id,
        following_id: id
      }
    })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const unfollowUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const id = getParamString(req.params.id)

    if (!id || !isValidUuid(id)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    if (id === req.user.id) {
      res.status(400).json({ error: 'You cannot unfollow yourself' })
      return
    }

    const userResult = await pool.query<{ id: string }>(
      'SELECT id FROM users WHERE id = $1',
      [id]
    )

    if (userResult.rows.length === 0) {
      res.status(404).json({ error: 'User not found' })
      return
    }

    const result = await pool.query<FollowRow>(
      `DELETE FROM follows
       WHERE follower_id = $1 AND following_id = $2
       RETURNING follower_id`,
      [req.user.id, id]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Follow relationship not found' })
      return
    }

    res.status(200).json({
      data: {
        follower_id: req.user.id,
        following_id: id
      }
    })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

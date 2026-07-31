import { Request, Response } from 'express'
import pool from '../models/db'
import { ListingType, UserRole } from '../types'
import { emitToUser } from '../sockets/socketManager'

interface CreateListingBody {
  type: ListingType
  sport: string
  title: string
  description?: string | null
  date?: string | null
  location?: string | null
  city?: string | null
  requirements?: string | null
  age_group?: string | null
  experience_required?: string | null
  prize_pool?: string | null
}

interface ListingsQuery {
  type?: ListingType
  sport?: string
  city?: string
}

interface ListingRow {
  id: string
  posted_by: string
  type: ListingType
  sport: string
  title: string
  description: string | null
  date: Date | null
  location: string | null
  city: string | null
  requirements: string | null
  age_group: string | null
  experience_required: string | null
  prize_pool: string | null
  created_at: Date
}

interface ListingWithAuthorRow extends ListingRow {
  author_name: string
  author_role: UserRole
  author_photo_url: string | null
  applications_count: string
  applied_by_me: boolean
}

interface ApplicationRow {
  id: string
  listing_id: string
  applicant_id: string
  status: string
  created_at: Date
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const validListingTypes: ListingType[] = ['trial', 'job', 'tournament']

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

const getQueryString = (value: unknown): string | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const validateNullableString = (
  body: Record<string, unknown>,
  key: keyof CreateListingBody,
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

const validateRequiredString = (
  body: Record<string, unknown>,
  key: keyof CreateListingBody,
  maxLength: number,
  errors: string[]
): string | null => {
  const value = body[key]

  if (typeof value !== 'string') {
    errors.push(`${String(key)} is required`)
    return null
  }

  const trimmed = value.trim()

  if (!trimmed) {
    errors.push(`${String(key)} is required`)
    return null
  }

  if (trimmed.length > maxLength) {
    errors.push(`${String(key)} must be ${maxLength} characters or less`)
    return null
  }

  return trimmed
}

const validateDate = (
  body: Record<string, unknown>,
  errors: string[]
): string | null | undefined => {
  if (!('date' in body)) {
    return undefined
  }

  const value = body.date

  if (value === null) {
    return null
  }

  if (typeof value !== 'string') {
    errors.push('date must be a YYYY-MM-DD string or null')
    return undefined
  }

  const trimmed = value.trim()

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    errors.push('date must be in YYYY-MM-DD format')
    return undefined
  }

  const parsed = new Date(`${trimmed}T00:00:00.000Z`)

  if (Number.isNaN(parsed.getTime())) {
    errors.push('date must be valid')
    return undefined
  }

  return trimmed
}

const validateCreateListingBody = (
  body: unknown
): { data: CreateListingBody | null; error: string | null } => {
  if (!isRecord(body)) {
    return { data: null, error: 'Invalid request body' }
  }

  const errors: string[] = []
  const typeValue = body.type

  if (typeof typeValue !== 'string' || !validListingTypes.includes(typeValue as ListingType)) {
    errors.push('type must be trial, job, or tournament')
  }

  const sport = validateRequiredString(body, 'sport', 100, errors)
  const title = validateRequiredString(body, 'title', 200, errors)
  const description = validateNullableString(body, 'description', 5000, errors)
  const date = validateDate(body, errors)
  const location = validateNullableString(body, 'location', 200, errors)
  const city = validateNullableString(body, 'city', 100, errors)
  const requirements = validateNullableString(body, 'requirements', 5000, errors)
  const ageGroup = validateNullableString(body, 'age_group', 50, errors)
  const experienceRequired = validateNullableString(
    body,
    'experience_required',
    100,
    errors
  )
  const prizePool = validateNullableString(body, 'prize_pool', 100, errors)

  if (errors.length > 0 || !sport || !title) {
    return { data: null, error: errors[0] ?? 'Invalid request body' }
  }

  return {
    data: {
      type: typeValue as ListingType,
      sport,
      title,
      description: description ?? null,
      date: date ?? null,
      location: location ?? null,
      city: city ?? null,
      requirements: requirements ?? null,
      age_group: ageGroup ?? null,
      experience_required: experienceRequired ?? null,
      prize_pool: prizePool ?? null
    },
    error: null
  }
}

const validateListingsQuery = (
  req: Request
): { data: ListingsQuery | null; error: string | null } => {
  const typeValue = getQueryString(req.query.type)
  const sport = getQueryString(req.query.sport)
  const city = getQueryString(req.query.city)

  if (typeValue && !validListingTypes.includes(typeValue as ListingType)) {
    return { data: null, error: 'type must be trial, job, or tournament' }
  }

  if (sport && sport.length > 100) {
    return { data: null, error: 'sport must be 100 characters or less' }
  }

  if (city && city.length > 100) {
    return { data: null, error: 'city must be 100 characters or less' }
  }

  return {
    data: {
      type: typeValue as ListingType | undefined,
      sport,
      city
    },
    error: null
  }
}

const canApplyToListing = (role: UserRole, type: ListingType): boolean => {
  if (type === 'trial') {
    return role === 'athlete'
  }

  if (type === 'job') {
    return role === 'coach'
  }

  return role === 'athlete' || role === 'coach'
}

const getApplyError = (type: ListingType): string => {
  if (type === 'trial') {
    return 'Only athletes can apply for trials'
  }

  if (type === 'job') {
    return 'Only coaches can apply for jobs'
  }

  return 'Only athletes and coaches can register for tournaments'
}

const mapListing = (row: ListingWithAuthorRow) => {
  return {
    id: row.id,
    posted_by: row.posted_by,
    type: row.type,
    sport: row.sport,
    title: row.title,
    description: row.description,
    date: row.date,
    location: row.location,
    city: row.city,
    requirements: row.requirements,
    age_group: row.age_group,
    experience_required: row.experience_required,
    prize_pool: row.prize_pool,
    created_at: row.created_at,
    author: {
      id: row.posted_by,
      name: row.author_name,
      role: row.author_role,
      photo_url: row.author_photo_url
    },
    stats: {
      applications_count: Number(row.applications_count),
      applied_by_me: row.applied_by_me
    }
  }
}

export const getListings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const validation = validateListingsQuery(req)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid query params' })
      return
    }

    const query = validation.data

    const result = await pool.query<ListingWithAuthorRow>(
      `SELECT
         l.id,
         l.posted_by,
         l.type,
         l.sport,
         l.title,
         l.description,
         l.date,
         l.location,
         l.city,
         l.requirements,
         l.age_group,
         l.experience_required,
         l.prize_pool,
         l.created_at,
         u.name AS author_name,
         u.role AS author_role,
         p.photo_url AS author_photo_url,
         COUNT(a.id) AS applications_count,
         EXISTS (
           SELECT 1
           FROM applications my_application
           WHERE my_application.listing_id = l.id
             AND my_application.applicant_id = $1
         ) AS applied_by_me
       FROM listings l
       INNER JOIN users u ON u.id = l.posted_by
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN applications a ON a.listing_id = l.id
       WHERE ($2::TEXT IS NULL OR l.type = $2)
         AND ($3::TEXT IS NULL OR l.sport ILIKE $3)
         AND ($4::TEXT IS NULL OR l.city ILIKE $4)
       GROUP BY l.id, u.name, u.role, p.photo_url
       ORDER BY l.created_at DESC
       LIMIT 50`,
      [
        req.user.id,
        query.type ?? null,
        query.sport ? `%${query.sport}%` : null,
        query.city ? `%${query.city}%` : null
      ]
    )

    res.status(200).json({ data: result.rows.map(mapListing) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const createListing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (req.user.role !== 'academy') {
      res.status(403).json({ error: 'Only academies can create listings' })
      return
    }

    const validation = validateCreateListingBody(req.body)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid request body' })
      return
    }

    const body = validation.data

    const result = await pool.query<ListingRow>(
      `INSERT INTO listings (
         posted_by,
         type,
         sport,
         title,
         description,
         date,
         location,
         city,
         requirements,
         age_group,
         experience_required,
         prize_pool
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        req.user.id,
        body.type,
        body.sport,
        body.title,
        body.description,
        body.date,
        body.location,
        body.city,
        body.requirements,
        body.age_group,
        body.experience_required,
        body.prize_pool
      ]
    )

    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const getListing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const listingId = getParamString(req.params.id)

    if (!listingId || !isValidUuid(listingId)) {
      res.status(400).json({ error: 'Valid listing id is required' })
      return
    }

    const result = await pool.query<ListingWithAuthorRow>(
      `SELECT
         l.id,
         l.posted_by,
         l.type,
         l.sport,
         l.title,
         l.description,
         l.date,
         l.location,
         l.city,
         l.requirements,
         l.age_group,
         l.experience_required,
         l.prize_pool,
         l.created_at,
         u.name AS author_name,
         u.role AS author_role,
         p.photo_url AS author_photo_url,
         COUNT(a.id) AS applications_count,
         EXISTS (
           SELECT 1
           FROM applications my_application
           WHERE my_application.listing_id = l.id
             AND my_application.applicant_id = $1
         ) AS applied_by_me
       FROM listings l
       INNER JOIN users u ON u.id = l.posted_by
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN applications a ON a.listing_id = l.id
       WHERE l.id = $2
       GROUP BY l.id, u.name, u.role, p.photo_url`,
      [req.user.id, listingId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' })
      return
    }

    res.status(200).json({ data: mapListing(result.rows[0]) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const applyToListing = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const listingId = getParamString(req.params.id)

    if (!listingId || !isValidUuid(listingId)) {
      res.status(400).json({ error: 'Valid listing id is required' })
      return
    }

    const listingResult = await pool.query<ListingRow>(
      'SELECT * FROM listings WHERE id = $1',
      [listingId]
    )

    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' })
      return
    }

    const listing = listingResult.rows[0]

    if (listing.posted_by === req.user.id) {
      res.status(403).json({ error: 'You cannot apply to your own listing' })
      return
    }

    if (!canApplyToListing(req.user.role, listing.type)) {
      res.status(403).json({ error: getApplyError(listing.type) })
      return
    }

    const existing = await pool.query<{ id: string }>(
      'SELECT id FROM applications WHERE listing_id = $1 AND applicant_id = $2',
      [listingId, req.user.id]
    )

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Already applied to this listing' })
      return
    }

    const result = await pool.query<ApplicationRow>(
      `INSERT INTO applications (listing_id, applicant_id)
       VALUES ($1, $2)
       RETURNING id, listing_id, applicant_id, status, created_at`,
      [listingId, req.user.id]
    )

    await pool.query(
      `INSERT INTO notifications (user_id, type, message)
       VALUES ($1, $2, $3)`,
      [
        listing.posted_by,
        listing.type,
        `Someone applied to your ${listing.type}`
      ]
    )

    emitToUser(listing.posted_by, 'new_notification', { type: listing.type, message: `Someone applied to your ${listing.type}` })

    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

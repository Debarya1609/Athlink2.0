import { Request, Response } from 'express'
import pool from '../models/db'
import { MediaType, UserRole } from '../types'
import { emitToUser } from '../sockets/socketManager'

interface CreatePostBody {
  content?: string | null
  media_url?: string | null
  media_type?: MediaType | null
}

interface CreateCommentBody {
  content: string
}

interface PostRow {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  media_type: MediaType | null
  created_at: Date
}

interface FeedPostRow extends PostRow {
  author_name: string
  author_role: UserRole
  author_photo_url: string | null
  likes_count: string
  comments_count: string
  liked_by_me: boolean
}

interface CommentRow {
  id: string
  user_id: string
  post_id: string
  content: string
  created_at: Date
}

interface CommentWithAuthorRow extends CommentRow {
  author_name: string
  author_role: UserRole
  author_photo_url: string | null
}

interface PostOwnerRow {
  id: string
  user_id: string
}

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

const validMediaTypes: MediaType[] = ['image', 'video']

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
  key: keyof CreatePostBody,
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

const validateCreatePostBody = (
  body: unknown
): { data: CreatePostBody | null; error: string | null } => {
  if (!isRecord(body)) {
    return { data: null, error: 'Invalid request body' }
  }

  const errors: string[] = []
  const content = validateNullableString(body, 'content', 2000, errors)
  const mediaUrl = validateNullableString(body, 'media_url', 500, errors)
  let mediaType: MediaType | null | undefined

  if ('media_type' in body) {
    const value = body.media_type

    if (value === null) {
      mediaType = null
    } else if (typeof value === 'string' && validMediaTypes.includes(value as MediaType)) {
      mediaType = value as MediaType
    } else {
      errors.push('media_type must be image, video, or null')
    }
  }

  if (mediaUrl && !/^https?:\/\/\S+\.\S+$/.test(mediaUrl)) {
    errors.push('media_url must be a valid http or https URL')
  }

  if (mediaUrl && !mediaType) {
    errors.push('media_type is required when media_url is provided')
  }

  if (mediaType && !mediaUrl) {
    errors.push('media_url is required when media_type is provided')
  }

  if (!content && !mediaUrl) {
    errors.push('Post content or media_url is required')
  }

  if (errors.length > 0) {
    return { data: null, error: errors[0] }
  }

  return {
    data: {
      content: content ?? null,
      media_url: mediaUrl ?? null,
      media_type: mediaType ?? null
    },
    error: null
  }
}

const validateCreateCommentBody = (
  body: unknown
): { data: CreateCommentBody | null; error: string | null } => {
  if (!isRecord(body)) {
    return { data: null, error: 'Invalid request body' }
  }

  const value = body.content

  if (typeof value !== 'string') {
    return { data: null, error: 'Comment content is required' }
  }

  const content = value.trim()

  if (!content) {
    return { data: null, error: 'Comment content is required' }
  }

  if (content.length > 500) {
    return { data: null, error: 'Comment content must be 500 characters or less' }
  }

  return { data: { content }, error: null }
}

const mapFeedPost = (row: FeedPostRow) => {
  return {
    id: row.id,
    user_id: row.user_id,
    content: row.content,
    media_url: row.media_url,
    media_type: row.media_type,
    created_at: row.created_at,
    author: {
      id: row.user_id,
      name: row.author_name,
      role: row.author_role,
      photo_url: row.author_photo_url
    },
    stats: {
      likes_count: Number(row.likes_count),
      comments_count: Number(row.comments_count),
      liked_by_me: row.liked_by_me
    }
  }
}

const mapComment = (row: CommentWithAuthorRow) => {
  return {
    id: row.id,
    post_id: row.post_id,
    user_id: row.user_id,
    content: row.content,
    created_at: row.created_at,
    author: {
      id: row.user_id,
      name: row.author_name,
      role: row.author_role,
      photo_url: row.author_photo_url
    }
  }
}

const getPostOwner = async (postId: string): Promise<PostOwnerRow | null> => {
  const result = await pool.query<PostOwnerRow>(
    'SELECT id, user_id FROM posts WHERE id = $1',
    [postId]
  )

  return result.rows[0] ?? null
}

export const getFeed = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const result = await pool.query<FeedPostRow>(
      `SELECT
         p.id,
         p.user_id,
         p.content,
         p.media_url,
         p.media_type,
         p.created_at,
         u.name AS author_name,
         u.role AS author_role,
         pr.photo_url AS author_photo_url,
         COUNT(DISTINCT l.user_id) AS likes_count,
         COUNT(DISTINCT c.id) AS comments_count,
         EXISTS (
           SELECT 1
           FROM likes my_like
           WHERE my_like.post_id = p.id AND my_like.user_id = $1
         ) AS liked_by_me
       FROM posts p
       INNER JOIN users u ON u.id = p.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       GROUP BY p.id, u.name, u.role, pr.photo_url
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.user.id]
    )

    res.status(200).json({ data: result.rows.map(mapFeedPost) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const getUserPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const userId = getParamString(req.params.id)

    if (!userId || !isValidUuid(userId)) {
      res.status(400).json({ error: 'Valid user id is required' })
      return
    }

    const result = await pool.query<FeedPostRow>(
      `SELECT
         p.id,
         p.user_id,
         p.content,
         p.media_url,
         p.media_type,
         p.created_at,
         u.name AS author_name,
         u.role AS author_role,
         pr.photo_url AS author_photo_url,
         COUNT(DISTINCT l.user_id) AS likes_count,
         COUNT(DISTINCT c.id) AS comments_count,
         EXISTS (
           SELECT 1
           FROM likes my_like
           WHERE my_like.post_id = p.id AND my_like.user_id = $1
         ) AS liked_by_me
       FROM posts p
       INNER JOIN users u ON u.id = p.user_id
       LEFT JOIN profiles pr ON pr.user_id = u.id
       LEFT JOIN likes l ON l.post_id = p.id
       LEFT JOIN comments c ON c.post_id = p.id
       WHERE p.user_id = $2
       GROUP BY p.id, u.name, u.role, pr.photo_url
       ORDER BY p.created_at DESC
       LIMIT 50`,
      [req.user.id, userId]
    )

    res.status(200).json({ data: result.rows.map(mapFeedPost) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const createPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const validation = validateCreatePostBody(req.body)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid request body' })
      return
    }

    const body = validation.data

    const result = await pool.query<PostRow>(
      `INSERT INTO posts (user_id, content, media_url, media_type)
       VALUES ($1, $2, $3, $4)
       RETURNING id, user_id, content, media_url, media_type, created_at`,
      [req.user.id, body.content, body.media_url, body.media_type]
    )

    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const deletePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const postId = getParamString(req.params.id)

    if (!postId || !isValidUuid(postId)) {
      res.status(400).json({ error: 'Valid post id is required' })
      return
    }

    const post = await getPostOwner(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    if (post.user_id !== req.user.id) {
      res.status(403).json({ error: 'You can only delete your own posts' })
      return
    }

    await pool.query('DELETE FROM posts WHERE id = $1', [postId])

    res.status(200).json({ data: { id: postId } })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const likePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const postId = getParamString(req.params.id)

    if (!postId || !isValidUuid(postId)) {
      res.status(400).json({ error: 'Valid post id is required' })
      return
    }

    const post = await getPostOwner(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const existing = await pool.query<{ user_id: string }>(
      'SELECT user_id FROM likes WHERE user_id = $1 AND post_id = $2',
      [req.user.id, postId]
    )

    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Post already liked' })
      return
    }

    await pool.query(
      'INSERT INTO likes (user_id, post_id) VALUES ($1, $2)',
      [req.user.id, postId]
    )

    if (post.user_id !== req.user.id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message)
         VALUES ($1, $2, $3)`,
        [post.user_id, 'like', 'Someone liked your post']
      )
      emitToUser(post.user_id, 'new_notification', { type: 'like', message: 'Someone liked your post' })
    }

    res.status(201).json({
      data: {
        user_id: req.user.id,
        post_id: postId
      }
    })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const unlikePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const postId = getParamString(req.params.id)

    if (!postId || !isValidUuid(postId)) {
      res.status(400).json({ error: 'Valid post id is required' })
      return
    }

    const post = await getPostOwner(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const result = await pool.query<{ user_id: string }>(
      `DELETE FROM likes
       WHERE user_id = $1 AND post_id = $2
       RETURNING user_id`,
      [req.user.id, postId]
    )

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Like not found' })
      return
    }

    res.status(200).json({
      data: {
        user_id: req.user.id,
        post_id: postId
      }
    })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const commentOnPost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const postId = getParamString(req.params.id)

    if (!postId || !isValidUuid(postId)) {
      res.status(400).json({ error: 'Valid post id is required' })
      return
    }

    const validation = validateCreateCommentBody(req.body)

    if (!validation.data) {
      res.status(400).json({ error: validation.error ?? 'Invalid request body' })
      return
    }

    const post = await getPostOwner(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const result = await pool.query<CommentRow>(
      `INSERT INTO comments (user_id, post_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, post_id, content, created_at`,
      [req.user.id, postId, validation.data.content]
    )

    if (post.user_id !== req.user.id) {
      await pool.query(
        `INSERT INTO notifications (user_id, type, message)
         VALUES ($1, $2, $3)`,
        [post.user_id, 'comment', 'Someone commented on your post']
      )
      emitToUser(post.user_id, 'new_notification', { type: 'comment', message: 'Someone commented on your post' })
    }

    res.status(201).json({ data: result.rows[0] })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

export const getPostComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    const postId = getParamString(req.params.id)

    if (!postId || !isValidUuid(postId)) {
      res.status(400).json({ error: 'Valid post id is required' })
      return
    }

    const post = await getPostOwner(postId)

    if (!post) {
      res.status(404).json({ error: 'Post not found' })
      return
    }

    const result = await pool.query<CommentWithAuthorRow>(
      `SELECT
         c.id,
         c.user_id,
         c.post_id,
         c.content,
         c.created_at,
         u.name AS author_name,
         u.role AS author_role,
         p.photo_url AS author_photo_url
       FROM comments c
       INNER JOIN users u ON u.id = c.user_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE c.post_id = $1
       ORDER BY c.created_at ASC`,
      [postId]
    )

    res.status(200).json({ data: result.rows.map(mapComment) })
  } catch (err) {
    res.status(500).json({ error: getErrorMessage(err) })
  }
}

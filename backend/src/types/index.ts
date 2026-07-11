export type UserRole = 'athlete' | 'coach' | 'academy'
export type ListingType = 'trial' | 'job' | 'tournament'
export type MediaType = 'image' | 'video'
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected'
export type NotificationType =
  | 'follow'
  | 'like'
  | 'comment'
  | 'message'
  | 'trial'
  | 'job'
  | 'tournament'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  created_at: Date
}

export interface Profile {
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

export interface Post {
  id: string
  user_id: string
  content: string | null
  media_url: string | null
  media_type: MediaType | null
  created_at: Date
}

export interface Listing {
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

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: Date
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: Date
}

export interface JWTPayload {
  id: string
  role: UserRole
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

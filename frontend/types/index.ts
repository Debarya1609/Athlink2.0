export type UserRole = 'athlete' | 'coach' | 'academy'
export type ListingType = 'trial' | 'job' | 'tournament'
export type MediaType = 'image' | 'video'
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
}

export interface Profile {
  id: string
  user_id: string
  photo_url: string | null
  bio: string | null
  city: string | null
  state: string | null
  sport: string | null
  // Athlete
  position: string | null
  age: number | null
  available_for_trials: boolean
  height: string | null
  weight: string | null
  // Coach
  experience_years: number | null
  certifications: string | null
  open_to_opportunities: boolean
  // Academy
  academy_type: string | null
  established_year: number | null
  website_url: string | null
  member_count: number | null
}

export interface PublicUser {
  id: string
  name: string
  role: UserRole
  sport: string | null
  city: string | null
  photo_url: string | null
  available_for_trials?: boolean
  followers_count: number
  following_count: number
}

export interface Post {
  id: string
  user: PublicUser
  content: string | null
  media_url: string | null
  media_type: MediaType | null
  likes_count: number
  comments_count: number
  liked_by_me: boolean
  created_at: string
}

export interface Comment {
  id: string
  user: PublicUser
  content: string
  created_at: string
}

export interface Listing {
  id: string
  type: ListingType
  sport: string
  title: string
  description: string | null
  date: string | null
  location: string | null
  city: string | null
  requirements: string | null
  age_group: string | null
  experience_required: string | null
  prize_pool: string | null
  posted_by: PublicUser
  created_at: string
}

export interface Message {
  id: string
  sender_id: string
  receiver_id: string
  content: string
  read: boolean
  created_at: string
}

export interface Conversation {
  id: string
  user: PublicUser
  last_message: string
  unread_count: number
  updated_at: string
}

export interface Notification {
  id: string
  type: NotificationType
  message: string
  read: boolean
  created_at: string
}

export interface AuthResponse {
  token: string
  user: User
}

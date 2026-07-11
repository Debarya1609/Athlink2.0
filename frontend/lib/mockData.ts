import { Post, Listing, Conversation, Notification, PublicUser, Profile } from '@/types'

export const mockUser: PublicUser = {
  id: '1',
  name: 'Rahul Sharma',
  role: 'athlete',
  sport: 'Cricket',
  city: 'Nagpur',
  photo_url: null,
  available_for_trials: true,
  followers_count: 124,
  following_count: 87
}

export const mockAthleteProfile: Profile = {
  id: 'p1',
  user_id: '1',
  photo_url: null,
  bio: 'Passionate top-order batsman playing district level for Nagpur. Looking for academy trials and professional opportunities to take my game to the next level.',
  city: 'Nagpur',
  state: 'Maharashtra',
  sport: 'Cricket',
  position: 'Top-order Batsman',
  age: 19,
  available_for_trials: true,
  height: '5\'10"',
  weight: '72 kg',
  experience_years: null,
  certifications: null,
  open_to_opportunities: false,
  academy_type: null,
  established_year: null,
  website_url: null,
  member_count: null
}

export const mockAcademy: PublicUser = {
  id: '2',
  name: 'Mumbai Cricket Academy',
  role: 'academy',
  sport: 'Cricket',
  city: 'Mumbai',
  photo_url: null,
  followers_count: 3400,
  following_count: 12
}

export const mockCoach: PublicUser = {
  id: '3',
  name: 'Vikram Singh',
  role: 'coach',
  sport: 'Cricket',
  city: 'Delhi',
  photo_url: null,
  followers_count: 850,
  following_count: 45
}

export const mockCoachProfile: Profile = {
  id: 'p2',
  user_id: '3',
  photo_url: null,
  bio: 'Former first-class cricketer turned certified NCA Level 2 coach. Specialized in fast bowling and biomechanics. Currently working with Delhi state junior teams.',
  city: 'Delhi',
  state: 'Delhi',
  sport: 'Cricket',
  position: null,
  age: 42,
  available_for_trials: false,
  height: null,
  weight: null,
  experience_years: 12,
  certifications: 'NCA Level 2, BCCI Fast Bowling Workshop',
  open_to_opportunities: true,
  academy_type: null,
  established_year: null,
  website_url: null,
  member_count: null
}

export const mockAcademyProfile: Profile = {
  id: 'p3',
  user_id: '2',
  photo_url: null,
  bio: 'Premier cricket academy in Mumbai fostering the next generation of professional cricketers. Equipped with state-of-the-art turf wickets and bowling machines.',
  city: 'Mumbai',
  state: 'Maharashtra',
  sport: 'Cricket',
  position: null,
  age: null,
  available_for_trials: false,
  height: null,
  weight: null,
  experience_years: null,
  certifications: null,
  open_to_opportunities: false,
  academy_type: 'Professional Sports Academy',
  established_year: 2005,
  website_url: 'https://mumbaicricketacademy.com',
  member_count: 450
}

export const mockPosts: Post[] = [
  {
    id: '1',
    user: mockUser,
    content: 'Scored 87 off 43 balls in district tournament yesterday 🏏',
    media_url: null,
    media_type: null,
    likes_count: 34,
    comments_count: 8,
    liked_by_me: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    user: mockAcademy,
    content: 'Proud to announce our Under-19 batch selections for the upcoming season. Applications open now.',
    media_url: null,
    media_type: null,
    likes_count: 89,
    comments_count: 23,
    liked_by_me: false,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

export const mockListings: Listing[] = [
  {
    id: '1',
    type: 'trial',
    sport: 'Cricket',
    title: 'Under-19 Cricket Trial',
    description: 'Open trials for our Under-19 cricket programme.',
    date: '2026-05-20',
    location: 'Wankhede Academy Ground',
    city: 'Mumbai',
    requirements: 'Min 2 years academy experience',
    age_group: 'Under-19',
    experience_required: null,
    prize_pool: null,
    posted_by: mockAcademy,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'job',
    sport: 'Football',
    title: 'Assistant Football Coach',
    description: 'Looking for an experienced assistant coach for our senior team.',
    date: null,
    location: 'Pune FC Academy',
    city: 'Pune',
    requirements: null,
    age_group: null,
    experience_required: '3+ years coaching experience',
    prize_pool: null,
    posted_by: {
      id: '3',
      name: 'Pune FC Academy',
      role: 'academy',
      sport: 'Football',
      city: 'Pune',
      photo_url: null,
      followers_count: 890,
      following_count: 5
    },
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    type: 'tournament',
    sport: 'Football',
    title: 'All India U-17 Football Cup',
    description: 'Annual inter-state football championship for U-17 players.',
    date: '2026-06-10',
    location: 'Jawaharlal Nehru Stadium',
    city: 'Delhi',
    requirements: null,
    age_group: 'Under-17',
    experience_required: null,
    prize_pool: '₹50,000',
    posted_by: {
      id: '4',
      name: 'Delhi Football Association',
      role: 'academy',
      sport: 'Football',
      city: 'Delhi',
      photo_url: null,
      followers_count: 5600,
      following_count: 0
    },
    created_at: new Date().toISOString()
  }
]

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    user: mockAcademy,
    last_message: "We'd love to invite you for a trial next Sunday",
    unread_count: 2,
    updated_at: new Date().toISOString()
  },
  {
    id: 'c2',
    user: mockCoach,
    last_message: "Keep working on that front foot stride.",
    unread_count: 0,
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
]

export const mockMessages: Record<string, import('@/types').Message[]> = {
  'c1': [
    {
      id: 'm1',
      sender_id: '1',
      receiver_id: '2',
      content: 'Hello! I saw your post about the U-19 trials.',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'm2',
      sender_id: '2',
      receiver_id: '1',
      content: "Hi Rahul, yes we are conducting trials for the upcoming district league.",
      read: true,
      created_at: new Date(Date.now() - 86000000).toISOString()
    },
    {
      id: 'm3',
      sender_id: '2',
      receiver_id: '1',
      content: "We'd love to invite you for a trial next Sunday",
      read: false,
      created_at: new Date().toISOString()
    }
  ],
  'c2': [
    {
      id: 'm4',
      sender_id: '3',
      receiver_id: '1',
      content: 'Keep working on that front foot stride.',
      read: true,
      created_at: new Date(Date.now() - 86400000).toISOString()
    }
  ]
}

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'follow',
    message: 'Mumbai Cricket Academy started following you',
    read: false,
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    type: 'trial',
    message: 'New cricket trial posted near Nagpur — Under-19 Cricket Trial',
    read: false,
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    type: 'like',
    message: 'Coach Vinay liked your post',
    read: true,
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
]

export const mockUsers: PublicUser[] = [
  mockUser,
  mockAcademy,
  mockCoach,
  {
    id: '4',
    name: 'Delhi Football Association',
    role: 'academy',
    sport: 'Football',
    city: 'Delhi',
    photo_url: null,
    followers_count: 5600,
    following_count: 0
  },
  {
    id: '5',
    name: 'Pune FC Academy',
    role: 'academy',
    sport: 'Football',
    city: 'Pune',
    photo_url: null,
    followers_count: 890,
    following_count: 5
  }
];

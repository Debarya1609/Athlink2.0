'use client';

import React from 'react';
import { FeedPost } from '@/components/feed/FeedPost';
import { PostCreationBox } from '@/components/feed/PostCreationBox';
import { useRouter } from 'next/navigation';

const MOCK_COMMUNITY_POSTS = [
  {
    id: 1,
    name: 'Michael Chen',
    avatar: 'https://i.pravatar.cc/150?img=11',
    roleBadge: 'MODERATOR',
    timestamp: '1h ago',
    content: 'Welcome to the Global Runners Community! Please make sure to read the updated rules on the right sidebar. We are organizing a virtual 5k this weekend, drop your Strava links below! #GlobalRunners #Virtual5k',
    image: 'https://images.unsplash.com/photo-1552674605-15c2145b8ce4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    likes: 124,
    comments: 45
  }
];

export default function CommunitySlugPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  
  return (
    <div className="flex flex-col w-full bg-[var(--color-white)] min-h-screen">
      
      {/* Header */}
      <div className="flex items-center px-4 md:px-6 py-4 border-b border-[var(--color-gray-15)] bg-[var(--color-white)]">
        <button onClick={() => router.back()} className="mr-4 text-[var(--color-ink)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <div className="flex flex-col">
          <h1 className="font-display text-2xl font-extrabold text-[var(--color-ink)] uppercase tracking-wide">
            {decodeURIComponent(params.slug).replace(/-/g, ' ')}
          </h1>
          <p className="text-[var(--color-gray-60)] text-[12px] font-mono mt-0.5 uppercase">12.4k Members • Public</p>
        </div>
        <button className="ml-auto px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest bg-[var(--color-ink)] text-[var(--color-white)] hover:bg-[var(--color-gray-60)] transition-colors">
          Join
        </button>
      </div>

      {/* Community Feed */}
      <div className="px-4 md:px-6 py-4">
        <PostCreationBox />
      </div>

      <div className="lane-line"></div>

      <div className="w-full flex flex-col">
        {MOCK_COMMUNITY_POSTS.map((post) => (
          <FeedPost 
            key={post.id}
            id={post.id.toString()}
            name={post.name}
            avatar={post.avatar}
            roleBadge={post.roleBadge}
            timestamp={post.timestamp}
            content={post.content}
            image={post.image}
            likes={post.likes}
            comments={post.comments}
            postType="announcement"
          />
        ))}
      </div>
    </div>
  );
}

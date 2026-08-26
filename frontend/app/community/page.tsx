import React from 'react';
import { FeedPost } from '../../components/feed/FeedPost';
import { PostCreationBox } from '../../components/feed/PostCreationBox';

const SUGGESTED_COMMUNITIES = [
  { name: 'Global Runners', members: '12.4k', type: 'Public', status: 'Joined' },
  { name: 'Pro Cyclists Hub', members: '8.2k', type: 'Public', status: 'Join' },
  { name: 'Swimming Masters', members: '5.1k', type: 'Private', status: 'Request' },
  { name: 'Soccer Tactics', members: '15.8k', type: 'Public', status: 'Join' },
  { name: 'Ironman Training', members: '3.9k', type: 'Public', status: 'Join' },
];

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
  },
  {
    id: 2,
    name: 'Emma Thompson',
    avatar: 'https://i.pravatar.cc/150?img=5',
    roleBadge: 'MEMBER',
    timestamp: '3h ago',
    content: 'Just hit my personal best in the 100m sprint today! 🏃‍♀️💨 Massive thanks to the community here for the form check advice last week. #SprintTraining #PB',
    likes: 89,
    comments: 12
  }
];

export default function CommunityPage() {
  return (
    <div className="flex flex-col w-full bg-[var(--color-white)] min-h-screen">
      
      {/* Header */}
      <div className="px-4 md:px-6 py-6 border-b border-[var(--color-gray-15)] bg-[var(--color-white)]">
        <h1 className="font-display text-3xl font-extrabold text-[var(--color-ink)] uppercase tracking-wide">Communities</h1>
        <p className="text-[var(--color-gray-60)] text-[13px] font-mono mt-1 uppercase">Join groups and engage with athletes worldwide</p>
      </div>

      {/* Suggested Communities List */}
      <div className="px-4 md:px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-[var(--color-ink)] uppercase tracking-wide">Suggested For You</h2>
        </div>
        
        <div className="flex flex-col border border-[var(--color-gray-15)] bg-[var(--color-white)]">
          {SUGGESTED_COMMUNITIES.map((community, idx) => (
            <div key={idx} className={`flex items-center justify-between p-4 ${idx !== SUGGESTED_COMMUNITIES.length - 1 ? 'border-b border-[var(--color-gray-15)]' : ''}`}>
              <div className="flex flex-col">
                <span className="font-display font-bold text-[16px] text-[var(--color-ink)] uppercase tracking-wide">{community.name}</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-mono text-[11px] text-[var(--color-gray-60)]">{community.members} Members</span>
                  <span className="text-[var(--color-gray-40)]">•</span>
                  <span className="font-mono text-[11px] text-[var(--color-gray-60)]">{community.type}</span>
                </div>
              </div>
              <button className={`px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest transition-colors ${
                community.status === 'Joined' 
                  ? 'bg-transparent text-[var(--color-ink)] border border-[var(--color-gray-15)]' 
                  : 'bg-[var(--color-ink)] text-[var(--color-white)] hover:bg-[var(--color-gray-60)]'
              }`}>
                {community.status}
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="lane-line"></div>

      {/* Community Feed */}
      <div className="px-4 md:px-6 py-4">
        <h2 className="font-display text-lg font-bold text-[var(--color-ink)] uppercase tracking-wide mb-4">Your Feed</h2>
        <PostCreationBox />
      </div>

      <div className="lane-line"></div>

      <div className="w-full flex flex-col">
        {MOCK_COMMUNITY_POSTS.map((post) => (
          <FeedPost 
            key={post.id}
            id={post.id.toString()}
            authorId={post.id.toString()}
            name={post.name}
            avatar={post.avatar}
            roleBadge={post.roleBadge}
            timestamp={post.timestamp}
            content={post.content}
            image={post.image}
            likes={post.likes}
            comments={post.comments}
            postType="general"
          />
        ))}
      </div>
    </div>
  );
}

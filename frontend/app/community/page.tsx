import React from 'react';
import { FeedPost } from '../../components/feed/FeedPost';
import { PostCreationBox } from '../../components/feed/PostCreationBox';

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
  },
  {
    id: 3,
    name: 'Coach Marcus',
    avatar: 'https://i.pravatar.cc/150?img=33',
    roleBadge: 'COACH',
    timestamp: '5h ago',
    content: 'Reminder: The weekly AMA session on injury prevention starts in 2 hours. Drop your questions in the thread. #InjuryPrevention #Coaching',
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    likes: 210,
    comments: 56
  }
];

const SUGGESTED_COMMUNITIES = [
  { name: 'Global Runners', members: '12.4k', logo: '🏃', color: 'bg-blue-100 text-blue-600' },
  { name: 'Pro Cyclists Hub', members: '8.2k', logo: '🚴', color: 'bg-green-100 text-green-600' },
  { name: 'Swimming Masters', members: '5.1k', logo: '🏊', color: 'bg-cyan-100 text-cyan-600' },
  { name: 'Soccer Tactics', members: '15.8k', logo: '⚽', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'Ironman Training', members: '3.9k', logo: '🏃‍♂️', color: 'bg-orange-100 text-orange-600' },
];

const COMMUNITY_RULES = [
  'Be respectful and supportive to all athletes.',
  'No spam or self-promotion without permission.',
  'Keep discussions relevant to sports and training.',
  'Do not share unauthorized medical advice.',
];

export default function CommunityPage() {
  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
        
        {/* Left Column - Main Content Area */}
        <div className="flex-1 max-w-3xl min-w-0 flex flex-col gap-6">
          
          {/* Community Banner / Welcome */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
            <div className="h-32 bg-gradient-to-r from-theme-cobalt via-theme-cerulean to-theme-teal"></div>
            <div className="px-6 pb-6 pt-4 relative">
              <div className="absolute -top-12 left-6 w-24 h-24 bg-white rounded-xl shadow-md flex items-center justify-center text-4xl border-4 border-white">
                🏅
              </div>
              <div className="ml-32 flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-theme-charcoal">All Communities</h1>
                  <p className="text-theme-slate text-sm mt-1">Discover, join, and share with athletes worldwide.</p>
                </div>
                <button className="bg-theme-teal text-white font-semibold px-5 py-2 rounded-full shadow-sm hover:bg-opacity-90 transition-colors">
                  Create Community
                </button>
              </div>
            </div>
          </div>

          {/* Post Creation */}
          <PostCreationBox />

          {/* Feed Posts */}
          <div className="space-y-6">
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
              />
            ))}
          </div>
        </div>

        {/* Right Column - Widgets */}
        <div className="hidden xl:flex flex-col w-[340px] shrink-0 gap-6">
          
          {/* Admin Rules Widget */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
            <div className="flex items-center gap-2 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-theme-coral">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h2 className="text-[16px] font-bold text-theme-charcoal">Community Rules</h2>
            </div>
            <ul className="flex flex-col gap-3">
              {COMMUNITY_RULES.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-theme-cerulean font-bold text-sm mt-0.5">{idx + 1}.</span>
                  <span className="text-[13px] text-theme-slate leading-tight">{rule}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Small List of Communities */}
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
            <h2 className="text-[16px] font-bold text-theme-charcoal mb-5">Suggested Communities</h2>
            <div className="flex flex-col gap-5">
              {SUGGESTED_COMMUNITIES.map((community, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm ${community.color}`}>
                      {community.logo}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[14px] font-semibold text-theme-charcoal leading-tight group-hover:text-theme-cobalt transition-colors">{community.name}</span>
                      <span className="text-[12px] text-theme-slate mt-0.5">{community.members} Members</span>
                    </div>
                  </div>
                  <button className="bg-[#F0F2F5] text-theme-charcoal text-[13px] font-semibold px-4 py-1.5 rounded-full hover:bg-theme-border transition-colors">
                    Join
                  </button>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 text-theme-cerulean text-[14px] font-semibold hover:text-theme-cobalt transition-colors">
              View All Communities
            </button>
          </div>
          
        </div>

      </div>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { PostCreationBox } from '../../components/feed/PostCreationBox';
import { FeedPost } from '../../components/feed/FeedPost';
import api from '@/lib/api';

import { RightSidebar } from '../../components/layout/RightSidebar';

interface FeedItem {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  author: {
    id: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
  stats: {
    likes_count: number;
    comments_count: number;
    liked_by_me: boolean;
  };
}

export default function FeedPage() {
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data } = await api.get('/feed');
      setPosts(data.data || []);
    } catch (err) {
      console.error('Failed to fetch feed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void fetchPosts();
    });
  }, [fetchPosts]);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-start gap-8">
        
        {/* Left Column - Main Feed */}
        <div className="flex-1 max-w-3xl min-w-0">
          
          {/* Post Creation */}
          <PostCreationBox onPostCreated={fetchPosts} />

          {/* Stories Section */}
          <div className="mb-8 bg-white p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] overflow-hidden border border-transparent">
            <h2 className="text-[15px] font-bold text-theme-charcoal mb-4">Recent Stories</h2>
            <div className="flex items-center gap-5 overflow-x-auto pb-2 no-scrollbar">
              {/* Add Story Button */}
              <div className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
                <div className="h-[60px] w-[60px] rounded-full bg-theme-cobalt flex items-center justify-center text-white shadow-sm hover:scale-105 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <span className="text-[13px] font-medium text-theme-charcoal">Add Story</span>
              </div>
              
              {/* Mock Stories */}
              {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div key={i} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0 group">
                  <div className="h-[64px] w-[64px] rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#9455B7] to-[#2E5BFF] p-[3px] group-hover:scale-105 transition-transform duration-300">
                    <div className="h-full w-full rounded-full bg-[#F0F2F5] border-2 border-white flex items-center justify-center overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                    </div>
                  </div>
                  <span className="text-[13px] font-medium text-theme-charcoal">User {i}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Feed Posts */}
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading feed...</div>
            ) : posts.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No posts yet. Be the first to share!</div>
            ) : (
              posts.map((post) => (
                <FeedPost 
                  key={post.id}
                  id={post.id}
                  name={post.author?.name || 'Unknown User'}
                  avatar={post.author?.photo_url || ''}
                  roleBadge={post.author?.role || 'User'}
                  timestamp={new Date(post.created_at).toLocaleDateString()}
                  content={post.content}
                  image={post.media_url || undefined}
                  likes={post.stats.likes_count}
                  comments={post.stats.comments_count}
                  hasLiked={post.stats.liked_by_me}
                  onInteraction={fetchPosts}
                />
              ))
            )}
          </div>
        </div>

        <RightSidebar />

      </div>
    </div>
  );
}

'use client';

import React, { useCallback, useEffect, useState } from 'react';

import { FeedPost } from '../../components/feed/FeedPost';
import api from '@/lib/api';

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
    <div className="w-full">
      {/* Stories Section - Always top, monochromatic */}
      <div className="py-4 px-4 md:px-6 overflow-hidden">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
            <div className="h-[56px] w-[56px] rounded-full border border-[var(--color-gray-15)] flex items-center justify-center text-[var(--color-ink)] hover:bg-[var(--color-paper)] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-[12px] text-[var(--color-ink)] font-medium">Add Story</span>
          </div>
          
          {/* Mock Stories */}
          {[1, 2, 3, 4, 5, 6, 7].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0">
              <div className="h-[60px] w-[60px] rounded-full border-[1.5px] border-[var(--color-ink)] p-[2px]">
                <div className="h-full w-full rounded-full bg-[var(--color-paper)] flex items-center justify-center overflow-hidden">
                  <img src={`https://i.pravatar.cc/150?img=${i + 10}`} alt={`User ${i}`} className="w-full h-full object-cover" />
                </div>
              </div>
              <span className="text-[12px] text-[var(--color-ink)] font-medium">User {i}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border-b border-[var(--color-gray-15)]"></div>

      {/* Sort / Filter Bar */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--color-gray-15)] bg-[var(--color-white)]">
        <span className="font-display text-[12px] font-bold text-[var(--color-ink)] uppercase tracking-wider hidden sm:block">Feed</span>
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-[10px] font-mono text-[var(--color-gray-40)] uppercase tracking-widest hidden xs:block">Sort by:</span>
          <div className="flex items-center gap-4">
             <button className="text-[11px] sm:text-[12px] font-bold text-[var(--color-ink)] uppercase tracking-wider border-b-2 border-[var(--color-ink)] pb-1" onClick={fetchPosts}>Following</button>
             <button className="text-[11px] sm:text-[12px] font-bold text-[var(--color-gray-40)] uppercase tracking-wider hover:text-[var(--color-ink)] pb-1 transition-colors" onClick={fetchPosts}>Organizations</button>
             <button className="text-[11px] sm:text-[12px] font-bold text-[var(--color-gray-40)] uppercase tracking-wider hover:text-[var(--color-ink)] pb-1 transition-colors" onClick={fetchPosts}>Discover</button>
          </div>
        </div>
      </div>

      {/* Feed Posts */}
      <div className="w-full flex flex-col">
        {loading ? (
          <div className="text-center py-10 text-[var(--color-gray-60)]">Loading feed...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-10 text-[var(--color-gray-60)]">No posts yet. Be the first to share!</div>
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
  );
}

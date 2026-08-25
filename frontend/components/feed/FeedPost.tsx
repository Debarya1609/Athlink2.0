'use client';

import React, { useState } from 'react';
import { CommentSection } from './CommentSection';
import api from '@/lib/api';

export type PostType = 'general' | 'announcement' | 'opportunity' | 'result';

interface FeedPostProps {
  id: string;
  name: string;
  avatar: string;
  roleBadge?: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  hasLiked?: boolean;
  postType?: PostType;
  onInteraction?: () => void;
}

export function FeedPost({ 
  id, 
  name, 
  avatar, 
  roleBadge = 'athlete', 
  timestamp, 
  content, 
  image, 
  likes, 
  comments, 
  hasLiked = false, 
  postType = 'general',
  onInteraction 
}: FeedPostProps) {
  const [isLiking, setIsLiking] = useState(false);

  const renderContent = (text: string) => {
    return text.split(' ').map((word, idx) => {
      if (word.startsWith('#')) {
        return <span key={idx} className="font-semibold text-[var(--color-ink)]">{word} </span>;
      }
      return word + ' ';
    });
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await api.post(`/feed/${id}/like`);
      if (onInteraction) onInteraction();
    } catch (err) {
      console.error('Failed to like post', err);
    } finally {
      setIsLiking(false);
    }
  };

  // Role Badge Styling
  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'academy' || r === 'organization') {
      return "bg-[image:var(--image-gold-shine)] text-[var(--color-ink)] border-none";
    }
    if (r === 'coach') {
      return "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]";
    }
    // Default / Athlete
    return "bg-[var(--color-ink)] text-[var(--color-white)] border-none";
  };

  // Post Type Chip Styling
  const renderPostTypeChip = () => {
    if (postType === 'general') return null;

    if (postType === 'announcement') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[image:var(--image-gold-shine)] text-[var(--color-ink)] text-[12px] font-bold uppercase tracking-wide">
          Announcement
        </span>
      );
    }
    if (postType === 'opportunity') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-transparent border border-[var(--color-ink)] text-[var(--color-ink)] text-[12px] font-bold uppercase tracking-wide">
          Opportunity
        </span>
      );
    }
    if (postType === 'result') {
      return (
        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-ink)] text-[var(--color-white)] text-[12px] font-bold uppercase tracking-wide">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 2.73 2.73 0 002.814 2.814 2.73 2.73 0 002.814-2.814 6.753 6.753 0 006.138-5.6.75.75 0 00-.584-.859 47.773 47.773 0 00-3.071-.543V2.62a.75.75 0 00-.65-.743 49.22 49.22 0 00-10.732 0 .75.75 0 00-.65.743zM4.02 5.234a49.856 49.856 0 012.833-.424 5.253 5.253 0 01-2.833 4.24zm13.127-4.24a49.856 49.856 0 00-2.833-.424 5.253 5.253 0 002.833 4.24zM10.5 15v3h3v-3h-3zm-1.5 4.5v1.5a.75.75 0 00.75.75h4.5a.75.75 0 00.75-.75V19.5h-6z" clipRule="evenodd" />
          </svg>
          Result
        </span>
      );
    }
    return null;
  };

  return (
    <div className="bg-[var(--color-white)] w-full transition-all duration-300">
      <div className="p-4 md:p-6 pb-2">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[var(--color-paper)] flex-shrink-0 flex items-center justify-center text-[var(--color-gray-60)] font-semibold overflow-hidden border border-[var(--color-gray-15)]">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{name.charAt(0)}</span>
              )}
            </div>
            <div className="flex flex-col -mt-0.5">
              <div className="flex items-center flex-wrap gap-2">
                <span className="font-display font-bold text-[var(--color-ink)] text-[16px] md:text-[18px] tracking-wide">{name}</span>
                {roleBadge && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${getRoleBadgeStyle(roleBadge)}`}>
                    {roleBadge}
                  </span>
                )}
                <span className="font-mono text-[11px] text-[var(--color-gray-60)]">· {timestamp}</span>
              </div>
            </div>
          </div>
          
          {postType !== 'general' && (
            <div className="ml-2 flex-shrink-0">
              {renderPostTypeChip()}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="ml-[52px] md:ml-[56px] mb-3">
          <div className="text-[var(--color-ink)] text-[15px] leading-relaxed font-normal whitespace-pre-wrap">
            <p>{renderContent(content)}</p>
          </div>
          
          {image && (
            <div className="mt-3 rounded-lg overflow-hidden border border-[var(--color-gray-15)] relative">
              <img src={image} alt="Post content" className="w-full max-h-[500px] object-contain bg-[var(--color-paper)]" />
            </div>
          )}

          {/* Actions (Threads style: icon only, mono counts) */}
          <div className="flex items-center gap-6 mt-4 pb-2">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 text-[14px] transition-colors group ${hasLiked ? 'text-[var(--color-ink)]' : 'text-[var(--color-gray-60)] hover:text-[var(--color-ink)]'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={hasLiked ? "currentColor" : "none"} strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
              {likes > 0 && <span className="font-mono text-[12px]">{likes}</span>}
            </button>

            <button className="flex items-center gap-1.5 text-[14px] text-[var(--color-gray-60)] hover:text-[var(--color-ink)] transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z" />
              </svg>
              {comments > 0 && <span className="font-mono text-[12px]">{comments}</span>}
            </button>

            <button className="flex items-center gap-1.5 text-[14px] text-[var(--color-gray-60)] hover:text-[var(--color-ink)] transition-colors group">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
              </svg>
            </button>

            <button className="flex items-center gap-1.5 text-[14px] text-[var(--color-gray-60)] hover:text-[var(--color-ink)] transition-colors group ml-auto">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12Zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      <div className="lane-line"></div>
      
      {/* 
        CommentSection is currently unchanged below the lane line.
        In a full Phase 2 rebuild, it would likely render inline or on a detail view.
      */}
      {/* <CommentSection postId={id} onCommentAdded={onInteraction} /> */}

    </div>
  );
}

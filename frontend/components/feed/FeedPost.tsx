import React from 'react';
import { CommentSection } from './CommentSection';

interface FeedPostProps {
  name: string;
  avatar: string;
  roleBadge?: string;
  timestamp: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
}

export function FeedPost({ name, avatar, roleBadge, timestamp, content, image, likes, comments }: FeedPostProps) {
  // Parsing content to highlight hashtags in blue
  const renderContent = (text: string) => {
    return text.split(' ').map((word, idx) => {
      if (word.startsWith('#')) {
        return <span key={idx} className="text-theme-cerulean">{word} </span>;
      }
      return word + ' ';
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow duration-300 border border-transparent">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center text-theme-charcoal font-semibold overflow-hidden border border-theme-border">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl">S</span> // hardcoded for the mockup
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-theme-charcoal text-[16px]">{name}</span>
              {roleBadge && (
                <span className="bg-theme-teal text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {roleBadge}
                </span>
              )}
            </div>
            <div className="text-[13px] text-theme-slate font-medium">{timestamp}</div>
          </div>
        </div>
        
        {/* Top Right Bell Icon */}
        <div className="relative cursor-pointer w-10 h-10 rounded-full bg-[#FFEAE6] flex items-center justify-center text-[#FF6B6B]">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
          </svg>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-theme-coral rounded-full text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
            1
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 text-theme-charcoal text-[16px] leading-relaxed font-normal">
        <p>{renderContent(content)}</p>
        {image && (
          <div className="mt-4 rounded-xl overflow-hidden shadow-sm relative group cursor-pointer">
            <img src={image} alt="Post content" className="w-full h-[300px] object-cover" />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors flex items-center justify-center">
               <div className="w-14 h-14 bg-black/50 rounded-full flex items-center justify-center text-white backdrop-blur-sm">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 ml-1">
                   <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                 </svg>
               </div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 py-2">
        <button className="flex items-center gap-1.5 text-[14px] font-medium text-theme-slate hover:text-theme-cerulean transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
          Like
        </button>
        <button className="flex items-center gap-1.5 text-[14px] font-medium text-theme-slate hover:text-theme-cerulean transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Comment
        </button>
        <button className="flex items-center gap-1.5 text-[14px] font-medium text-theme-slate hover:text-theme-cerulean transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
          </svg>
          Repost
        </button>
        <button className="flex items-center gap-1.5 text-[14px] font-medium text-theme-slate hover:text-theme-cerulean transition-colors ml-auto">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
          </svg>
          Share
        </button>
      </div>

      {/* Bottom Congratulate Action Box */}
      <div className="mt-4 border-t border-theme-border pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#F0F2F5] overflow-hidden">
             <img src="https://i.pravatar.cc/150?img=5" alt="Sarah" className="w-full h-full object-cover" />
          </div>
          <span className="text-[14px] font-semibold text-theme-charcoal">Sarah post</span>
        </div>
        <button className="text-theme-teal text-[13px] font-semibold px-4 py-1.5 rounded-full border border-theme-teal hover:bg-theme-teal hover:text-white transition-colors">
          Congratulate
        </button>
      </div>

    </div>
  );
}

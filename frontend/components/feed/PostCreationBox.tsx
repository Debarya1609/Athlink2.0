"use client";

import React, { useState } from 'react';

export function PostCreationBox() {
  const [content, setContent] = useState('');
  const maxLength = 500;

  return (
    <div className="bg-white rounded-2xl p-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
      <div className="flex gap-4 mb-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center text-theme-charcoal font-semibold border border-theme-border">
          A
        </div>
        
        {/* Input Area */}
        <div className="flex-grow">
          <div className="w-full bg-[#F8FAFC] border border-theme-border rounded-2xl p-4 transition-all focus-within:ring-2 focus-within:ring-theme-cobalt focus-within:border-theme-cobalt">
            <textarea 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-transparent border-none text-theme-charcoal placeholder-theme-slate focus:ring-0 focus:outline-none resize-none text-[15px] leading-relaxed min-h-[60px]"
              placeholder="What's on your mind?"
              rows={2}
            ></textarea>
          </div>
        </div>
      </div>
      
      {/* Toolbar and Footer */}
      <div className="flex items-center justify-between ml-16">
        
        {/* Formatting Tools */}
        <div className="flex items-center gap-1">
          <button className="p-2 text-theme-charcoal hover:bg-[#F0F2F5] hover:text-theme-cobalt rounded-lg transition-colors group" title="Upload Image">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
          <button className="p-2 text-theme-charcoal hover:bg-[#F0F2F5] hover:text-theme-cobalt rounded-lg transition-colors group" title="Attach Video">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </button>
          <button className="p-2 text-theme-charcoal hover:bg-[#F0F2F5] hover:text-theme-cobalt rounded-lg transition-colors group" title="Attach File">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
            </svg>
          </button>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4">
          <button 
            disabled={content.length === 0 || content.length > maxLength}
            className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
              content.length > 0 && content.length <= maxLength
                ? 'bg-theme-cobalt text-white hover:bg-[#254ED6] hover:shadow-md cursor-pointer'
                : 'bg-[#E2E8F0] text-[#475569] cursor-not-allowed'
            }`}
          >
            Post
          </button>
        </div>
        
      </div>
    </div>
  );
}

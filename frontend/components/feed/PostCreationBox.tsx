"use client";

import React, { useState, useRef } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';

interface PostCreationBoxProps {
  onPostCreated?: () => void;
}

export function PostCreationBox({ onPostCreated }: PostCreationBoxProps) {
  const { currentUser } = useAuth();
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 500;

  const handlePost = async () => {
    if (!content && !file) return;
    setIsSubmitting(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // 1. Upload media if present
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const { data: mediaData } = await api.post('/media/upload?folder=posts', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        mediaUrl = mediaData.data.url;
        mediaType = mediaData.data.media_type;
      }

      // 2. Create post
      await api.post('/feed', {
        content: content || null,
        media_url: mediaUrl,
        media_type: mediaType
      });

      setContent('');
      setFile(null);
      if (onPostCreated) onPostCreated();
    } catch (err) {
      console.error('Failed to create post', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 mb-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
      <div className="flex gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-[#F0F2F5] flex-shrink-0 flex items-center justify-center text-theme-charcoal font-semibold border border-theme-border overflow-hidden">
          {currentUser?.photo_url ? (
            <img src={currentUser.photo_url} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            currentUser?.name ? currentUser.name.charAt(0) : 'A'
          )}
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
            {file && (
              <div className="mt-2 flex items-center gap-2 bg-white p-2 rounded border border-gray-200">
                <span className="text-sm text-theme-slate truncate max-w-[200px]">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-red-500 hover:text-red-700 font-bold ml-auto px-2">×</button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Toolbar and Footer */}
      <div className="flex items-center justify-between ml-16">
        
        {/* Formatting Tools */}
        <div className="flex items-center gap-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,video/*"
          />
          <button onClick={handleFileClick} className="p-2 text-theme-charcoal hover:bg-[#F0F2F5] hover:text-theme-cobalt rounded-lg transition-colors group" title="Upload Image or Video">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 transition-transform">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </button>
        </div>

        {/* Post Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePost}
            disabled={isSubmitting || (!content && !file) || content.length > maxLength}
            className={`px-8 py-2.5 rounded-full font-semibold transition-all duration-300 ${
              (!isSubmitting && (content || file) && content.length <= maxLength)
                ? 'bg-theme-cobalt text-white hover:bg-[#254ED6] hover:shadow-md cursor-pointer'
                : 'bg-[#E2E8F0] text-[#475569] cursor-not-allowed'
            }`}
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
        
      </div>
    </div>
  );
}

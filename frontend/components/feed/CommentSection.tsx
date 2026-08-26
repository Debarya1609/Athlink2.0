"use client";

import React, { useState, useEffect, useCallback } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/lib/AuthContext';
import { useSocket } from '@/lib/SocketContext';

interface CommentType {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
}

interface CommentSectionProps {
  postId: string;
  startExpanded?: boolean;
  onCommentAdded?: () => void;
}

export function CommentSection({ postId, startExpanded = true, onCommentAdded }: CommentSectionProps) {
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const [expanded, setExpanded] = useState(startExpanded);
  const [comments, setComments] = useState<CommentType[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputText, setInputText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<{ comments: CommentType[] }>(`/feed/${postId}/comments`);
      setComments(data.comments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (expanded) {
      fetchComments();
    }
  }, [expanded, fetchComments]);

  useEffect(() => {
    if (!socket || !expanded) return;

    const handleInteraction = (data: any) => {
      if (data.postId === postId) {
        if (data.type === 'comment' && data.comment) {
          // Check if we already have it to avoid duplicates
          setComments(prev => {
            if (prev.some(c => c.id === data.comment.id)) return prev;
            fetchComments();
            return prev;
          });
        } else if (data.type === 'delete_comment' && data.commentId) {
          setComments(prev => prev.filter(c => c.id !== data.commentId));
        }
      }
    };

    socket.on('post_interaction', handleInteraction);
    return () => {
      socket.off('post_interaction', handleInteraction);
    };
  }, [socket, expanded, postId, fetchComments]);

  const handlePostComment = async () => {
    if (!inputText.trim() || posting) return;
    setPosting(true);
    try {
      await api.post(`/feed/${postId}/comment`, { content: inputText });
      setInputText('');
      // We rely on the socket event to refetch, or we can fetch immediately
      await fetchComments();
      if (onCommentAdded) onCommentAdded();
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/feed/comment/${commentId}`);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Failed to delete comment', err);
    }
  };

  if (!expanded) {
    return (
      <button 
        onClick={() => setExpanded(true)}
        className="text-[13px] font-semibold text-theme-slate hover:text-theme-cerulean transition-colors py-2 mt-2"
      >
        View comments
      </button>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-theme-border">
      
      {/* Comment Input */}
      <div className="flex gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
          {currentUser?.photo_url ? (
            <img src={currentUser.photo_url} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            currentUser?.name.charAt(0) || 'U'
          )}
        </div>
        <div className="flex-1 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Write a comment..." 
            className="flex-1 bg-[#F0F2F5] text-sm px-4 py-2 rounded-full outline-none focus:ring-1 focus:ring-theme-border text-theme-charcoal"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handlePostComment();
            }}
          />
          <button 
            onClick={handlePostComment}
            disabled={!inputText.trim() || posting}
            className="text-theme-cobalt font-bold text-[13px] px-3 disabled:opacity-50"
          >
            Post
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center text-sm text-theme-slate py-4">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-center text-sm text-theme-slate py-4">No comments yet.</div>
      ) : (
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-500 overflow-hidden">
                {comment.user?.photo_url ? (
                  <img src={comment.user.photo_url} alt={comment.user.name} className="w-full h-full object-cover" />
                ) : (
                  comment.user?.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="bg-[#F8FAFC] rounded-xl p-3 flex-grow border border-theme-border/50 group relative">
                <div className="flex items-baseline justify-between mb-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-[13px] text-theme-charcoal">{comment.user?.name || 'Unknown'}</span>
                    <span className="text-[11px] text-theme-slate font-medium">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {/* Delete Button for Commenter */}
                  {currentUser?.id === comment.user_id && (
                    <button 
                      onClick={() => handleDeleteComment(comment.id)}
                      className="hidden group-hover:block text-[10px] text-red-500 hover:underline uppercase tracking-wide"
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-theme-charcoal mt-0.5 whitespace-pre-wrap">{comment.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <button 
        onClick={() => setExpanded(false)}
        className="text-[13px] font-semibold text-theme-slate hover:text-theme-charcoal transition-colors mt-4 inline-block"
      >
        Hide comments
      </button>
    </div>
  );
}

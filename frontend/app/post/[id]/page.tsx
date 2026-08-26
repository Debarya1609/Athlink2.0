'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FeedPost } from '@/components/feed/FeedPost';
import { CommentSection } from '@/components/feed/CommentSection';
import api from '@/lib/api';

export default function PostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/feed/post/${params.id}`);
        setPost(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-ink)]"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-ink)]">
        <h2 className="font-display text-2xl font-bold">Post not found</h2>
        <button onClick={() => router.back()} className="mt-4 underline">Go back</button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-[var(--color-white)] min-h-screen border-x border-[var(--color-gray-15)]">
      <div className="flex items-center px-4 py-3 border-b border-[var(--color-gray-15)] sticky top-0 bg-[var(--color-white)] z-10">
        <button onClick={() => router.back()} className="mr-4 text-[var(--color-ink)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl text-[var(--color-ink)] tracking-wide">Post</h1>
      </div>

      <FeedPost 
        id={post.id}
        authorId={post.author?.id || post.user?.id || ''}
        name={post.author?.name || post.user?.name || 'Unknown'}
        avatar={post.author?.photo_url || post.user?.photo_url || ''}
        roleBadge={post.author?.role || post.user?.role || 'User'}
        timestamp={new Date(post.created_at).toLocaleDateString()}
        content={post.content}
        image={post.media_url || undefined}
        likes={post.stats?.likes_count || 0}
        comments={post.stats?.comments_count || 0}
        hasLiked={post.stats?.liked_by_me}
        isDetailView={true}
      />

      <div className="px-6 pb-6 border-t border-[var(--color-gray-15)] pt-6">
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
}

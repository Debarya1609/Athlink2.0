'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState, use } from 'react';
import { FeedPost } from '@/components/feed/FeedPost';
import { CommentSection } from '@/components/feed/CommentSection';
import api from '@/lib/api';

export default function PostModal({ params }: { params: any }) {
  const unwrappedParams = use(params as any) as { id: string };
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const onDismiss = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { data } = await api.get(`/feed/post/${unwrappedParams.id}`);
        setPost(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [unwrappedParams.id]);

  if (loading) return null; // Or a spinner
  if (!post) return null; // Or 404

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 sm:p-6" onClick={onDismiss}>
      <div 
        className="w-full max-w-2xl bg-[var(--color-white)] max-h-full overflow-y-auto rounded-xl shadow-2xl relative"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button 
          onClick={onDismiss}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-[var(--color-paper)] text-[var(--color-ink)] hover:bg-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* We disable the Link wrapping inside the modal by passing a prop, or we just render it. 
            FeedPost currently wraps in a Link. Clicking it inside the modal would route to the page again.
            We need to add a "disableLink" prop to FeedPost or just let it route. 
            Let's add disableLink to FeedPost in a moment. */}
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
          isDetailView={true} // We will add this prop to hide the Link wrapper
        />

        <div className="px-6 pb-6">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}

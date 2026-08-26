import { Post } from '@/types';
import { FeedPost } from '../feed/FeedPost';

interface ProfileFeedProps {
  posts: Post[];
  onInteraction?: () => void;
}

export default function ProfileFeed({ posts, onInteraction }: ProfileFeedProps) {
  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center">
        <p className="text-[#64748B]">No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6 mt-4">
      <h2 className="text-lg font-bold text-[#334155] px-2">Recent Posts</h2>
      
      <div className="flex flex-col gap-4 sm:gap-6">
        {posts.map((post) => (
          <FeedPost 
            key={post.id}
            id={post.id}
            authorId={(post as any).author?.id || post.user?.id || ''}
            name={(post as any).author?.name || post.user?.name || 'Unknown'}
            avatar={post.user?.photo_url || ''}
            roleBadge={post.user?.role}
            timestamp={new Date(post.created_at).toLocaleDateString()}
            content={post.content || ''}
            image={post.media_url || undefined}
            likes={post.likes_count}
            comments={post.comments_count}
            hasLiked={post.liked_by_me}
            onInteraction={onInteraction}
          />
        ))}
      </div>
    </div>
  );
}

import { Post } from '@/types';

interface ProfileFeedProps {
  posts: Post[];
}

export default function ProfileFeed({ posts }: ProfileFeedProps) {
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
          <div key={post.id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0 border border-[#E2E8F0]">
                {post.user.photo_url ? (
                  <img src={post.user.photo_url} alt={post.user.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-[#64748B]">{post.user.name.charAt(0)}</span>
                )}
              </div>
              <div>
                <div className="font-bold text-[#334155] text-sm">{post.user.name}</div>
                <div className="text-xs text-[#64748B]">
                  {new Date(post.created_at).toLocaleDateString(undefined, {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </div>
              </div>
            </div>
            
            {post.content && (
              <p className="text-[#334155] text-sm leading-relaxed mb-4">
                {post.content}
              </p>
            )}
            
            <div className="flex items-center gap-6 text-[#64748B]">
              <button className={`flex items-center gap-2 text-sm transition-colors h-11 min-w-[44px] ${post.liked_by_me ? 'text-[#2E5BFF]' : 'hover:text-[#2E5BFF]'}`}>
                <svg className="w-5 h-5" fill={post.liked_by_me ? "#2E5BFF" : "none"} stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                <span>{post.likes_count}</span>
              </button>
              <button className="flex items-center gap-2 text-sm hover:text-[#2E5BFF] transition-colors h-11 min-w-[44px]">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                <span>{post.comments_count}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

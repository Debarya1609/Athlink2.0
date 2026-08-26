'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { FeedPost } from '../feed/FeedPost';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
  profile: {
    id: string;
    photo_url: string | null;
    bio: string | null;
    city: string | null;
    state: string | null;
    sport: string | null;
    position: string | null;
    age: number | null;
    available_for_trials: boolean;
    height: string | null;
    weight: string | null;
    experience_years: number | null;
    certifications: string | null;
    open_to_opportunities: boolean;
    academy_type: string | null;
    established_year: number | null;
    website_url: string | null;
    member_count: number | null;
  };
  stats: {
    followers_count: number;
    following_count: number;
  };
}

export function ProfileView({ userId }: { userId: string }) {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'results' | 'about'>('posts');
  const [isFollowing, setIsFollowing] = useState(false); 

  const isOwnProfile = currentUser?.id === userId;

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const [profileRes, postsRes] = await Promise.all([
        api.get(`/profiles/${userId}`),
        api.get(`/feed/user/${userId}`)
      ]);
      setProfileData(profileRes.data.data);
      setPosts(postsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      void fetchProfile();
    }
  }, [userId, fetchProfile]);

  const handleFollowToggle = async () => {
    if (!profileData) return;
    try {
      if (isFollowing) {
        await api.delete(`/profiles/${userId}/follow`);
        setProfileData({
          ...profileData,
          stats: { ...profileData.stats, followers_count: profileData.stats.followers_count - 1 }
        });
      } else {
        await api.post(`/profiles/${userId}/follow`);
        setProfileData({
          ...profileData,
          stats: { ...profileData.stats, followers_count: profileData.stats.followers_count + 1 }
        });
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Failed to toggle follow', err);
    }
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'academy' || r === 'organization') {
      return "bg-[image:var(--image-gold-shine)] text-[var(--color-ink)] border-none";
    }
    if (r === 'coach') {
      return "bg-transparent text-[var(--color-ink)] border border-[var(--color-ink)]";
    }
    return "bg-[var(--color-ink)] text-[var(--color-white)] border-none";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-ink)]"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[var(--color-ink)]">
        <h2 className="font-display text-2xl font-bold">Profile not found</h2>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--color-white)] min-h-screen">
      {/* Top Header */}
      <div className="flex items-center px-4 py-3 border-b border-[var(--color-gray-15)]">
        <button onClick={() => router.back()} className="mr-4 text-[var(--color-ink)]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="font-display font-bold text-xl text-[var(--color-ink)] tracking-wide">Profile</h1>
      </div>

      {/* Main Profile Info */}
      <div className="px-4 py-6 md:px-6">
        <div className="flex flex-col md:flex-row gap-6 md:items-start justify-between">
          
          {/* Avatar and Basic Info */}
          <div className="flex gap-4 items-start">
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full border border-[var(--color-gray-15)] bg-[var(--color-paper)] overflow-hidden flex-shrink-0 flex items-center justify-center font-display text-3xl text-[var(--color-gray-40)]">
              {profileData.profile.photo_url ? (
                <img src={profileData.profile.photo_url} alt={profileData.user.name} className="w-full h-full object-cover" />
              ) : (
                profileData.user.name.charAt(0).toUpperCase()
              )}
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-extrabold text-2xl md:text-3xl text-[var(--color-ink)] uppercase tracking-wide">
                  {profileData.user.name}
                </h1>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest ${getRoleBadgeStyle(profileData.user.role)}`}>
                  {profileData.user.role}
                </span>
              </div>
              <div className="font-mono text-[13px] text-[var(--color-gray-60)] mt-1">
                @{profileData.user.email.split('@')[0]} 
                {(profileData.profile.city || profileData.profile.state) && (
                  <span className="ml-2">· {profileData.profile.city}{profileData.profile.state ? `, ${profileData.profile.state}` : ''}</span>
                )}
              </div>

              {/* Follow Stats */}
              <div className="flex gap-4 mt-3">
                <div className="text-[13px] text-[var(--color-gray-60)]"><span className="font-mono text-[var(--color-ink)] font-bold">{profileData.stats.followers_count}</span> followers</div>
                <div className="text-[13px] text-[var(--color-gray-60)]"><span className="font-mono text-[var(--color-ink)] font-bold">{profileData.stats.following_count}</span> following</div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex-shrink-0 mt-2 md:mt-0">
            {isOwnProfile ? (
              <button 
                onClick={() => alert("Edit Profile Coming Soon")}
                className="w-full md:w-auto px-6 py-2 border border-[var(--color-gray-15)] text-[var(--color-ink)] text-sm font-semibold hover:bg-[var(--color-paper)] transition-colors"
              >
                Edit Profile
              </button>
            ) : (
              <button 
                onClick={handleFollowToggle}
                className={`w-full md:w-auto px-8 py-2 text-sm font-bold transition-all duration-200 ${
                  isFollowing 
                    ? 'bg-transparent text-[var(--color-ink)] border border-[var(--color-gray-15)] hover:bg-[var(--color-paper)]' 
                    : 'bg-[var(--color-ink)] text-[var(--color-white)]'
                }`}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
          </div>
        </div>

        {/* Bio & Highlights Grid */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bio */}
          <div>
            <h3 className="text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-2">Bio</h3>
            <p className="text-[14px] text-[var(--color-ink)] leading-relaxed">
              {profileData.profile.bio || "No bio provided yet."}
            </p>
          </div>
          
          {/* Highlights */}
          <div className="flex flex-col gap-2 border-l border-[var(--color-gray-15)] pl-6">
            <h3 className="text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-1">Highlights</h3>
            
            {profileData.profile.sport && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]"></div>
                <span className="text-[13px] text-[var(--color-gray-60)] font-mono uppercase">Sport:</span>
                <span className="text-[13px] text-[var(--color-ink)] font-medium">{profileData.profile.sport}</span>
              </div>
            )}
            
            {profileData.profile.position && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-ink)]"></div>
                <span className="text-[13px] text-[var(--color-gray-60)] font-mono uppercase">Role/Pos:</span>
                <span className="text-[13px] text-[var(--color-ink)] font-medium">{profileData.profile.position}</span>
              </div>
            )}

            {profileData.profile.experience_years && (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[image:var(--image-gold-shine)]"></div>
                <span className="text-[13px] text-[var(--color-gray-60)] font-mono uppercase">Experience:</span>
                <span className="text-[13px] text-[var(--color-ink)] font-medium">{profileData.profile.experience_years} Years</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-gray-15)]">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-widest transition-colors relative ${
            activeTab === 'posts' ? 'text-[var(--color-ink)]' : 'text-[var(--color-gray-40)] hover:text-[var(--color-gray-60)]'
          }`}
        >
          Posts
          {activeTab === 'posts' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[image:var(--image-gold-shine)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('results')}
          className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-widest transition-colors relative ${
            activeTab === 'results' ? 'text-[var(--color-ink)]' : 'text-[var(--color-gray-40)] hover:text-[var(--color-gray-60)]'
          }`}
        >
          Results
          {activeTab === 'results' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[image:var(--image-gold-shine)]" />}
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`flex-1 py-3 text-[13px] font-bold uppercase tracking-widest transition-colors relative ${
            activeTab === 'about' ? 'text-[var(--color-ink)]' : 'text-[var(--color-gray-40)] hover:text-[var(--color-gray-60)]'
          }`}
        >
          About
          {activeTab === 'about' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[image:var(--image-gold-shine)]" />}
        </button>
      </div>

      <div className="lane-line"></div>

      {/* Tab Content */}
      <div className="w-full flex flex-col">
        {activeTab === 'posts' && (
          <>
            {posts.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-gray-40)]">
                <span className="font-mono text-sm">No posts yet.</span>
              </div>
            ) : (
              posts.map(post => (
                <FeedPost 
                  key={post.id}
                  id={post.id}
                  authorId={post.author?.id || ''}
                  name={post.author?.name || 'Unknown'}
                  avatar={post.author?.photo_url || ''}
                  roleBadge={post.author?.role || 'User'}
                  timestamp={new Date(post.created_at).toLocaleDateString()}
                  content={post.content}
                  image={post.media_url || undefined}
                  likes={post.stats.likes_count}
                  comments={post.stats.comments_count}
                  hasLiked={post.stats.liked_by_me}
                  postType="general" 
                  onInteraction={fetchProfile}
                />
              ))
            )}
          </>
        )}

        {activeTab === 'results' && (
          <div className="text-center py-12 text-[var(--color-gray-40)]">
            <span className="font-mono text-sm">No structured results posted.</span>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="p-6">
            <div className="space-y-6 max-w-lg">
              <div>
                <h4 className="text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-1">Physical Attributes</h4>
                <p className="text-[14px] text-[var(--color-ink)]">
                  {profileData.profile.height ? `${profileData.profile.height} / ` : ''}
                  {profileData.profile.weight ? profileData.profile.weight : ''}
                  {!profileData.profile.height && !profileData.profile.weight && 'Not specified'}
                </p>
              </div>
              
              <div>
                <h4 className="text-[11px] font-bold text-[var(--color-gray-40)] uppercase tracking-widest mb-1">Account Joined</h4>
                <p className="text-[14px] text-[var(--color-ink)]">
                  {new Date(profileData.user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

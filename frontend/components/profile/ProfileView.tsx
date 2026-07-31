'use client';

import React, { useEffect, useState, useCallback } from 'react';
import api from '@/lib/api';
import { FeedPost } from '../feed/FeedPost';
import { useAuth } from '@/lib/AuthContext';

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

interface FeedItem {
  id: string;
  content: string;
  media_url: string | null;
  media_type: string | null;
  created_at: string;
  author: {
    id: string;
    name: string;
    role: string;
    photo_url: string | null;
  };
  stats: {
    likes_count: number;
    comments_count: number;
    liked_by_me: boolean;
  };
}

export function ProfileView({ userId }: { userId: string }) {
  const { currentUser } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [posts, setPosts] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'posts' | 'media' | 'about'>('posts');
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-theme-cobalt"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-2xl font-bold text-gray-500">Profile not found</h2>
        <p className="text-gray-400 mt-2">The user you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto w-full pb-12 animate-fade-in">
      {/* Banner & Header Section */}
      <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent overflow-hidden mb-6">
        {/* Dynamic Cover Photo (Gradient based on role) */}
        <div className={`h-48 md:h-64 w-full relative ${
          profileData.user.role === 'athlete' ? 'bg-gradient-to-r from-theme-cobalt via-blue-500 to-cyan-400' :
          profileData.user.role === 'scout' ? 'bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-500' :
          'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400'
        }`}>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        
        <div className="px-6 md:px-10 pb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between -mt-16 md:-mt-24 mb-6 gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 z-10">
              {/* Avatar */}
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-gray-100 shadow-md overflow-hidden flex-shrink-0">
                {profileData.profile.photo_url ? (
                  <img src={profileData.profile.photo_url} alt={profileData.user.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 text-5xl font-bold">
                    {profileData.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="text-center md:text-left pb-2">
                <h1 className="text-3xl font-extrabold text-theme-charcoal">{profileData.user.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-3 mt-2">
                  <span className="px-3 py-1 bg-blue-50 text-theme-cobalt text-xs font-bold uppercase tracking-wider rounded-full border border-blue-100">
                    {profileData.user.role}
                  </span>
                  {(profileData.profile.city || profileData.profile.state) && (
                    <span className="text-sm text-gray-500 font-medium flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                      </svg>
                      {profileData.profile.city}{profileData.profile.city && profileData.profile.state ? ', ' : ''}{profileData.profile.state}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-end gap-3 pb-2 z-10">
              {isOwnProfile ? (
                <button 
                  onClick={() => alert("Edit Profile Modal Coming Soon")}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-theme-charcoal text-sm font-semibold rounded-full transition-colors"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    onClick={handleFollowToggle}
                    className={`px-8 py-2.5 text-sm font-bold rounded-full transition-all duration-300 ${
                      isFollowing 
                        ? 'bg-gray-100 text-theme-charcoal border border-gray-200 hover:bg-gray-200' 
                        : 'bg-theme-cobalt text-white shadow-md hover:bg-blue-700 hover:shadow-lg'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  <button className="p-2.5 bg-gray-100 hover:bg-gray-200 text-theme-charcoal rounded-full transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Stats & Bio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-gray-100 pt-6">
            <div className="md:col-span-2">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">About</h3>
              <p className="text-gray-700 text-[15px] leading-relaxed">
                {profileData.profile.bio || "No bio provided yet."}
              </p>
            </div>
            <div className="flex gap-8 justify-start md:justify-end">
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-theme-charcoal">{profileData.stats.followers_count}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Followers</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-theme-charcoal">{profileData.stats.following_count}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Following</span>
              </div>
              <div className="flex flex-col items-center md:items-start">
                <span className="text-2xl font-bold text-theme-charcoal">{posts.length}</span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Posts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('posts')}
          className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'posts' ? 'border-theme-cobalt text-theme-cobalt' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Posts
        </button>
        <button 
          onClick={() => setActiveTab('media')}
          className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'media' ? 'border-theme-cobalt text-theme-cobalt' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Media
        </button>
        <button 
          onClick={() => setActiveTab('about')}
          className={`px-6 py-4 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'about' ? 'border-theme-cobalt text-theme-cobalt' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Details
        </button>
      </div>

      {/* Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'posts' && (
            <>
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-800">No Posts Yet</h3>
                  <p className="text-gray-500 mt-1">{isOwnProfile ? "You haven't posted anything." : "This user hasn't posted anything."}</p>
                </div>
              ) : (
                posts.map(post => (
                  <FeedPost 
                    key={post.id}
                    id={post.id}
                    name={post.author?.name || 'Unknown'}
                    avatar={post.author?.photo_url || ''}
                    roleBadge={post.author?.role || 'User'}
                    timestamp={new Date(post.created_at).toLocaleDateString()}
                    content={post.content}
                    image={post.media_url || undefined}
                    likes={post.stats.likes_count}
                    comments={post.stats.comments_count}
                    hasLiked={post.stats.liked_by_me}
                    onInteraction={fetchProfile}
                  />
                ))
              )}
            </>
          )}

          {activeTab === 'media' && (
            <div className="bg-white rounded-2xl p-10 text-center shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
              <p className="text-gray-500">Media gallery coming soon.</p>
            </div>
          )}

          {activeTab === 'about' && (
            <div className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent space-y-6">
              <h3 className="text-lg font-bold text-theme-charcoal mb-4">Complete Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Sport</label>
                  <p className="text-[15px] font-medium text-gray-800">{profileData.profile.sport || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Position / Speciality</label>
                  <p className="text-[15px] font-medium text-gray-800">{profileData.profile.position || 'Not specified'}</p>
                </div>
                {profileData.user.role === 'athlete' && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Age</label>
                      <p className="text-[15px] font-medium text-gray-800">{profileData.profile.age ? `${profileData.profile.age} years old` : 'Not specified'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Physical</label>
                      <p className="text-[15px] font-medium text-gray-800">
                        {profileData.profile.height ? `${profileData.profile.height} / ` : ''}
                        {profileData.profile.weight ? profileData.profile.weight : ''}
                        {!profileData.profile.height && !profileData.profile.weight && 'Not specified'}
                      </p>
                    </div>
                  </>
                )}
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Experience</label>
                  <p className="text-[15px] font-medium text-gray-800">{profileData.profile.experience_years !== null ? `${profileData.profile.experience_years} years` : 'Not specified'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Side Widgets) */}
        <div className="hidden lg:flex flex-col gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-transparent">
            <h3 className="text-[15px] font-bold text-theme-charcoal mb-4">Quick Info</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 text-theme-cobalt flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Location</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {(profileData.profile.city || profileData.profile.state) ? 
                      `${profileData.profile.city || ''}${profileData.profile.city && profileData.profile.state ? ', ' : ''}${profileData.profile.state || ''}` : 
                      'Not specified'}
                  </p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium">Joined</p>
                  <p className="text-sm font-semibold text-gray-800">{new Date(profileData.user.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

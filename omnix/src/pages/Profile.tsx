import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { uploadMedia } from '../lib/storage';
import { useAuthStore } from '../store/authStore';
import { 
  Loader2, MapPin, Link as LinkIcon, Calendar, Edit3, Settings as SettingsIcon, 
  Share2, MoreHorizontal, UserMinus, UserPlus, Image as ImageIcon, ShieldAlert, Flag, X,
  Film, Bookmark, Video, CheckCircle, XCircle, Users, Tag, Heart, Eye, Crown, Lock, ShoppingBag, Mail, Briefcase, BadgeCheck, CheckCircle2, Circle,
  Coins, ArrowRight
} from 'lucide-react';
import PostCard from '../components/PostCard';
import ReportModal from '../components/ReportModal';
import ImageCropper from '../components/ImageCropper';
import ImageViewer from '../components/ImageViewer';
import { parseProfileBio, serializeProfileBio } from '../lib/username';
import { useWalletStore } from '../store/walletStore';

import StoryHighlights from '../components/story/StoryHighlights';

type TabType = 'posts' | 'omniclips' | 'stories' | 'saved' | 'communities' | 'tagged' | 'liked' | 'exclusive' | 'shop';

export default function Profile() {
  const { username: routeUsername } = useParams<{ username: string }>();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [copiedUsername, setCopiedUsername] = useState(false);
  const [viewerImage, setViewerImage] = useState<string | null>(null);

  const { wallet, fetchWalletData } = useWalletStore();

  // Queries
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery<any>({
    queryKey: ['profile', routeUsername || 'own'],
    queryFn: async () => {
      let targetUserId = user?.id;
      let targetProfile = null;

      if (routeUsername) {
        const { data: userProfile, error } = await supabase
          .from('profiles')
          .select('*')
          .ilike('username', routeUsername)
          .single();
          
        if (error || !userProfile) {
          // Look up redirects in all profiles
          const { data: allProfiles } = await supabase
            .from('profiles')
            .select('*');
            
          if (allProfiles) {
            for (const p of allProfiles) {
              const parsed = parseProfileBio(p.bio);
              if (parsed.redirects && parsed.redirects[routeUsername.toLowerCase()]) {
                const rule = parsed.redirects[routeUsername.toLowerCase()];
                if (new Date(rule.expires_at) > new Date()) {
                  // Redirect found! Return the profile with special redirection indicator
                  return { ...p, __redirectedTo: rule.new_username };
                }
              }
            }
          }
          throw new Error("Profile not found");
        }
        targetProfile = userProfile;
        targetUserId = userProfile.id;
      } else {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (!authUser) throw new Error("No authenticated user");
        targetUserId = authUser.id;
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (error) {
          if (error.code === 'PGRST116') {
            const username = authUser.user_metadata?.username || authUser.email?.split('@')[0] || `user_${Math.random().toString(36).substr(2, 5)}`;
            const display_name = authUser.user_metadata?.full_name || authUser.user_metadata?.display_name || authUser.email?.split('@')[0] || 'User';
            
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                username,
                display_name,
                avatar_url: authUser.user_metadata?.avatar_url || '',
                cover_url: authUser.user_metadata?.cover_url || '',
                bio: authUser.user_metadata?.bio || '',
                is_verified: false
              })
              .select('*')
              .single();
              
            if (createError) throw createError;
            targetProfile = newProfile;
          } else {
            throw error;
          }
        } else {
          targetProfile = data;
        }
      }
      return targetProfile;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['profile-stats', profile?.id],
    queryFn: async () => {
      if (!user) return { posts: 0, followers: 0, following: 0 };
      
      if (!profile?.id) return { posts: 0, followers: 0, following: 0 };
      const [postsCount, followersCount, followingCount] = await Promise.all([
        supabase.from('posts').select('id', { count: 'exact', head: true }).eq('user_id', profile.id),
        supabase.from('followers').select('follower_id', { count: 'exact', head: true }).eq('following_id', profile.id),
        supabase.from('followers').select('following_id', { count: 'exact', head: true }).eq('follower_id', profile.id),
      ]);
      
      return {
        posts: postsCount.count || 0,
        followers: followersCount.count || 0,
        following: followingCount.count || 0
      };
    }
  });

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (user && profile && user.id !== profile.id) {
      supabase.from('creator_subscriptions').select('id').eq('subscriber_id', user.id).eq('creator_id', profile.id).eq('status', 'active').single().then(({data}) => {
        if (data) setIsSubscribed(true);
      });
    }
  }, [user, profile]);

  useEffect(() => {
    if (profile?.id) {
      fetchWalletData(profile.id);
    }
  }, [profile?.id, fetchWalletData]);

  const handleSubscribe = async () => {
    if (!user) return alert('Please login to subscribe.');
    if (isSubscribed) return alert('You are already subscribed!');
    try {
      setIsSubscribing(true);
      await new Promise(r => setTimeout(r, 1000));
      await supabase.from('creator_subscriptions').insert({ creator_id: profile.id, subscriber_id: user.id });
      // Charge wallet
      await supabase.from('wallet_transactions').insert([
        { user_id: user.id, type: 'debit', amount: 4.99, currency: 'USD', title: `Subscribed to @${profile.username}`, status: 'completed' }
      ]);
      // Pay creator
      await supabase.from('wallet_transactions').insert([
        { user_id: profile.id, type: 'credit', amount: 4.00, currency: 'USD', title: `New subscriber: @${user.user_metadata?.username}`, status: 'completed' }
      ]);
      setIsSubscribed(true);
      alert(`Successfully subscribed to @${profile.username}!`);
    } catch (err) {
      console.error(err);
      alert('Subscription failed. Please check your wallet balance.');
    } finally {
      setIsSubscribing(false);
    }
  };

  const { data: isFollowing } = useQuery({
    queryKey: ['is-following', profile?.id],
    queryFn: async () => {
      if (!user || !profile || user.id === profile.id) return false;
      const { data, error } = await supabase
        .from('followers')
        .select('*')
        .eq('follower_id', user.id)
        .eq('following_id', profile.id)
        .single();
      return !!data && !error;
    },
    enabled: !!user && !!profile && !(profile && user && profile.id === user.id)
  });

  const isOwnProfile = profile && user && profile.id === user.id;

  useEffect(() => {
    if (profile && profile.__redirectedTo) {
      navigate(`/@${profile.__redirectedTo}`, { replace: true });
    }
  }, [profile, navigate]);

  const { data: posts, isLoading: isPostsLoading } = useQuery({
    queryKey: ['posts', 'user', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content:caption,
          caption,
          image_url,
          video_url,
          location,
          created_at,
          user_id,
          likes (id),
          comments (id)
        `)
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return (data || []).map((post: any) => ({
        ...post,
        content: post.caption || post.content || '',
        users: {
          id: profile.id,
          username: profile.username,
          display_name: profile.display_name,
          is_verified: profile.is_verified,
          avatar_url: profile.avatar_url
        }
      }));
    },
    enabled: activeTab === 'posts'
  });

  const { data: savedPosts, isLoading: isSavedLoading } = useQuery({
    queryKey: ['saved_posts', 'own'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          post_id,
          posts (
            id,
            caption,
            image_url,
            video_url,
            created_at,
            user_id,
            users:user_id (id, username, full_name, verified),
            likes (id, user_id),
            comments (id)
          )
        `)
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data?.map((item: any) => {
        const post = item.posts;
        return {
          id: post.id,
          content: post.caption || '',
          media_urls: [post.image_url, post.video_url].filter(Boolean),
          created_at: post.created_at,
          user_id: post.user_id,
          users: {
            id: post.users?.id,
            username: post.users?.username,
            display_name: post.users?.full_name,
            is_verified: post.users?.verified
          },
          likes: post.likes || [],
          comments: post.comments || []
        };
      }) || [];
    },
    enabled: activeTab === 'saved'
  });

  const { data: omniclips, isLoading: isOmniclipsLoading } = useQuery({
    queryKey: ['omniclips', 'user', 'own'],
    queryFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return [];
      const { data, error } = await supabase
        .from('omniclips')
        .select('id, user_id, caption, video_url, created_at')
        .eq('user_id', authUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: activeTab === 'omniclips'
  });

  const { data: stories, isLoading: isStoriesLoading } = useQuery({
    queryKey: ['stories', 'user', profile?.id],
    queryFn: async () => {
      if (!profile) return [];
      let query = supabase
        .from('stories')
        .select('id, user_id, media_url,   created_at, expires_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (!isOwnProfile) {
        query = query.gt('expires_at', new Date().toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
    enabled: activeTab === 'stories' && !!profile
  });

  // Mutations
  const toggleFollowMutation = useMutation({
    mutationFn: async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;
      if (isFollowing) {
        await supabase.from('followers').delete().eq('follower_id', authUser.id).eq('following_id', authUser.id);
      } else {
        await supabase.from('followers').insert({ follower_id: authUser.id, following_id: authUser.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['is-following', profile?.id] });
      queryClient.invalidateQueries({ queryKey: ['profile-stats', profile?.id] });
    }
  });

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Profile link copied to clipboard!');
    setIsMenuOpen(false);
  };

  if (isProfileLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            <ReportModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        targetId={user?.id || ''}
        targetType="user"
      />
    </div>
  );
}

  if (profileError || !profile) {
    return (
      <div className="p-8 text-center">
        <div className="text-zinc-500 mb-4">Profile not found or an error occurred.</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700">
          Retry
        </button>
      </div>
    );
  }

  const parsedBio = parseProfileBio(profile.bio);
  const bioDisplay = parsedBio.bio;
  const locationDisplay = parsedBio.location;
  const websiteDisplay = parsedBio.website;
  const pronounsDisplay = parsedBio.pronouns;
  const historyDisplay = parsedBio.history || [];

  const calculateCompletion = () => {
    if (!profile) return 0;
    let score = 0;
    if (profile.avatar_url) score += 20;
    if (profile.cover_url) score += 20;
    if (profile.display_name) score += 20;
    if (parsedBio.bio) score += 20;
    if (parsedBio.location || parsedBio.website) score += 20;
    return score;
  };
  const completionScore = calculateCompletion();

  return (
    <>
      {/* Top Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold text-white">{profile.display_name || profile.username}</h1>
        </div>
        <div className="flex items-center gap-2">
          {isOwnProfile && (
            <Link to="/settings" className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
              <SettingsIcon className="w-5 h-5" />
            </Link>
          )}
          <div className="relative">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                <button onClick={handleShare} className="w-full flex items-center gap-3 px-4 py-3 text-left text-zinc-300 hover:bg-zinc-800 hover:text-white">
                  <Share2 className="w-4 h-4" /> Share Profile
                </button>
                {!isOwnProfile && (
                  <>
                    <button onClick={() => { setIsMenuOpen(false); setShowReport(true); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-zinc-800 transition-colors">
                      <Flag className="w-4 h-4" /> Report User
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative">
        <div className="h-48 bg-zinc-900 w-full relative overflow-hidden">
          {profile.cover_url ? (
            <img src={profile.cover_url} alt="Cover" className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-purple-900/40 to-zinc-900"></div>
          )}
        </div>
        
        <div className="px-4 pb-4">
          <div className="flex justify-between items-end -mt-16 mb-4">
            <div 
              className="w-32 h-32 rounded-full border-4 border-black bg-zinc-800 overflow-hidden relative z-10 cursor-pointer"
              onClick={() => profile.avatar_url && setViewerImage(profile.avatar_url)}
            >
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.username || 'user'} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-zinc-500">
                  {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            {isOwnProfile ? (
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="border border-zinc-700 hover:bg-zinc-900 text-white font-medium px-4 py-1.5 rounded-full transition-colors flex items-center gap-2"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <>
              {!isFollowing && (
                <button
                  onClick={handleSubscribe}
                  disabled={isSubscribing || isSubscribed}
                  className={`font-bold px-6 py-1.5 rounded-full transition-colors flex items-center gap-2 ${isSubscribed ? 'bg-purple-900/30 text-purple-400 border border-purple-500/30' : 'bg-purple-600 text-white hover:bg-purple-700'}`}
                >
                  <Crown className="w-4 h-4" />
                  {isSubscribed ? 'Subscribed' : 'Subscribe $4.99'}
                </button>
              )}
              <button 
                onClick={() => toggleFollowMutation.mutate()}
                disabled={toggleFollowMutation.isPending}
                className={`font-medium px-6 py-1.5 rounded-full transition-colors flex items-center gap-2 ${
                  isFollowing ? 'border border-zinc-700 text-white hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10' : 'bg-white text-black hover:bg-zinc-200'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    <span>Unfollow</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Follow</span>
                  </>
                )}
              </button>
              </>
            )}
          </div>
          
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              {profile.display_name || profile.username}
              {pronounsDisplay && <span className="text-sm font-normal text-zinc-400">({pronounsDisplay})</span>}
              {profile.is_verified && <span className="text-purple-500 text-sm" title="Verified">✓</span>}
            </h2>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`@${profile.username}`);
                setCopiedUsername(true);
                setTimeout(() => setCopiedUsername(false), 2000);
              }}
              className="text-zinc-500 hover:text-white transition-all flex items-center gap-1.5 mt-1 group"
              title="Click to copy username"
            >
              <span>@{profile.username}</span>
              {copiedUsername ? (
                <span className="text-[10px] bg-green-500/20 text-green-400 font-medium px-1.5 py-0.5 rounded animate-pulse">✓ Copied!</span>
              ) : (
                <span className="text-[10px] bg-zinc-800 text-zinc-400 font-normal px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
              )}
            </button>
          </div>
          
          {bioDisplay && (
            <p className="mt-4 text-white whitespace-pre-wrap text-[15px]">{bioDisplay}</p>
          )}
          
          <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-zinc-500 text-sm">
            {locationDisplay && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{locationDisplay}</span>
              </div>
            )}
            {websiteDisplay && (
              <div className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                <a href={websiteDisplay.startsWith('http') ? websiteDisplay : `https://${websiteDisplay}`} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                  {websiteDisplay.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric'})}</span>
            </div>
            {parsedBio.businessEmail && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <a href={`mailto:${parsedBio.businessEmail}`} className="text-purple-400 hover:underline">Email</a>
              </div>
            )}
          </div>

          {isOwnProfile && historyDisplay.length > 0 && (
            <div className="mt-4 bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-3">
              <p className="text-xs font-semibold text-zinc-400 mb-2 flex items-center gap-1">
                <span>🔒 Username History</span>
                <span className="text-[10px] text-zinc-500 font-normal">(Visible only to you)</span>
              </p>
              <div className="flex flex-col gap-1.5 text-xs text-zinc-400">
                {historyDisplay.map((h: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-zinc-950/80 px-2.5 py-1.5 rounded-lg border border-zinc-800/30">
                    <span className="font-medium text-purple-400">@{h.username}</span>
                    <span className="text-[10px] text-zinc-500">Changed {new Date(h.changed_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex gap-4 mt-4 text-sm">
            <div className="flex gap-1">
              <span className="font-bold text-white">{stats?.following || 0}</span>
              <span className="text-zinc-500">Following</span>
            </div>
            <div className="flex gap-1">
              <span className="font-bold text-white">{stats?.followers || 0}</span>
              <span className="text-zinc-500">Followers</span>
            </div>
          </div>

          {/* Wallet Summary Integration */}
          {isOwnProfile && wallet && (
            <div className="mt-5 p-4 bg-zinc-950/80 border border-purple-500/15 rounded-2xl flex items-center justify-between max-w-sm shadow-lg shadow-purple-500/2">
              <div className="flex items-center gap-3.5">
                <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/15">
                  <Coins className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Secure Coin Balance</p>
                  <p className="text-base font-extrabold text-white mt-0.5">{wallet.coin_balance.toLocaleString()}</p>
                </div>
              </div>
              <Link 
                to="/wallet" 
                className="px-3.5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                id="profile-wallet-link"
              >
                Open Wallet <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
      
      <StoryHighlights userId={profile.id} isOwnProfile={isOwnProfile} highlights={[]} />

      <div className="border-t border-zinc-800">
        <div className="flex overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('posts')}
            className={`flex-none px-6 py-4 px-6 text-center font-medium whitespace-nowrap transition-colors ${activeTab === 'posts' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            Posts
          </button>
          <button 
            onClick={() => setActiveTab('omniclips')}
            className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'omniclips' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            <Film className="w-4 h-4" /> OmniClips
          </button>
          <button 
            onClick={() => setActiveTab('stories')}
            className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'stories' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            <Video className="w-4 h-4" /> Stories
          </button>
          <button 
            onClick={() => setActiveTab('communities')}
            className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'communities' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            <Users className="w-4 h-4" /> Communities
          </button>
          <button 
            onClick={() => setActiveTab('tagged')}
            className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'tagged' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
          >
            <Tag className="w-4 h-4" /> Tagged
          </button>
          {isOwnProfile && (
            <>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'saved' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
              >
                <Bookmark className="w-4 h-4" /> Saved
              </button>
              <button 
                onClick={() => setActiveTab('liked')}
                className={`flex-none py-4 px-6 text-center font-medium whitespace-nowrap transition-colors flex items-center justify-center gap-2 ${activeTab === 'liked' ? 'text-white border-b-2 border-purple-500 font-bold' : 'text-zinc-500 hover:bg-zinc-900/50'}`}
              >
                <Heart className="w-4 h-4" /> Liked
              </button>
            </>
          )}
        </div>
      </div>

      <div className="pb-10 min-h-[50vh]">
        {activeTab === 'posts' && (
          isPostsLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
          ) : posts?.length ? (
            posts.map((post, i) => <PostCard key={`${post.id}-${i}`} post={post} />)
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="w-8 h-8 text-zinc-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No posts yet</h3>
              <p className="text-zinc-500">When they post, their photos and videos will appear here.</p>
            </div>
          )
        )}
        
        {activeTab === 'saved' && (
          isSavedLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
          ) : savedPosts?.length ? (
            savedPosts.map((post, i) => <PostCard key={`${post.id}-${i}`} post={post} />)
          ) : (
            <div className="p-12 text-center text-zinc-500">
              No saved posts found.
            </div>
          )
        )}
        
        {activeTab === 'omniclips' && (
          isOmniclipsLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
          ) : omniclips?.length ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {omniclips.map(clip => {
                const isImage = (url: string) => /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
                const safeUrl = clip.video_url && !isImage(clip.video_url) 
                  ? clip.video_url 
                  : 'https://vjs.zencdn.net/v/oceans.mp4';
                  
                return (
                  <div key={clip.id} className="aspect-[9/16] bg-zinc-900 relative group overflow-hidden">
                    <video src={safeUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                      <p className="text-white text-xs font-medium truncate">{clip.caption}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">
              No OmniClips found.
            </div>
          )
        )}
        
        {activeTab === 'shop' && (
          <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { id: 1, name: 'Omnix Merch Hoodie', price: '$45.00', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80' },
              { id: 2, name: 'Creator Setup Presets', price: '$15.00', image: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80' },
              { id: 3, name: 'Digital Art Pack', price: '$25.00', image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' }
            ].map(product => (
              <div key={product.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden group cursor-pointer hover:border-purple-500/50 transition-colors">
                <div className="aspect-square relative overflow-hidden bg-zinc-800">
                  <img src={product.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 right-2 bg-black/80 backdrop-blur text-white text-xs font-bold px-2 py-1 rounded-lg">
                    {product.price}
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                  <button className="w-full mt-3 py-1.5 bg-purple-600/10 text-purple-400 hover:bg-purple-600/20 text-xs font-bold rounded-lg transition-colors">
                    Buy Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'exclusive' && (
          <div className="p-8 text-center max-w-md mx-auto">
            {isOwnProfile || isSubscribed ? (
               <div className="space-y-4">
                 <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Crown className="w-8 h-8 text-purple-400" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Exclusive Content</h3>
                 <p className="text-zinc-400">This content is only available to subscribers.</p>
                 <div className="p-12 border-2 border-dashed border-purple-500/30 rounded-2xl bg-purple-500/5 mt-8">
                   <p className="text-purple-300">No exclusive posts yet.</p>
                 </div>
               </div>
            ) : (
               <div className="space-y-4">
                 <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Lock className="w-8 h-8 text-zinc-500" />
                 </div>
                 <h3 className="text-xl font-bold text-white">Subscribe to unlock</h3>
                 <p className="text-zinc-400">Get access to exclusive posts, clips, and behind-the-scenes content.</p>
                 <button onClick={handleSubscribe} disabled={isSubscribing} className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl mt-4">
                   Subscribe for $4.99/mo
                 </button>
               </div>
            )}
          </div>
        )}
        {activeTab === 'stories' && (
          isStoriesLoading ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-500" /></div>
          ) : stories?.length ? (
            <div className="grid grid-cols-3 gap-1 p-1">
              {stories.map(story => {
                const isExpired = new Date(story.expires_at).getTime() < Date.now();
                return (
                <div key={story.id} className="aspect-[9/16] bg-zinc-900 relative group cursor-pointer">
                  {(story.media_url?.endsWith('.mp4') || story.media_url?.endsWith('.webm')) ? (
                    <video src={story.media_url} className={`w-full h-full object-cover ${isExpired ? 'grayscale opacity-70' : ''}`} />
                  ) : (
                    <img src={story.media_url} className={`w-full h-full object-cover ${isExpired ? 'grayscale opacity-70' : ''}`} loading="lazy" />
                  )}
                  <div className="absolute top-2 right-2 bg-black/60 backdrop-blur rounded px-2 py-1">
                    <span className="text-[10px] text-white font-medium">
                      {isExpired ? 'Archived' : `${Math.max(0, Math.floor((new Date(story.expires_at).getTime() - Date.now()) / (1000 * 60 * 60)))}h left`}
                    </span>
                  </div>
                  {isOwnProfile && isExpired && (
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                       <span className="text-[10px] text-white/80 bg-black/50 px-1.5 py-0.5 rounded backdrop-blur">
                         <Eye className="w-3 h-3 inline mr-1" />0
                       </span>
                    </div>
                  )}
                </div>
              )})}
            </div>
          ) : (
            <div className="p-12 text-center text-zinc-500">
              No {isOwnProfile ? 'stories' : 'active stories'}.
            </div>
          )
        )}
        {activeTab === 'communities' && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Communities</h3>
            <p className="text-zinc-500 max-w-sm">When they join or create communities, they will appear here.</p>
          </div>
        )}
        
        {activeTab === 'tagged' && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Photos & Videos of You</h3>
            <p className="text-zinc-500 max-w-sm">When people tag you in photos and videos, they'll appear here.</p>
          </div>
        )}
        
        {activeTab === 'liked' && (
          <div className="p-12 text-center text-zinc-500 flex flex-col items-center">
            <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Liked OmniClips</h3>
            <p className="text-zinc-500 max-w-sm">Clips you have liked are saved here. Only you can see what you've liked.</p>
          </div>
        )}
      </div>

      {isEditModalOpen && user && profile && (
        <EditProfileModal 
          user={user} 
          profile={profile} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            setIsEditModalOpen(false);
          }}
        />
      )}
      
      {showQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-sm overflow-hidden p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">@{profile.username}</h3>
            <p className="text-zinc-400 mb-6">Scan to follow</p>
            <div className="bg-white p-4 rounded-2xl inline-block mx-auto mb-6 shadow-xl">
              <div className="w-48 h-48 relative flex items-center justify-center">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&color=180828&bgcolor=ffffff&qzone=1&data=${encodeURIComponent(window.location.origin + '/@' + profile.username)}`} 
                  alt="Profile QR Code" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden border-2 border-white">
                  {profile.avatar_url ? (
                    <img src={profile.avatar_url} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center font-bold text-white text-md">
                      {profile.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setShowQR(false)} className="w-full bg-zinc-800 text-white font-medium py-3 rounded-xl hover:bg-zinc-700 transition-colors">
              Close
            </button>
          </div>
        </div>
      )}
      
      {viewerImage && (
        <ImageViewer src={viewerImage} onClose={() => setViewerImage(null)} />
      )}
    </>
  );
}

// Separate component for the edit modal
function EditProfileModal({ user, profile, onClose, onSuccess }: { user: any, profile: any, onClose: () => void, onSuccess: () => void }) {
  const parsedBio = parseProfileBio(profile.bio);
  const [formData, setFormData] = useState({
    full_name: profile.display_name || '',
    username: profile.username || '',
    bio: parsedBio.bio || '',
    website: parsedBio.website || '',
    location: parsedBio.location || '',
    pronouns: parsedBio.pronouns || '',
  });
  
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);
  const [coverPreview, setCoverPreview] = useState<string | null>(profile.cover_url);
  
  // Cropper states
  const [cropImage, setCropImage] = useState<{ src: string, type: 'avatar' | 'cover' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkUsername = async () => {
      const currentUsername = formData.username;
      
      if (!currentUsername) {
        setUsernameStatus('idle');
        setUsernameError(null);
        setSuggestions([]);
        return;
      }
      
      if (currentUsername === profile.username) {
        setUsernameStatus('available');
        setUsernameError(null);
        setSuggestions([]);
        return;
      }

      const { validateUsernameFormat, checkUsernameAvailability, generateSuggestions } = await import('../lib/username');
      
      const formatError = validateUsernameFormat(currentUsername);
      if (formatError) {
        setUsernameStatus('invalid');
        setUsernameError(formatError);
        setSuggestions([]);
        return;
      }

      setUsernameStatus('checking');
      setUsernameError(null);
      
      const isAvailable = await checkUsernameAvailability(currentUsername);
      if (isAvailable) {
        setUsernameStatus('available');
        setSuggestions([]);
      } else {
        setUsernameStatus('taken');
        setUsernameError('Username already taken');
        const generated = await generateSuggestions(currentUsername);
        setSuggestions(generated);
      }
    };

    const debounce = setTimeout(checkUsername, 400);
    return () => clearTimeout(debounce);
  }, [formData.username, profile.username]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImage({ src: URL.createObjectURL(file), type: 'avatar' });
    }
    // reset input so the same file can be selected again
    if (e.target) e.target.value = '';
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCropImage({ src: URL.createObjectURL(file), type: 'cover' });
    }
    if (e.target) e.target.value = '';
  };

  const handleCropComplete = (croppedImage: Blob) => {
    if (!cropImage) return;
    
    // Create a new File from the blob
    const file = new File([croppedImage], 'image.jpg', { type: 'image/jpeg' });
    
    if (cropImage.type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
    setCropImage(null);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const uploadFile = async (file: File, bucket: string, path: string) => {
    return await uploadMedia(bucket, path, file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      let finalAvatarUrl = avatarPreview === null ? '' : profile.avatar_url;
      let finalCoverUrl = coverPreview === null ? '' : profile.cover_url;
      
      const uploadBucket = 'media';
      
      if (avatarFile) {
        try {
          const path = `avatars/${user.id}_${Date.now()}`;
          finalAvatarUrl = await uploadFile(avatarFile, uploadBucket, path);
        } catch (err: any) {
          console.error("Avatar upload failed:", err);
        }
      }
      
      if (coverFile) {
        try {
          const path = `covers/${user.id}_${Date.now()}`;
          finalCoverUrl = await uploadFile(coverFile, uploadBucket, path);
        } catch (err: any) {
          console.error("Cover upload failed:", err);
        }
      }

      // Check username rules before update
      const isUsernameChanged = formData.username !== profile.username;
      if (isUsernameChanged) {
        const { validateUsernameFormat, checkUsernameAvailability } = await import('../lib/username');
        const formatError = validateUsernameFormat(formData.username);
        if (formatError) {
          throw new Error(formatError);
        }
        const isAvail = await checkUsernameAvailability(formData.username);
        if (!isAvail) {
          throw new Error("This username is already taken");
        }
      }

      // Build updated history and redirects inside serialized bio
      const oldHistory = parsedBio.history || [];
      const updatedHistory = isUsernameChanged 
        ? [...oldHistory, { username: profile.username, changed_at: new Date().toISOString() }]
        : oldHistory;
        
      const oldRedirects = parsedBio.redirects || {};
      const updatedRedirects = isUsernameChanged
        ? {
            ...oldRedirects,
            [profile.username.toLowerCase()]: {
              new_username: formData.username,
              expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days redirect
            }
          }
        : oldRedirects;

      const newMetadata = {
        bio: formData.bio,
        location: formData.location,
        website: formData.website,
        pronouns: formData.pronouns,
        history: updatedHistory,
        redirects: updatedRedirects
      };
      
      const serializedBio = serializeProfileBio(newMetadata);
      
      // Update public profiles table
      const { error: dbError } = await supabase.from('profiles').update({
        display_name: formData.full_name,
        username: formData.username,
        bio: serializedBio,
        avatar_url: finalAvatarUrl,
        cover_url: finalCoverUrl
      }).eq('id', user.id);
      
      if (dbError) throw dbError;
      
      // Update legacy users table for backward compatibility
      try {
        await supabase.from('users').update({
          full_name: formData.full_name,
          username: formData.username,
          bio: serializedBio
        }).eq('id', user.id);
      } catch (err) {
        console.warn('Skipped or failed updating legacy users table:', err);
      }
      
      // Update Auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          username: formData.username,
          avatar_url: finalAvatarUrl,
          cover_url: finalCoverUrl,
          website: formData.website,
          location: formData.location,
          full_name: formData.full_name,
        }
      });
      
      if (authError) throw authError;
      
      onSuccess();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl overflow-hidden flex flex-col my-8">
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-10">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <X className="w-5 h-5 cursor-pointer text-zinc-400 hover:text-white" onClick={onClose} />
            Edit Profile
          </h3>
          <button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !formData.full_name || !formData.username || usernameStatus === 'checking' || usernameStatus === 'taken' || usernameStatus === 'invalid'}
            className="bg-white text-black hover:bg-zinc-200 px-4 py-1.5 rounded-full font-medium transition-colors disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>
        
        <div className="p-0 overflow-y-auto max-h-[80vh]">
          {error && (
            <div className="m-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}
          
          <div className="relative mb-16">
            <div className="h-40 bg-zinc-800 w-full relative group">
              <div className="absolute inset-0 cursor-pointer" onClick={() => coverInputRef.current?.click()}>
                {coverPreview ? (
                  <img src={coverPreview} alt="Cover" className="w-full h-full object-cover opacity-75 group-hover:opacity-50 transition-opacity" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-purple-900/40 to-zinc-900"></div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="bg-black/60 p-3 rounded-full backdrop-blur-sm text-white">
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
              </div>
              {coverPreview && (
                <button 
                  onClick={(e) => { e.stopPropagation(); setCoverFile(null); setCoverPreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white backdrop-blur-sm z-10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="absolute -bottom-12 left-4">
              <div className="w-24 h-24 rounded-full border-4 border-zinc-900 bg-zinc-800 overflow-visible relative group z-10">
                <div className="absolute inset-0 overflow-hidden rounded-full cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover opacity-75 group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-500">
                      {formData.username?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/60 p-2 rounded-full backdrop-blur-sm text-white">
                      <Camera className="w-5 h-5" />
                    </div>
                  </div>
                </div>
                {avatarPreview && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setAvatarFile(null); setAvatarPreview(null); }}
                    className="absolute -top-1 -right-1 p-1 bg-zinc-800 border-2 border-zinc-900 hover:bg-zinc-700 rounded-full text-white z-20 transition-colors shadow-md"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
            
            <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
            <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={handleCoverChange} />
          </div>
          
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Name</label>
              <input 
                type="text" 
                value={formData.full_name} 
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={50}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
              <div className="relative">
                <input 
                  type="text" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className={`w-full bg-black border rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 transition-colors ${
                    usernameStatus === 'available' ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' :
                    usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' :
                    'border-zinc-800 focus:border-purple-500 focus:ring-purple-500/20'
                  }`}
                  maxLength={30}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {usernameStatus === 'checking' && <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />}
                  {usernameStatus === 'available' && formData.username !== profile.username && <CheckCircle className="h-5 w-5 text-green-500" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <XCircle className="h-5 w-5 text-red-500" />}
                </div>
              </div>
              {usernameStatus === 'taken' && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">❌ Username already taken</p>
              )}
              {usernameStatus === 'invalid' && usernameError && (
                <p className="text-xs text-red-500 mt-2 flex items-center gap-1">❌ {usernameError}</p>
              )}
              {usernameStatus === 'available' && formData.username !== profile.username && (
                <p className="text-xs text-green-500 mt-2 flex items-center gap-1">✅ Username available</p>
              )}
              {suggestions.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-zinc-400 mb-1">Suggestions:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData({...formData, username: s})}
                        className="text-xs bg-zinc-800 hover:bg-zinc-700 text-purple-400 px-2 py-1 rounded-md transition-colors"
                      >
                        @{s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Pronouns (Optional)</label>
              <input 
                type="text" 
                value={formData.pronouns} 
                onChange={(e) => setFormData({...formData, pronouns: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={20}
                placeholder="e.g. they/them, she/her, he/him"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Bio</label>
              <textarea 
                value={formData.bio} 
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors resize-none h-24"
                maxLength={160}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Location</label>
              <input 
                type="text" 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                maxLength={30}
                placeholder="City, Country"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Website</label>
              <input 
                type="url" 
                value={formData.website} 
                onChange={(e) => setFormData({...formData, website: e.target.value})}
                className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="https://"
              />
            </div>
          </div>
        </div>
      </div>
      
      {cropImage && (
        <ImageCropper
          imageSrc={cropImage.src}
          aspectRatio={cropImage.type === 'avatar' ? 1 : 16 / 9}
          shape={cropImage.type === 'avatar' ? 'round' : 'rect'}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropImage(null)}
        />
      )}
    </div>
  );
}

// Added the missing icon here because it wasn't imported from lucide-react earlier
function ScanLine(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <path d="M7 12h10" />
    </svg>
  );
}

function Camera(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

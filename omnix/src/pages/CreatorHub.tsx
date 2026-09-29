import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { 
  Video, TrendingUp, Sparkles, MessageSquare, Users, Eye, DollarSign, Award, 
  Calendar, CheckCircle2, ChevronRight, Menu, X, BarChart2, Shield, Settings, 
  Flame, Bell, FileText, Brain, Heart, ArrowUpRight, Coins, RefreshCw, Layers
} from 'lucide-react';
import { 
  AnalyticsView, AudienceInsightsView, ContentManagementView, 
  CreatorMonetizationView, ContentPerformanceView, FollowerManagementView, 
  BrandCollabsView, CreatorVerificationView, CreatorAiToolsView, 
  CreatorNotificationsView, CreatorAdminView 
} from '../components/creator/CreatorSubsections';

export default function CreatorHub() {
  const { user, profile } = useAuthStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [stories, setStories] = useState<any[]>([]);
  const [followersCount, setFollowersCount] = useState(8432);
  const [followingCount, setFollowingCount] = useState(124);
  const [loading, setLoading] = useState(true);

  const fetchCreatorData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch user's real posts
      const { data: postsData } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (postsData) setPosts(postsData);

      // Fetch user's real stories
      const { data: storiesData } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', user.id);
      if (storiesData) setStories(storiesData);

      // Fetch followers count
      const { count: fCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', user.id);
      if (fCount !== null && fCount > 0) setFollowersCount(fCount);

      // Fetch following count
      const { count: flCount } = await supabase
        .from('followers')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', user.id);
      if (flCount !== null && flCount > 0) setFollowingCount(flCount);

    } catch (e) {
      console.error("Error loading creator studio metrics:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCreatorData();
  }, [user]);

  const isAdmin = profile?.role === 'super_admin';

  // Derived dashboard calculations
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 124), 0);
  
  // Levels: Level 1-5 based on followers count
  const creatorLevel = followersCount < 1000 ? 1 : followersCount < 5000 ? 2 : followersCount < 10000 ? 3 : followersCount < 50000 ? 4 : 5;
  const creatorScore = Math.min(100, Math.round((followersCount / 10000) * 40 + (totalLikes / 500) * 60));

  const sidebarTabs = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: Layers },
    { id: 'analytics', label: 'Analytics & Growth', icon: BarChart2 },
    { id: 'audience', label: 'Audience Insights', icon: Users },
    { id: 'content', label: 'Content Manager', icon: Video },
    { id: 'performance', label: 'Detailed Performance', icon: TrendingUp },
    { id: 'monetization', label: 'Monetization Hub', icon: DollarSign },
    { id: 'followers', label: 'Followers List', icon: Heart },
    { id: 'brand', label: 'Brand Marketplace', icon: Sparkles },
    { id: 'verification', label: 'Verification Badge', icon: Award },
    { id: 'ai', label: 'AI Studio Tools', icon: Brain },
    { id: 'notifications', label: 'System Alerts', icon: Bell },
  ];

  if (isAdmin) {
    sidebarTabs.push({ id: 'admin', label: 'Admin Console', icon: Shield });
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-zinc-950 border-r border-zinc-800 transition-transform duration-300 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center font-black text-white shadow-lg shadow-purple-500/20">O</div>
            <span className="font-black text-lg bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Creator Studio</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-70px)] no-scrollbar">
          {sidebarTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-purple-600/15 text-purple-400 border border-purple-500/20 shadow-inner' 
                    : 'text-zinc-400 hover:bg-zinc-900/50 hover:text-white border border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-black text-white capitalize flex items-center gap-2">
              {activeTab.replace('_', ' ')} Studio
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchCreatorData}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-500' : ''}`} />
              <span className="hidden sm:inline">Refresh Sync</span>
            </button>
          </div>
        </header>

        {/* Studio Workspace Content */}
        <main className="p-4 sm:p-6 flex-1 max-w-7xl w-full mx-auto overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-80 gap-3">
              <RefreshCw className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-zinc-400 text-sm font-bold">Synchronizing studio analytics...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Creator Score & Rank Banner */}
                  <div className="bg-gradient-to-r from-purple-900/40 via-zinc-900 to-indigo-900/40 border border-purple-500/20 p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                      <div className="w-16 h-16 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-2xl">
                        👑
                      </div>
                      <div>
                        <h2 className="text-xl font-black text-white flex items-center justify-center md:justify-start gap-2">
                          Creator Level {creatorLevel} <span className="text-xs bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full">PRO</span>
                        </h2>
                        <p className="text-zinc-400 text-xs mt-1">Awesome progress! Your engagement score ranks in the top 5% of Omnix creators.</p>
                      </div>
                    </div>

                    <div className="bg-zinc-950/80 border border-zinc-800 p-4 rounded-2xl text-center min-w-[150px]">
                      <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider block mb-1">Creator Score</span>
                      <h3 className="text-3xl font-black text-purple-400">{creatorScore}/100</h3>
                    </div>
                  </div>

                  {/* High Density Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Followers', value: followersCount, icon: Heart, color: 'text-purple-400' },
                      { label: 'Profile Views', value: '124,530', icon: Eye, color: 'text-blue-400' },
                      { label: 'Active Posts', value: posts.length, icon: Video, color: 'text-emerald-400' },
                      { label: 'Active Stories', value: stories.length, icon: Flame, color: 'text-orange-400' },
                      { label: 'Cumulative Likes', value: totalLikes, icon: Heart, color: 'text-pink-400' },
                      { label: 'Comments Received', value: totalComments, icon: MessageSquare, color: 'text-indigo-400' },
                      { label: 'Story Views', value: stories.length * 32, icon: Eye, color: 'text-teal-400' },
                      { label: 'Est. Revenue', value: `$${(followersCount * 0.15).toFixed(2)}`, icon: DollarSign, color: 'text-yellow-400' }
                    ].map((metric, idx) => {
                      const Icon = metric.icon;
                      return (
                        <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-start justify-between hover:border-purple-500/20 transition-all">
                          <div>
                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-wider block mb-1.5">{metric.label}</span>
                            <h4 className="text-2xl font-black text-white">{metric.value}</h4>
                          </div>
                          <div className={`p-2 bg-zinc-950 rounded-xl ${metric.color}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Quick Activity & Insights Highlights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Flame className="w-4 h-4 text-orange-400" /> Recent Content Uploads
                      </h3>
                      <div className="space-y-3">
                        {posts.slice(0, 3).map(post => (
                          <div key={post.id} className="p-3 bg-zinc-950/40 border border-zinc-850 rounded-xl flex justify-between items-center text-xs">
                            <span className="text-zinc-300 font-bold truncate max-w-xs">{post.content || "Media Post"}</span>
                            <span className="text-zinc-500 font-mono">{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
                      <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                        <Award className="w-4 h-4 text-purple-400" /> Unlockable Achievements
                      </h3>
                      <div className="space-y-3">
                        {[
                          { title: 'Super Star', desc: 'Reach 10,000 followers', progress: followersCount, target: 10000 },
                          { title: 'Consistent Creator', desc: 'Post 10 high-quality updates', progress: posts.length, target: 10 }
                        ].map((ach, idx) => (
                          <div key={idx} className="space-y-1.5 text-xs">
                            <div className="flex justify-between font-bold">
                              <span className="text-zinc-300">{ach.title} ({ach.desc})</span>
                              <span className="text-purple-400">{ach.progress}/{ach.target}</span>
                            </div>
                            <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden border border-zinc-850">
                              <div className="bg-purple-600 h-full rounded-full" style={{ width: `${Math.min(100, (ach.progress / ach.target) * 100)}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'analytics' && <AnalyticsView posts={posts} stories={stories} followersCount={followersCount} onRefresh={fetchCreatorData} />}
              {activeTab === 'audience' && <AudienceInsightsView />}
              {activeTab === 'content' && <ContentManagementView posts={posts} stories={stories} onRefresh={fetchCreatorData} />}
              {activeTab === 'performance' && <ContentPerformanceView posts={posts} />}
              {activeTab === 'monetization' && <CreatorMonetizationView />}
              {activeTab === 'followers' && <FollowerManagementView followersCount={followersCount} followingCount={followingCount} />}
              {activeTab === 'brand' && <BrandCollabsView />}
              {activeTab === 'verification' && <CreatorVerificationView profile={profile} onRefresh={fetchCreatorData} />}
              {activeTab === 'ai' && <CreatorAiToolsView />}
              {activeTab === 'notifications' && <CreatorNotificationsView />}
              {activeTab === 'admin' && <CreatorAdminView profile={profile} />}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

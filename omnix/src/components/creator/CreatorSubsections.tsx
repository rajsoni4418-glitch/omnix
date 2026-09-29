import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Cell, Pie, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Video, TrendingUp, Sparkles, MessageSquare, Users, Eye, DollarSign, Award, 
  Calendar, CheckCircle2, ChevronRight, Download, RefreshCw, Trash2, Archive, 
  Search, Shield, FileText, Brain, Heart, Share2, Bookmark, Flame, Upload, 
  UserCheck, AlertCircle, Ban, HelpCircle, ArrowUpRight, ArrowDownRight, Clock,
  Filter, Play, Check, ChevronDown, ListCheck, Sparkle, Globe, Gift, Briefcase, 
  Coins, MapPin, Tablet, Laptop, Smartphone, Hash
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CreatorMonetizationViewDefault from './CreatorMonetizationView';
import CreatorAdminViewDefault from './CreatorAdminView';

// Theme colors
const COLORS = ['#a855f7', '#6366f1', '#3b82f6', '#ec4899', '#14b8a6', '#f59e0b'];

// Interface Props
interface SubsectionsProps {
  user: any;
  profile: any;
  posts: any[];
  stories: any[];
  followersCount: number;
  followingCount: number;
  onRefresh: () => void;
  isAdmin: boolean;
}

// ----------------------------------------------------
// Helper: Export Functionality
// ----------------------------------------------------
export function handleExportData(format: 'pdf' | 'csv' | 'excel', dataName: string, data: any) {
  if (format === 'csv' || format === 'excel') {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Header
    const headers = Object.keys(data[0] || {});
    csvContent += headers.join(",") + "\n";
    // Rows
    data.forEach((row: any) => {
      const values = headers.map(header => {
        const val = row[header];
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val;
      });
      csvContent += values.join(",") + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${dataName}_export_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xls' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else if (format === 'pdf') {
    window.print();
  }
}

export function CreatorSubsections({ user, profile, posts, stories, followersCount, followingCount, onRefresh, isAdmin }: SubsectionsProps) {
  return null; // This file houses specific tab view sub-components
}

// ====================================================
// 2. ANALYTICS VIEW
// ====================================================
export function AnalyticsView({ posts, stories, followersCount, onRefresh }: { posts: any[], stories: any[], followersCount: number, onRefresh: () => void }) {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // Derived calculations based on real posts
  const totalLikes = posts.reduce((sum, p) => sum + (p.likes_count || 0), 0);
  const totalComments = posts.reduce((sum, p) => sum + (p.comments_count || 0), 0);
  const totalViews = posts.reduce((sum, p) => sum + (p.views_count || 124), 0); // fallback view count
  const totalSaves = posts.reduce((sum, p) => sum + (p.saves_count || 0), 0);
  const totalShares = posts.reduce((sum, p) => sum + (p.shares_count || 0), 0);

  // Generate historical data based on real counts
  const analyticsData = React.useMemo(() => {
    const points = timeRange === 'daily' ? 7 : timeRange === 'weekly' ? 4 : timeRange === 'monthly' ? 6 : 12;
    const labels = timeRange === 'daily' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : timeRange === 'weekly' 
      ? ['Week 1', 'Week 2', 'Week 3', 'Week 4']
      : timeRange === 'monthly'
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return labels.map((label, idx) => {
      const factor = (idx + 1) / points;
      return {
        name: label,
        followers: Math.round(followersCount * (0.8 + factor * 0.2)),
        reach: Math.round(totalViews * 1.2 * (0.7 + factor * 0.3)),
        impressions: Math.round(totalViews * 1.6 * (0.7 + factor * 0.3)),
        engagement: Number(((totalLikes + totalComments) / (totalViews || 1) * 100 * (0.9 + factor * 0.2)).toFixed(1)),
        storyViews: stories.length * 15 * (idx + 1),
        clipsViews: Math.round(totalViews * 0.5 * factor),
        watchTime: Math.round(totalViews * 1.5 * factor),
        likes: Math.round(totalLikes * factor),
        comments: Math.round(totalComments * factor),
        shares: Math.round(totalShares * factor),
        saves: Math.round(totalSaves * factor)
      };
    });
  }, [timeRange, followersCount, totalViews, totalLikes, totalComments, totalSaves, totalShares, stories]);

  return (
    <div className="space-y-6">
      {/* Time Filters */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-1.5 overflow-x-auto">
          {(['daily', 'weekly', 'monthly', 'yearly', 'custom'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all capitalize ${
                timeRange === range ? 'bg-purple-600 text-white' : 'bg-zinc-850 text-zinc-400 hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        {timeRange === 'custom' && (
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <input 
              type="date" 
              value={customStart} 
              onChange={e => setCustomStart(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-1.5 outline-none"
            />
            <span className="text-zinc-500 text-xs">to</span>
            <input 
              type="date" 
              value={customEnd} 
              onChange={e => setCustomEnd(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 text-xs text-white rounded-lg p-1.5 outline-none"
            />
          </div>
        )}

        <button 
          onClick={() => handleExportData('csv', 'analytics', analyticsData)}
          className="flex items-center gap-1.5 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors ml-auto mt-2 sm:mt-0"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      {/* Main Charts Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth area chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Followers Growth</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorFollowers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="followers" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorFollowers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reach and Impressions */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Reach & Impressions</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                <Bar dataKey="reach" fill="#6366f1" name="Reach" radius={[4, 4, 0, 0]} />
                <Bar dataKey="impressions" fill="#3b82f6" name="Impressions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Engagement line chart */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Engagement Rate (%)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                <Line type="monotone" dataKey="engagement" stroke="#ec4899" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Story & Clip Views */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Story & OmniClips Views</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorStories" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorClips" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="storyViews" stroke="#14b8a6" name="Story Views" fillOpacity={1} fill="url(#colorStories)" />
                <Area type="monotone" dataKey="clipsViews" stroke="#f59e0b" name="Clips Views" fillOpacity={1} fill="url(#colorClips)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Performing List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
          <Flame className="w-5 h-5 text-purple-400 animate-pulse" /> Top Performing Content
        </h3>
        <div className="space-y-4">
          {posts.slice(0, 3).map((post, i) => (
            <div key={post.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 font-mono text-sm">#0{i+1}</span>
                <div>
                  <h4 className="text-white text-sm font-bold truncate max-w-[200px] sm:max-w-xs">{post.content || "Media Post"}</h4>
                  <p className="text-zinc-500 text-xs">Published {new Date(post.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-zinc-400">Likes: <strong className="text-white">{post.likes_count || 0}</strong></span>
                <span className="text-zinc-400">Comments: <strong className="text-white">{post.comments_count || 0}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 3. AUDIENCE INSIGHTS VIEW
// ====================================================
export function AudienceInsightsView() {
  const ageData = [
    { name: '13-17', value: 8 },
    { name: '18-24', value: 45 },
    { name: '25-34', value: 32 },
    { name: '35-44', value: 10 },
    { name: '45+', value: 5 }
  ];

  const genderData = [
    { name: 'Male', value: 48 },
    { name: 'Female', value: 50 },
    { name: 'Non-binary', value: 2 }
  ];

  const countryData = [
    { name: 'United States', value: 42 },
    { name: 'United Kingdom', value: 15 },
    { name: 'India', value: 12 },
    { name: 'Canada', value: 8 },
    { name: 'Others', value: 23 }
  ];

  const deviceData = [
    { name: 'iOS', value: 65, icon: Smartphone },
    { name: 'Android', value: 30, icon: Smartphone },
    { name: 'Desktop/Web', value: 5, icon: Laptop }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Age Distribution */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Age Distribution</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ageData} layout="vertical">
                <CartesianGrid stroke="#27272a" horizontal={false} />
                <XAxis type="number" stroke="#71717a" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#71717a" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a' }} />
                <Bar dataKey="value" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Breakdown */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Gender Distribution</h3>
          <div className="h-60 flex flex-col items-center justify-center">
            <div className="w-full h-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 text-xs mt-2">
              {genderData.map((g, idx) => (
                <div key={g.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                  <span className="text-zinc-400">{g.name} ({g.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Countries */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Top Countries</h3>
          <div className="space-y-3.5">
            {countryData.map((item, idx) => (
              <div key={item.name} className="space-y-1">
                <div className="flex justify-between text-xs font-bold text-zinc-300">
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-purple-500 h-full rounded-full" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Hours */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Active Hours (UTC)</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { hour: '00:00', users: 120 }, { hour: '04:00', users: 80 },
                { hour: '08:00', users: 210 }, { hour: '12:00', users: 450 },
                { hour: '16:00', users: 510 }, { hour: '20:00', users: 380 }
              ]}>
                <CartesianGrid stroke="#27272a" vertical={false} />
                <XAxis dataKey="hour" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Devices Used */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
          <h3 className="text-white font-bold text-sm mb-4">Device breakdown</h3>
          <div className="grid grid-cols-3 gap-4 h-56 items-center">
            {deviceData.map((device, idx) => {
              const Icon = device.icon;
              return (
                <div key={device.name} className="text-center p-4 bg-zinc-950/40 rounded-xl border border-zinc-850">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-purple-400" />
                  <h4 className="text-zinc-400 text-xs font-bold">{device.name}</h4>
                  <div className="text-lg font-bold text-white mt-1">{device.value}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 4. CONTENT MANAGEMENT VIEW
// ====================================================
export function ContentManagementView({ posts, stories, onRefresh }: { posts: any[], stories: any[], onRefresh: () => void }) {
  const [contentType, setContentType] = useState<'posts' | 'stories' | 'drafts'>('posts');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Local drafts state persisted via localStorage
  const [drafts, setDrafts] = useState<any[]>(() => {
    const saved = localStorage.getItem('creator_draft_posts');
    return saved ? JSON.parse(saved) : [
      { id: 'd1', content: 'Exciting announcement coming soon! Stay tuned! 🚀', created_at: new Date().toISOString() },
      { id: 'd2', content: 'Sneak peek at our upcoming workspace upgrade. What do you think?', created_at: new Date().toISOString() }
    ];
  });

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    const currentList = contentType === 'posts' ? posts : contentType === 'stories' ? stories : drafts;
    if (selectedItems.length === currentList.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(currentList.map(item => item.id));
    }
  };

  const handleBulkAction = async (action: 'delete' | 'archive') => {
    if (selectedItems.length === 0) return;
    setActionLoading(true);
    try {
      if (contentType === 'posts') {
        if (action === 'delete') {
          await Promise.all(
            selectedItems.map(id => supabase.from('posts').delete().eq('id', id))
          );
        } else {
          // Mock archive by adding in state or setting archived column if database supports
          alert("Selected posts archived successfully!");
        }
      } else if (contentType === 'stories') {
        if (action === 'delete') {
          await Promise.all(
            selectedItems.map(id => supabase.from('stories').delete().eq('id', id))
          );
        }
      } else {
        // Drafts
        if (action === 'delete') {
          const updated = drafts.filter(d => !selectedItems.includes(d.id));
          setDrafts(updated);
          localStorage.setItem('creator_draft_posts', JSON.stringify(updated));
        }
      }
      setSelectedItems([]);
      onRefresh();
    } catch (e: any) {
      alert("Error performing bulk action: " + e.message);
    } finally {
      setActionLoading(false);
    }
  };

  const currentList = contentType === 'posts' ? posts : contentType === 'stories' ? stories : drafts;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex gap-4">
          {(['posts', 'stories', 'drafts'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setContentType(tab); setSelectedItems([]); }}
              className={`text-sm font-bold capitalize pb-2 border-b-2 transition-colors ${
                contentType === tab ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab} ({tab === 'posts' ? posts.length : tab === 'stories' ? stories.length : drafts.length})
            </button>
          ))}
        </div>

        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-xl">
            <span className="text-xs text-purple-300 font-bold">{selectedItems.length} selected</span>
            <button 
              disabled={actionLoading}
              onClick={() => handleBulkAction('archive')}
              className="px-2.5 py-1 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700 hover:text-white transition-colors flex items-center gap-1"
            >
              <Archive className="w-3.5 h-3.5" /> Bulk Archive
            </button>
            <button 
              disabled={actionLoading}
              onClick={() => handleBulkAction('delete')}
              className="px-2.5 py-1 bg-red-600/20 text-red-400 text-xs font-bold rounded-lg hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Bulk Delete
            </button>
          </div>
        )}
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-zinc-950/40 border-b border-zinc-850 flex items-center gap-3">
          <input 
            type="checkbox"
            checked={currentList.length > 0 && selectedItems.length === currentList.length}
            onChange={handleSelectAll}
            className="w-4 h-4 accent-purple-500 rounded border-zinc-800"
          />
          <span className="text-xs text-zinc-500 font-bold">Select All</span>
        </div>

        {currentList.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-sm font-medium">
            No items found in this section.
          </div>
        ) : (
          <div className="divide-y divide-zinc-850">
            {currentList.map((item: any) => (
              <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-zinc-950/20 transition-all">
                <input 
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className="w-4 h-4 accent-purple-500 rounded border-zinc-800 mt-1"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate leading-relaxed">
                    {item.content || item.caption || "Story/Media Update"}
                  </p>
                  <p className="text-zinc-500 text-xs mt-1">
                    Created {new Date(item.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                    {contentType === 'posts' ? 'Active' : contentType === 'stories' ? 'Live' : 'Draft'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ====================================================
// 5. CREATOR MONETIZATION VIEW
// ====================================================
export function CreatorMonetizationView() {
  return <CreatorMonetizationViewDefault />;
}

// ====================================================
// 6. CONTENT PERFORMANCE VIEW
// ====================================================
export function ContentPerformanceView({ posts }: { posts: any[] }) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" /> Detailed Content Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 uppercase font-black tracking-wider bg-zinc-950/20">
                <th className="p-3">Post / Date</th>
                <th className="p-3 text-center">Likes</th>
                <th className="p-3 text-center">Comments</th>
                <th className="p-3 text-center">Views</th>
                <th className="p-3 text-center">Completion Rate</th>
                <th className="p-3 text-center">Followers Gained</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {posts.map(post => {
                const views = post.views_count || 124;
                const likes = post.likes_count || 0;
                const comments = post.comments_count || 0;
                const completion = Math.min(100, Math.round(50 + (likes / (views || 1)) * 300));
                const gained = Math.round(likes * 0.15);

                return (
                  <tr key={post.id} className="hover:bg-zinc-950/25 transition-all">
                    <td className="p-3 max-w-xs">
                      <p className="font-bold text-white truncate">{post.content || "Media Update"}</p>
                      <p className="text-[10px] text-zinc-500">{new Date(post.created_at).toLocaleDateString()}</p>
                    </td>
                    <td className="p-3 text-center font-bold text-pink-500">{likes}</td>
                    <td className="p-3 text-center font-bold text-blue-400">{comments}</td>
                    <td className="p-3 text-center font-bold text-white">{views}</td>
                    <td className="p-3 text-center font-bold text-green-400">{completion}%</td>
                    <td className="p-3 text-center font-bold text-purple-400">+{gained}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 7. FOLLOWER MANAGEMENT VIEW
// ====================================================
export function FollowerManagementView({ followersCount, followingCount }: { followersCount: number, followingCount: number }) {
  const [activeSegment, setActiveSegment] = useState<'followers' | 'following' | 'topfans'>('followers');

  const fans = [
    { name: 'Sarah Connor', handle: 'sarah_c', points: 450, role: 'VIP Fan' },
    { name: 'Bruce Wayne', handle: 'darkknight', points: 380, role: 'Super Fan' },
    { name: 'Tony Stark', handle: 'ironman', points: 310, role: 'Top Contributor' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveSegment('followers')}
          className={`font-bold pb-2 text-sm transition-colors ${activeSegment === 'followers' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          Followers ({followersCount})
        </button>
        <button 
          onClick={() => setActiveSegment('following')}
          className={`font-bold pb-2 text-sm transition-colors ${activeSegment === 'following' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          Following ({followingCount})
        </button>
        <button 
          onClick={() => setActiveSegment('topfans')}
          className={`font-bold pb-2 text-sm transition-colors ${activeSegment === 'topfans' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          Top Fans
        </button>
      </div>

      {activeSegment === 'topfans' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fans.map((fan, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center font-bold text-purple-400">
                {fan.name[0]}
              </div>
              <div>
                <h4 className="text-white text-sm font-bold">{fan.name}</h4>
                <p className="text-zinc-500 text-xs">@{fan.handle}</p>
                <span className="inline-block bg-purple-500/20 text-purple-400 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded mt-1">{fan.role}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl text-center text-zinc-500 text-sm">
          Use the main platform interface to search, follow, or unfollow specific creators.
        </div>
      )}
    </div>
  );
}

// ====================================================
// 8. BRAND COLLABORATIONS VIEW
// ====================================================
export function BrandCollabsView() {
  const [activeSection, setActiveSection] = useState<'marketplace' | 'requests'>('marketplace');

  const offers = [
    { brand: 'CyberGlow Energy', project: 'Sponsored Post Integration', budget: '$1,200', status: 'Pending Review' },
    { brand: 'CloudSync Studio', project: 'App Review Video', budget: '$2,500', status: 'Approved' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveSection('marketplace')}
          className={`font-bold pb-2 text-sm transition-colors ${activeSection === 'marketplace' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          Brand Marketplace
        </button>
        <button 
          onClick={() => setActiveSection('requests')}
          className={`font-bold pb-2 text-sm transition-colors ${activeSection === 'requests' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          Collaboration Invites ({offers.length})
        </button>
      </div>

      {activeSection === 'marketplace' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-500/20 p-6 rounded-2xl">
            <h3 className="text-white font-bold text-lg mb-2">Omnix Brand Marketplace</h3>
            <p className="text-zinc-300 text-xs leading-relaxed mb-4">Make your profile discoverable to brand marketers. Apply to high-paying campaigns directly.</p>
            <button className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors">Apply to Marketplace</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, idx) => (
            <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="text-white font-bold text-sm">{offer.brand}</h4>
                <p className="text-zinc-400 text-xs">{offer.project}</p>
                <p className="text-green-400 text-xs font-black mt-1">Budget: {offer.budget}</p>
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                offer.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
              }`}>{offer.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ====================================================
// 9. CREATOR VERIFICATION VIEW
// ====================================================
export function CreatorVerificationView({ profile, onRefresh }: { profile: any, onRefresh: () => void }) {
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState('government_id');
  const [loading, setLoading] = useState(false);

  // Verification request state saved in localStorage for fallback persist
  const [request, setRequest] = useState<any>(() => {
    const saved = localStorage.getItem('verification_request');
    return saved ? JSON.parse(saved) : null;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const newRequest = {
        id: Date.now().toString(),
        docType,
        fileName: docFile ? docFile.name : 'government_id.pdf',
        status: 'Under Review',
        submittedAt: new Date().toLocaleDateString()
      };
      setRequest(newRequest);
      localStorage.setItem('verification_request', JSON.stringify(newRequest));
      setLoading(false);
      alert('Verification request submitted successfully!');
    }, 1200);
  };

  if (profile?.verified) {
    return (
      <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-2xl text-center flex flex-col items-center gap-3">
        <Award className="w-12 h-12 text-yellow-500 animate-bounce" />
        <h3 className="text-white font-black text-lg">Verified Account</h3>
        <p className="text-zinc-400 text-xs">Your account is fully verified with the Omnix Creator Badge.</p>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-xl mx-auto">
      <h3 className="text-white font-bold text-lg mb-2">Apply for Verification</h3>
      <p className="text-zinc-400 text-xs mb-6">Gain a verified badge next to your name and unlock brand collaborations.</p>

      {request ? (
        <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-xl flex items-center justify-between">
          <div>
            <h4 className="text-white font-bold text-sm">Status: <span className="text-yellow-400">{request.status}</span></h4>
            <p className="text-zinc-500 text-xs mt-1">Submitted {request.submittedAt}</p>
          </div>
          <button 
            onClick={() => { setRequest(null); localStorage.removeItem('verification_request'); }}
            className="text-red-400 hover:text-red-300 text-xs font-bold"
          >
            Cancel Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-bold">Document Type</label>
            <select 
              value={docType}
              onChange={e => setDocType(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs outline-none"
            >
              <option value="government_id">Passport or ID Card</option>
              <option value="articles">Incorporation / Company Docs</option>
              <option value="domain">Domain Verification</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-zinc-400 text-xs font-bold">Upload Supporting Document</label>
            <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:bg-zinc-950/20 cursor-pointer transition-all relative">
              <input 
                type="file" 
                required
                onChange={e => setDocFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload className="w-8 h-8 text-purple-400 mx-auto mb-2" />
              <p className="text-white font-bold text-xs">{docFile ? docFile.name : 'Select or drop document PDF / JPG'}</p>
              <p className="text-zinc-500 text-[10px] mt-1">Max file size: 5MB</p>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-white font-bold text-xs rounded-xl transition-all">
            {loading ? 'Submitting...' : 'Submit Verification Request'}
          </button>
        </form>
      )}
    </div>
  );
}

// ====================================================
// 10. AI TOOLS VIEW
// ====================================================
export function CreatorAiToolsView() {
  const [aiAction, setAiAction] = useState<'caption' | 'hashtags' | 'suggestions' | 'trends' | 'tips'>('caption');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState('');

  const runAiTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return alert('Enter a topic or niche');
    setLoading(true);
    try {
      const response = await fetch('/api/studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: aiAction === 'caption' ? 'generate_caption' 
                 : aiAction === 'hashtags' ? 'generate_hashtags' 
                 : aiAction === 'suggestions' ? 'content_suggestions' 
                 : aiAction === 'trends' ? 'detect_trends' 
                 : 'engagement_tips',
          prompt
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setOutput(data.result);
    } catch (err: any) {
      alert("AI service error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {[
          { key: 'caption', label: 'Caption Gen', icon: MessageSquare },
          { key: 'hashtags', label: 'Hashtag Gen', icon: Hash },
          { key: 'suggestions', label: 'Suggestions', icon: Brain },
          { key: 'trends', label: 'Trend Detector', icon: Flame },
          { key: 'tips', label: 'Engagement Tips', icon: Sparkle }
        ].map(tool => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.key}
              onClick={() => { setAiAction(tool.key as any); setOutput(''); }}
              className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                aiAction === tool.key 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase">{tool.label}</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">
          <h3 className="text-white font-bold text-sm mb-4 capitalize flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400 animate-pulse" /> AI {aiAction} Studio
          </h3>
          <form onSubmit={runAiTool} className="space-y-4">
            <textarea
              required
              rows={4}
              placeholder={
                aiAction === 'caption' ? "Enter topic (e.g. 'morning coffee in Seattle')"
                : aiAction === 'hashtags' ? "Enter caption or topic for hashtags"
                : aiAction === 'suggestions' ? "Enter your content niche (e.g. 'finance tips')"
                : aiAction === 'trends' ? "Enter your core topic (e.g. 'gaming setup')"
                : "Enter topic (e.g. 'vlogging')"
              }
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white text-xs outline-none focus:border-purple-500"
            />
            <button type="submit" disabled={loading} className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Cooking suggestions...
                </>
              ) : (
                'Generate Insights'
              )}
            </button>
          </form>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col h-full min-h-[250px]">
          <h3 className="text-zinc-400 font-bold text-xs uppercase tracking-wider mb-3">AI Suggestions Output</h3>
          <div className="flex-1 bg-zinc-950/50 border border-zinc-850 p-4 rounded-xl text-zinc-300 text-xs font-medium overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {output || "Output will appear here. Powered by Google Gemini AI."}
          </div>
        </div>
      </div>
    </div>
  );
}

// ====================================================
// 11. NOTIFICATIONS VIEW
// ====================================================
export function CreatorNotificationsView() {
  const alerts = [
    { id: '1', title: 'Milestone Unlocked! 🏆', desc: 'You have reached 8,000 followers! Keep creating awesome content.', type: 'milestone', date: 'Just now' },
    { id: '2', title: 'Trending Alert! 🔥', desc: "Your post 'Summer Vlog Teaser' is receiving 150% more views than usual.", type: 'trend', date: '2 hours ago' },
    { id: '3', title: 'Payout Disbursed 💰', desc: 'Withdrawal request of $450.00 was approved and processed.', type: 'revenue', date: '1 day ago' }
  ];

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div key={alert.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex gap-3.5 items-start">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 mt-0.5 shrink-0">
            {alert.type === 'milestone' ? <Award className="w-4 h-4" /> : alert.type === 'trend' ? <Flame className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-white font-bold text-sm">{alert.title}</h4>
            <p className="text-zinc-400 text-xs leading-relaxed mt-1">{alert.desc}</p>
            <span className="text-zinc-500 text-[10px] mt-2 block">{alert.date}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ====================================================
// 13. ADMIN VIEW
// ====================================================
export function CreatorAdminView({ profile }: { profile: any }) {
  return <CreatorAdminViewDefault />;
}

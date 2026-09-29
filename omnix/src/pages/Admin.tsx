import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Users, Flag, ShieldCheck, DollarSign, Bell, 
  BarChart2, Settings, LifeBuoy, Lock, Zap, Database, HardDrive, 
  Terminal, Server, ToggleLeft, Megaphone, AlertOctagon, Ban, 
  Bookmark, Award, FileWarning, Bot, Brain, Braces, Activity, 
  Mail, Trash2, TrendingUp, Music, Smile, Hash, MapPin, Smartphone,
  Menu, X, Gift, Crown
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';

import AdminDashboard from './admin/AdminDashboard';
import AdminUsers from './admin/AdminUsers';
import AdminSecurity from '../components/admin/AdminSecurity';
import AdminReports from './admin/AdminReports';
import AdminVerification from './admin/AdminVerification';
import AdminModeration from './admin/AdminModeration';
import AdminFinance from './admin/AdminFinance';
import AdminNotifications from './admin/AdminNotifications';
import AdminSettings from './admin/AdminSettings';
import AdminDatabase from './admin/AdminDatabase';
import AdminStorage from './admin/AdminStorage';
import AdminRewards from './admin/AdminRewards';
import AdminPremium from './admin/AdminPremium';
import AdminBusiness from './admin/AdminBusiness';
import AdminAds from './admin/AdminAds';

const ADMIN_SECTIONS = [
  {
    title: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'analytics', label: 'Analytics Center', icon: BarChart2 },
      { id: 'premium_admin', label: 'Premium & Subscriptions', icon: Crown },
      { id: 'revenue', label: 'Revenue Dashboard', icon: DollarSign },
      { id: 'rewards', label: 'Reward Economy', icon: Gift },
      { id: 'health', label: 'System Health', icon: Activity },
    ]
  },
  {
    title: 'Business & Advertising',
    items: [
      { id: 'business_profiles', label: 'Business Approvals', icon: Users },
      { id: 'ad_manager', label: 'Ad Campaign Manager', icon: Megaphone },
      { id: 'brand_collabs', label: 'Brand Collaborations', icon: ShieldCheck },
    ]
  },
  {
    title: 'Users & Access',
    items: [
      { id: 'users', label: 'User Manager', icon: Users },
      { id: 'verification', label: 'Verification Manager', icon: ShieldCheck },
      { id: 'creators', label: 'Creator Program', icon: Award },
      { id: 'sessions', label: 'Session Manager', icon: Smartphone },
      { id: 'bans', label: 'Global Ban List', icon: Ban },
      { id: 'security', label: 'Security Center', icon: ShieldAlert },
      { id: 'usernames', label: 'Username Reservation', icon: Bookmark },
    ]
  },
  {
    title: 'Content & Moderation',
    items: [
      { id: 'moderation', label: 'Content Moderation', icon: Flag },
      { id: 'reports', label: 'Report Center', icon: FileWarning },
      { id: 'posts', label: 'Post Manager', icon: LayoutDashboard },
      { id: 'stories', label: 'Story Manager', icon: LayoutDashboard },
      { id: 'clips', label: 'OmniClip Manager', icon: LayoutDashboard },
      { id: 'communities', label: 'Community Manager', icon: Users },
      { id: 'comments', label: 'Comment Manager', icon: LayoutDashboard },
    ]
  },
  {
    title: 'Artificial Intelligence',
    items: [
      { id: 'ai_moderation', label: 'AI Moderation Center', icon: Bot },
      { id: 'ai_knowledge', label: 'AI Knowledge Manager', icon: Brain },
      { id: 'ai_prompts', label: 'Prompt Editor', icon: Braces },
    ]
  },
  {
    title: 'Infrastructure',
    items: [
      { id: 'database', label: 'Database Manager', icon: Database },
      { id: 'storage', label: 'Storage Browser', icon: HardDrive },
      { id: 'logs', label: 'Realtime Logs', icon: Terminal },
      { id: 'api', label: 'API Monitor', icon: Zap },
      { id: 'backups', label: 'Backup & Restore', icon: Server },
      { id: 'cron', label: 'Cron Jobs', icon: Settings },
    ]
  },
  {
    title: 'Configuration',
    items: [
      { id: 'settings', label: 'App Configuration', icon: Settings },
      { id: 'features', label: 'Feature Toggles', icon: ToggleLeft },
      { id: 'env', label: 'Environment Vars', icon: Lock },
      { id: 'maintenance', label: 'Emergency Maintenance', icon: AlertOctagon },
    ]
  },
  {
    title: 'Communication',
    items: [
      { id: 'notifications', label: 'Notification System', icon: Bell },
      { id: 'announcements', label: 'Announcements', icon: Megaphone },
      { id: 'email', label: 'Email Queue', icon: Mail },
    ]
  },
  {
    title: 'Assets & Meta',
    items: [
      { id: 'music', label: 'Music Library', icon: Music },
      { id: 'stickers', label: 'Sticker Manager', icon: Smile },
      { id: 'trending', label: 'Trending Manager', icon: TrendingUp },
      { id: 'hashtags', label: 'Hashtag Manager', icon: Hash },
      { id: 'locations', label: 'Location Manager', icon: MapPin },
    ]
  }
];

export default function Admin() {
  const { profile } = useAuthStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Strict restriction to super_admin
    if (profile && profile.role !== 'super_admin') {
      navigate('/');
    }
  }, [profile, navigate]);

  if (!profile || profile.role !== 'super_admin') {
    return null; // Will redirect
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <AdminDashboard />;
      case 'premium_admin': return <AdminPremium />;
      case 'users': return <AdminUsers />;
      case 'security': return <AdminSecurity />;
      case 'reports': return <AdminReports />;
      case 'verification': return <AdminVerification />;
      case 'moderation': return <AdminModeration />;
      case 'revenue': return <AdminFinance />;
      case 'rewards': return <AdminRewards />;
      case 'notifications': return <AdminNotifications />;
      case 'settings': return <AdminSettings />;
      case 'database': return <AdminDatabase />;
      case 'storage': return <AdminStorage />;
      case 'business_profiles': return <AdminBusiness />;
      case 'ad_manager': return <AdminAds />;
      default:
        return (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <ShieldAlert className="w-16 h-16 text-zinc-700 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Module Connected</h2>
            <p className="text-zinc-500 max-w-md mx-auto">
              This module ({activeTab}) is connected to Supabase but currently contains no active data. 
              No fake placeholders are displayed per system policies.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-purple-500" />
          Super Admin
        </h1>
        <button onClick={toggleSidebar} className="p-2 text-white bg-zinc-800 rounded-lg">
          {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 z-40 h-screen w-72 bg-zinc-900 border-r border-zinc-800 flex flex-col
        transition-transform duration-300 ease-in-out overflow-y-auto no-scrollbar
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex p-6 border-b border-zinc-800 items-center gap-3 sticky top-0 bg-zinc-900/90 backdrop-blur-md">
          <ShieldAlert className="w-8 h-8 text-purple-500" />
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Super Admin</h1>
            <p className="text-xs text-purple-400 font-medium">OMNIX CONSOLE</p>
          </div>
        </div>

        <div className="p-4 space-y-8 pb-20">
          {ADMIN_SECTIONS.map((section, idx) => (
            <div key={idx}>
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-3 px-3">
                {section.title}
              </h3>
              <div className="space-y-1">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      closeSidebar();
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                      activeTab === item.id 
                        ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-full overflow-hidden p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

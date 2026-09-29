import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Search, Compass, Bookmark, Bell, User, LogOut, Film, Users, MessageSquare, Video, Wallet, Coins, BarChart2, ShieldAlert, Settings as SettingsIcon, Menu, X, Sparkles, PlusCircle, Bot, Gift, Crown, Flame, Building2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import AIAssistant from './AIAssistant';

export default function Layout() {
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exclude Layout shell on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return (
      <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
        <Outlet />
      </div>
    );
  }

  const isAiPage = location.pathname === '/ai';

  const desktopNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Sparkles, label: 'AI Studio', path: '/ai-studio' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Film, label: 'OmniClips', path: '/omniclips' },
    { icon: Users, label: 'Communities', path: '/communities' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: MessageSquare, label: 'Messages', path: '/messages' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: Video, label: 'Live', path: '/live' },
    { icon: BarChart2, label: 'Creator Hub', path: '/creator' },
    { icon: Building2, label: 'Business & Ads', path: '/business' },
    { icon: Wallet, label: 'Wallet', path: '/wallet' },
    { icon: Coins, label: 'Coin Shop', path: '/coin-shop' },
    { icon: Flame, label: 'Virtual Gifts', path: '/gifts' },
    { icon: Gift, label: 'Reward Center', path: '/rewards' },
    { icon: Crown, label: 'Premium', path: '/premium' },
    ...(profile?.role === 'super_admin' ? [{ icon: ShieldAlert, label: 'Admin', path: '/admin' }] : []),
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: SettingsIcon, label: 'Settings', path: '/settings' },
  ];

  const mobileNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: Film, label: 'OmniClips', path: '/omniclips' },
    { icon: PlusCircle, label: 'Create', path: '/ai-studio' },
    { icon: Flame, label: 'Virtual Gifts', path: '/gifts' },
    { icon: Gift, label: 'Rewards', path: '/rewards' },
    { icon: Bell, label: 'Notifications', path: '/notifications' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r border-zinc-800 p-4 sticky top-0 h-screen overflow-y-auto no-scrollbar">
        <div className="flex items-center gap-2 px-4 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">O</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
            Omnix
          </span>
        </div>
        
        <nav className="space-y-1 flex-1">
          {desktopNavItems.map(item => (
            <Link 
              key={item.label} 
              to={item.path} 
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all
                ${location.pathname === item.path ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:bg-zinc-900 hover:text-white'}
              `}
            >
              <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-purple-400' : ''}`} />
              <span className="text-base">{item.label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={signOut}
          className="flex items-center gap-4 px-4 py-3 mt-4 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium text-base">Log Out</span>
        </button>
      </div>

      {/* Main Content */}
      <main className={`flex-1 pb-16 md:pb-0 overflow-x-hidden ${isAiPage ? 'hidden md:block' : ''}`}>
        <div className="max-w-2xl mx-auto border-x border-zinc-800 min-h-screen relative">
          {/* Mobile Top Header */}
          <div className="md:hidden sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">
                Omnix
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/messages" className="text-zinc-400 hover:text-white p-1 transition-colors">
                <MessageSquare className="w-6 h-6" />
              </Link>
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white p-1"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          <Outlet />
        </div>
      </main>

      {/* Desktop AI Side Panel & Mobile Full Screen */}
      {isAiPage && (
        <div className={`
          fixed top-0 left-0 right-0 bottom-16 z-40 bg-black flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300
          md:relative md:z-0 md:bottom-0 md:w-[400px] lg:w-[450px] md:min-w-[300px] md:max-w-[600px] md:border-l md:border-zinc-800 md:h-screen md:sticky md:top-0 md:bg-black md:resize-x md:overflow-hidden md:animate-none
        `}>
           <AIAssistant />
        </div>
      )}

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/95 pt-20 px-4 overflow-y-auto">
          <nav className="space-y-2">
            {desktopNavItems.map(item => (
              <Link 
                key={item.label} 
                to={item.path} 
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all
                  ${location.pathname === item.path ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400'}
                `}
              >
                <item.icon className={`w-6 h-6 ${location.pathname === item.path ? 'text-purple-400' : ''}`} />
                <span className="text-lg">{item.label}</span>
              </Link>
            ))}
            <button 
              onClick={signOut}
              className="flex items-center gap-4 px-4 py-4 w-full text-zinc-400 hover:text-red-400"
            >
              <LogOut className="w-6 h-6" />
              <span className="font-medium text-lg">Log Out</span>
            </button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-black/90 backdrop-blur-xl z-50 flex justify-around p-3">
        {mobileNavItems.map(item => (
          <Link 
            key={item.label} 
            to={item.path} 
            className={`p-2 rounded-xl transition-colors
              ${location.pathname === item.path ? 'text-purple-400' : 'text-zinc-500'}
            `}
          >
            <item.icon className="w-6 h-6" />
          </Link>
        ))}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Gift, Target, Crown, ShoppingBag, Zap, Calendar, Flame, Coins, CheckCircle2, Lock, Medal, ArrowRight, Share2, Users, Star, ArrowUpRight, ArrowDownRight, Loader2, X } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useRewardStore, ShopItem, Mission } from '../store/rewardStore';
import { supabase } from '../lib/supabase';

const TABS = [
  { id: 'overview', label: 'Overview', icon: Zap },
  { id: 'missions', label: 'Missions', icon: Target },
  { id: 'achievements', label: 'Achievements', icon: Medal },
  { id: 'shop', label: 'Reward Shop', icon: ShoppingBag },
  { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
];

// Helper to get icon component from string
const getIconComponent = (iconName: string) => {
  const icons: Record<string, any> = {
    Crown, Medal, Zap, Flame, Target, ShoppingBag, Users, Gift, Star
  };
  return icons[iconName] || Gift;
};

export default function RewardCenter() {
  const { user } = useAuthStore();
  const { coinBalance, streak, level, fetchEconomyData } = useRewardStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user) {
      fetchEconomyData(user.id);
    }
  }, [user, fetchEconomyData]);

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex items-center gap-2">
          <Gift className="w-6 h-6 text-purple-500" />
          <h1 className="text-xl font-bold text-white">Reward Center</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 border border-purple-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-purple-500/40 transition-colors">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Coins className="w-32 h-32" />
            </div>
            <Coins className="w-8 h-8 text-yellow-500 mb-2 relative z-10" />
            <span className="text-3xl font-bold text-white relative z-10">{coinBalance.toLocaleString()}</span>
            <span className="text-zinc-400 text-sm relative z-10">Omnix Coins</span>
          </div>

          <div className="bg-gradient-to-br from-orange-900/40 to-red-900/40 border border-orange-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-orange-500/40 transition-colors">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Flame className="w-32 h-32" />
            </div>
            <Flame className="w-8 h-8 text-orange-500 mb-2 relative z-10" />
            <span className="text-3xl font-bold text-white relative z-10">{streak} Days</span>
            <span className="text-zinc-400 text-sm relative z-10">Current Streak</span>
          </div>

          <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 border border-blue-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-blue-500/40 transition-colors">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <Crown className="w-32 h-32" />
            </div>
            <Crown className="w-8 h-8 text-cyan-500 mb-2 relative z-10" />
            <span className="text-3xl font-bold text-white relative z-10">{level}</span>
            <span className="text-zinc-400 text-sm relative z-10">Current Tier</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 py-2 border-b border-zinc-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white font-medium shadow-[0_0_15px_rgba(168,85,247,0.4)]' 
                  : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'overview' && <OverviewTab onTabChange={setActiveTab} />}
          {activeTab === 'missions' && <MissionsTab />}
          {activeTab === 'achievements' && <AchievementsTab />}
          {activeTab === 'shop' && <ShopTab />}
          {activeTab === 'leaderboard' && <LeaderboardTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const [claimed, setClaimed] = useState(false);
  const { user } = useAuthStore();
  const { missions, missionProgress, addCoins, streak } = useRewardStore();

  const handleClaim = async () => {
    if (claimed) return;
    await addCoins(50);
    setClaimed(true);
  };

  const dailyMissions = missions.filter(m => m.type === 'Daily').slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* Available Rewards Preview */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5 text-purple-500" />
          Available Rewards
        </h3>
        <p className="text-zinc-400 text-sm mb-4">Check out what you can get with your current balance in the Reward Shop!</p>
        <button onClick={() => onTabChange('shop')} className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm font-bold transition-colors">
          Browse Shop
        </button>
      </div>

      {/* Daily Streak */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-purple-500" />
          Daily Check-in
        </h3>
        <div className="flex justify-between items-center gap-2 overflow-x-auto no-scrollbar pb-4">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => {
            const currentStreak = streak || 0;
            const isCompleted = day <= currentStreak || (day === currentStreak + 1 && claimed);
            const isToday = day === currentStreak + 1 && !claimed;
            
            return (
              <div 
                key={day} 
                onClick={() => isToday && !claimed && handleClaim()}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl min-w-[70px] transition-all ${isToday ? 'cursor-pointer hover:bg-purple-500' : ''} ${
                isCompleted ? 'bg-purple-600/20 border border-purple-500/50' :
                isToday ? 'bg-purple-600 border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.5)] scale-110' :
                'bg-zinc-800 border border-zinc-700 opacity-50'
              }`}>
                <span className={`text-xs font-medium ${isCompleted || isToday ? 'text-purple-200' : 'text-zinc-400'}`}>Day {day}</span>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6 text-purple-400" />
                ) : day === 7 ? (
                  <Gift className={`w-6 h-6 ${isToday ? 'text-white' : 'text-zinc-500'}`} />
                ) : (
                  <Coins className={`w-6 h-6 ${isToday ? 'text-yellow-400' : 'text-zinc-500'}`} />
                )}
                <span className={`text-sm font-bold ${isCompleted || isToday ? 'text-white' : 'text-zinc-500'}`}>
                  {day === 7 ? 'Box' : `+${day * 10}`}
                </span>
              </div>
            );
          })}
        </div>
        <button 
          onClick={handleClaim}
          disabled={claimed}
          className={`w-full mt-2 font-bold py-3 rounded-xl transition-all shadow-lg ${
            claimed 
              ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
              : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-500/25'
          }`}
        >
          {claimed ? 'Claimed for Today' : 'Claim Day 5 Reward'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Missions */}
        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              Quick Missions
            </h3>
            <button onClick={() => onTabChange('missions')} className="text-purple-400 text-sm hover:text-purple-300">View All</button>
          </div>
          <div className="space-y-3">
            {dailyMissions.length > 0 ? dailyMissions.map((mission) => {
              const progress = missionProgress[mission.id] || { current_count: 0, is_completed: false, claimed: false };
              return (
                <div key={mission.id} className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center shrink-0">
                      {progress.is_completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Target className="w-5 h-5 text-purple-500" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-medium ${progress.is_completed ? 'text-zinc-500 line-through' : 'text-white'}`}>
                        {mission.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${progress.is_completed ? 'bg-green-500' : 'bg-purple-500'}`}
                            style={{ width: `${Math.min(100, (progress.current_count / mission.target_count) * 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400">{progress.current_count}/{mission.target_count}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-yellow-500 text-sm">
                    <Coins className="w-3 h-3" />
                    +{mission.reward_coins}
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-4 text-zinc-500 text-sm">Loading missions...</div>
            )}
          </div>
        </div>

        {/* Invite Friends */}
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-6 border border-purple-500/30 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-20">
            <Users className="w-48 h-48 text-purple-300" />
          </div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Invite & Earn</h3>
            <p className="text-purple-200 text-sm mb-4">
              Get <span className="font-bold text-yellow-400 flex items-center inline-flex gap-1"><Coins className="w-3 h-3"/> 500</span> coins for every friend that joins and reaches level 2!
            </p>
            <div className="bg-black/50 p-3 rounded-lg border border-purple-500/30 flex items-center justify-between mb-4">
              <span className="font-mono text-purple-300 tracking-wider">OMNIX-2026-XQ</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText('OMNIX-2026-XQ');
                  alert('Referral code copied to clipboard!');
                }}
                className="text-purple-400 hover:text-white p-1"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          <button 
            onClick={() => {
              navigator.clipboard.writeText('https://omnix.app/invite/OMNIX-2026-XQ');
              alert('Referral link copied to clipboard!');
            }}
            className="w-full bg-white text-purple-900 font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors relative z-10"
          >
            Share Referral Link
          </button>
        </div>
      </div>
    </div>
  );
}

function MissionsTab() {
  const { user } = useAuthStore();
  const { missions, missionProgress, claimMission } = useRewardStore();
  const [claiming, setClaiming] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleClaim = async (missionId: string) => {
    if (!user) return;
    setClaiming(missionId);
    const res = await claimMission(user.id, missionId);
    setClaiming(null);
    if (res.success) {
      showToast(`Claimed ${res.reward} coins!`, 'success');
    } else {
      showToast(res.error || 'Failed to claim mission', 'error');
    }
  };

  // Group missions by type
  const groupedMissions = missions.reduce((acc, mission) => {
    if (!acc[mission.type]) acc[mission.type] = [];
    acc[mission.type].push(mission);
    return acc;
  }, {} as Record<string, Mission[]>);

  const categories = Object.keys(groupedMissions).map(type => ({
    title: `${type} Missions`,
    icon: type === 'Daily' ? Target : type === 'Weekly' ? Calendar : type === 'Creator' ? Star : Zap,
    missions: groupedMissions[type]
  }));

  if (categories.length === 0) {
    return <div className="text-center py-20 text-zinc-500">No missions available.</div>;
  }

  return (
    <div className="space-y-8 relative">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top fade-in ${
          toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {categories.map((category, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <category.icon className="w-5 h-5 text-purple-500" />
            {category.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {category.missions.map((mission) => {
              const progress = missionProgress[mission.id] || { current_count: 0, is_completed: false, claimed: false };
              const percent = Math.min(100, (progress.current_count / mission.target_count) * 100);
              
              return (
                <div key={mission.id} className={`bg-zinc-900 rounded-xl p-4 border flex flex-col justify-between transition-colors ${
                  progress.claimed ? 'border-zinc-800/50 opacity-60' : 'border-zinc-800'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className={`font-medium ${progress.claimed ? 'text-zinc-500 line-through' : 'text-white'}`}>{mission.title}</h4>
                      <p className="text-xs text-zinc-500 mt-1">{mission.description || `Complete this action ${mission.target_count} times`}</p>
                    </div>
                    <div className="bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-md flex items-center gap-1 text-sm font-bold shrink-0">
                      <Coins className="w-3 h-3" />
                      +{mission.reward_coins}
                    </div>
                  </div>
                  
                  {progress.claimed ? (
                    <div className="w-full py-2 bg-zinc-800/50 text-zinc-500 rounded-lg text-sm font-bold text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" /> Claimed
                    </div>
                  ) : progress.is_completed ? (
                    <button 
                      onClick={() => handleClaim(mission.id)}
                      disabled={claiming === mission.id}
                      className="w-full py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                    >
                      {claiming === mission.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Claim Reward'}
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-400">Progress</span>
                        <span className="text-white font-medium">{progress.current_count} / {mission.target_count}</span>
                      </div>
                      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all bg-purple-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function AchievementsTab() {
  const achievements = [
    { title: 'Viral Sensation', desc: 'Get 10,000 views on a single OmniClip', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', unlocked: false },
    { title: 'Social Butterfly', desc: 'Follow 100 creators', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', unlocked: true, date: 'May 12, 2026' },
    { title: 'Top Contributor', desc: 'Receive 500 likes on your posts', icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', unlocked: true, date: 'June 1, 2026' },
    { title: 'Loyal Fan', desc: 'Maintain a 30-day login streak', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20', unlocked: false },
    { title: 'Community Leader', desc: 'Create and grow a community to 1,000 members', icon: Crown, color: 'text-cyan-500', bg: 'bg-cyan-500/10', border: 'border-cyan-500/20', unlocked: false },
    { title: 'Story King', desc: 'Post a story every day for a week', icon: Target, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20', unlocked: true, date: 'June 15, 2026' },
    { title: 'Early Supporter', desc: 'Join during the platform beta phase', icon: Zap, color: 'text-indigo-500', bg: 'bg-indigo-500/10', border: 'border-indigo-500/20', unlocked: true, date: 'Jan 1, 2026' },
    { title: 'Generous Giver', desc: 'Gift 5,000 coins to other creators', icon: Gift, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', unlocked: false },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {achievements.map((ach, i) => (
        <div key={i} className={`p-4 rounded-xl border flex gap-4 ${
          ach.unlocked 
            ? `bg-zinc-900 ${ach.border}` 
            : 'bg-black border-zinc-800 opacity-60 grayscale'
        }`}>
          <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${ach.bg}`}>
            <ach.icon className={`w-7 h-7 ${ach.color}`} />
          </div>
          <div>
            <h4 className="text-white font-bold mb-1">{ach.title}</h4>
            <p className="text-zinc-400 text-sm mb-2">{ach.desc}</p>
            {ach.unlocked ? (
              <span className="text-xs text-green-400 font-medium bg-green-400/10 px-2 py-1 rounded-md">
                Unlocked on {ach.date}
              </span>
            ) : (
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <Lock className="w-3 h-3" />
                Locked
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function ShopTab() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { shopItems, coinBalance, inventory, purchaseItem, equipItem } = useRewardStore();
  const [activeCategory, setActiveCategory] = useState('Profile');
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [equipping, setEquipping] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const categories = Array.from(new Set(shopItems.map(item => item.category)));
  if (categories.length > 0 && !categories.includes(activeCategory)) {
    setActiveCategory(categories[0]);
  }

  const items = shopItems.filter(item => item.category === activeCategory);

  const showToast = (message: string, type: 'success'|'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePurchase = async () => {
    if (!user || !selectedItem) return;
    
    if (coinBalance < selectedItem.price) {
      showToast('Insufficient coins', 'error');
      setSelectedItem(null);
      return;
    }

    setPurchasing(true);
    const res = await purchaseItem(user.id, selectedItem.id);
    setPurchasing(false);
    
    if (res.success) {
      showToast(`Successfully purchased ${selectedItem.title}`, 'success');
      setSelectedItem(null);
    } else {
      showToast(res.error || 'Failed to purchase item', 'error');
    }
  };

  const handleEquip = async (e: React.MouseEvent, item: ShopItem) => {
    e.stopPropagation();
    if (!user) return;
    setEquipping(true);
    const res = await equipItem(user.id, item.id);
    setEquipping(false);
    if (res.success) {
      showToast(`Equipped ${item.title}`, 'success');
    } else {
      showToast(res.error || 'Failed to equip item', 'error');
    }
  };

  return (
    <div className="space-y-6 relative">
      {toast && (
        <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 animate-in slide-in-from-top fade-in ${
          toast.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/50' : 'bg-red-500/20 text-red-400 border border-red-500/50'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <Flame className="w-4 h-4" />}
          {toast.message}
        </div>
      )}

      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-sm w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-xl font-bold text-white">Confirm Purchase</h3>
              <button onClick={() => setSelectedItem(null)} className="p-1 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-black border border-zinc-800 flex items-center justify-center mb-4">
                {(() => {
                  const Icon = getIconComponent(selectedItem.icon);
                  return <Icon className="w-10 h-10 text-purple-400" />;
                })()}
              </div>
              <h4 className="text-lg font-bold text-white text-center">{selectedItem.title}</h4>
              <p className="text-zinc-400 text-sm">{selectedItem.item_type}</p>
            </div>

            <div className="bg-black rounded-xl p-4 mb-6 border border-zinc-800 flex justify-between items-center">
              <span className="text-zinc-400 text-sm">Price</span>
              <div className="flex items-center gap-1 font-bold text-yellow-500">
                <Coins className="w-4 h-4" />
                {selectedItem.price.toLocaleString()}
              </div>
            </div>

            <button 
              onClick={handlePurchase}
              disabled={purchasing || coinBalance < selectedItem.price}
              className={`w-full py-3 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors ${
                coinBalance < selectedItem.price 
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {purchasing ? <Loader2 className="w-5 h-5 animate-spin" /> : 
                coinBalance < selectedItem.price ? 'Not enough coins' : 'Buy Now'
              }
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <Coins className="w-5 h-5 text-yellow-500" />
          </div>
          <div>
            <p className="text-sm text-zinc-400">Available Balance</p>
            <p className="text-xl font-bold text-white">{coinBalance.toLocaleString()}</p>
          </div>
        </div>
        <button onClick={() => navigate('/wallet')} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm font-medium transition-colors">
          History
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 py-2">
        {categories.length > 0 ? categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              activeCategory === cat 
                ? 'bg-white text-black' 
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            {cat}
          </button>
        )) : (
          <div className="text-zinc-500 text-sm">Loading categories...</div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((item) => {
          const ItemIcon = getIconComponent(item.icon);
          const isOwned = inventory.some(inv => inv.item_id === item.id);
          const isEquipped = inventory.some(inv => inv.item_id === item.id && inv.is_equipped);
          const canEquip = ['Profile Frame', 'Premium Badge', 'Username Color', 'Premium Theme', 'Story Templates'].includes(item.item_type);

          return (
            <div 
              key={item.id} 
              onClick={() => !isOwned && setSelectedItem(item)}
              className={`bg-zinc-900 rounded-xl p-4 border border-zinc-800 flex flex-col items-center text-center transition-colors relative overflow-hidden ${
                !isOwned ? 'hover:border-purple-500/50 group cursor-pointer' : ''
              }`}
            >
              {!isOwned && <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />}
              
              <div className={`w-16 h-16 rounded-full bg-black border border-zinc-800 flex items-center justify-center mb-3 transition-transform shadow-lg relative z-10 ${!isOwned ? 'group-hover:scale-110' : ''}`}>
                <ItemIcon className={`w-8 h-8 ${isOwned ? 'text-zinc-500' : 'text-purple-400'}`} />
              </div>
              <h4 className="text-white font-medium text-sm mb-1 relative z-10">{item.title}</h4>
              <p className="text-xs text-zinc-500 mb-4 relative z-10">{item.item_type}</p>
              
              {isOwned ? (
                canEquip ? (
                  <button 
                    onClick={(e) => !isEquipped && handleEquip(e, item)}
                    disabled={isEquipped || equipping}
                    className={`w-full py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors relative z-10 ${
                      isEquipped ? 'bg-zinc-800 text-purple-400 cursor-default' : 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer'
                    }`}
                  >
                    {isEquipped ? 'Equipped' : 'Equip'}
                  </button>
                ) : (
                  <button disabled className="w-full py-2 bg-zinc-800 text-zinc-500 rounded-lg text-sm font-bold flex items-center justify-center gap-1 relative z-10 cursor-default">
                    Purchased
                  </button>
                )
              ) : (
                <button className="w-full py-2 bg-zinc-800 group-hover:bg-purple-600 text-white rounded-lg text-sm font-bold flex items-center justify-center gap-1 transition-colors relative z-10">
                  <Coins className="w-3 h-3 text-yellow-500" />
                  {item.price.toLocaleString()}
                </button>
              )}
            </div>
          );
        })}
        {items.length === 0 && categories.length > 0 && (
          <div className="col-span-full text-center py-10 text-zinc-500">No items in this category.</div>
        )}
      </div>
    </div>
  );
}

interface Leader {
  id: string;
  rank: number;
  name: string;
  handle: string;
  points: number;
  avatar: string;
  isUser: boolean;
}

function LeaderboardTab() {
  const { user } = useAuthStore();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaders() {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(50);
        if (error) throw error;
        
        const sorted = (data || [])
          .map(p => {
            const meta = p.raw_user_meta_data || {};
            const coins = meta.coins || p.coins || 0;
            return {
              id: p.id,
              name: p.display_name || p.username || 'Unknown',
              handle: `@${p.username || 'user'}`,
              points: coins,
              avatar: p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.id}`,
              isUser: p.id === user?.id
            };
          })
          .sort((a, b) => b.points - a.points)
          .map((p, i) => ({ ...p, rank: i + 1 }));
          
        setLeaders(sorted.slice(0, 20));
      } catch (err: any) {
        if (err?.message && !err.message.includes("fetch") && !err.message.includes("table")) console.warn('RewardCenter notice:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLeaders();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <div className="p-4 bg-zinc-800/50 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">Global Ranking</h3>
        <select className="bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-purple-500">
          <option>All Time</option>
          <option>This Month</option>
          <option>This Week</option>
        </select>
      </div>
      <div className="divide-y divide-zinc-800">
        {leaders.map((leader) => (
          <div key={leader.id} className={`flex items-center justify-between p-4 ${leader.isUser ? 'bg-purple-900/20' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                leader.rank === 1 ? 'bg-yellow-500 text-black' :
                leader.rank === 2 ? 'bg-zinc-300 text-black' :
                leader.rank === 3 ? 'bg-amber-700 text-white' :
                'text-zinc-500'
              }`}>
                {leader.rank}
              </div>
              <img src={leader.avatar} alt={leader.name} className="w-10 h-10 rounded-full border border-zinc-700" />
              <div>
                <p className="text-white font-medium flex items-center gap-2">
                  {leader.name} {leader.isUser && <span className="bg-purple-600 text-[10px] px-1.5 py-0.5 rounded text-white font-bold">YOU</span>}
                </p>
                <p className="text-zinc-500 text-sm">{leader.handle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1 font-bold text-yellow-500">
              <Coins className="w-4 h-4" />
              {leader.points.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

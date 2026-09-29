import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gift, 
  Coins, 
  TrendingUp, 
  Award, 
  Shield, 
  Heart, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  Trash2, 
  Plus, 
  Search, 
  Check, 
  Settings, 
  User, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Play, 
  Flame, 
  Star, 
  Crown, 
  Rocket, 
  Trophy, 
  Activity, 
  Users, 
  X, 
  ChevronRight, 
  Filter, 
  Layers, 
  Download, 
  HelpCircle 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useWalletStore } from '../store/walletStore';
import { useGiftStore, GiftItem, GiftTransaction, SupporterRank } from '../store/giftStore';
import { Link } from 'react-router-dom';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Define interactive simulated creators
const SIMULATED_CREATORS = [
  { id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', username: 'emma_w', full_name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', category: 'Live Streamer' },
  { id: '84ad35bc-5be1-42b1-947a-e073538fd82d', username: 'jcarter', full_name: 'James Carter', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', category: 'OmniClips Star' },
  { id: '29209b5b-6a45-4650-aac7-50d6e2566c5e', username: 'sophia_l', full_name: 'Sophia Lee', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', category: 'Digital Artist' },
  { id: 'user-demo-id', username: 'rajsoni', full_name: 'Raj Soni', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', category: 'AI Creator' }
];

// Emoji dictionary for beautiful animated emojis
const ANIMATION_EMOJIS: Record<string, string> = {
  heart: '❤️',
  rose: '🌹',
  fire: '🔥',
  star: '⭐',
  diamond: '💎',
  crown: '👑',
  rocket: '🚀',
  gift_box: '🎁',
  trophy: '🏆',
  teddy_bear: '🐻',
  ring: '💍',
  sports_car: '🚗',
  castle: '🏰',
  money_rain: '💰',
  golden_crown: '👑',
  pumpkin: '🎃',
  snowglobe: '❄️',
  dragon: '🐲',
  bunny: '🐰',
  default: '🎁'
};

// Colors matching catalog categories
const CATEGORY_COLORS = {
  standard: 'from-purple-500 to-blue-500 text-blue-400',
  exclusive: 'from-amber-500 to-orange-500 text-amber-400',
  festival: 'from-red-500 to-rose-500 text-rose-400',
  seasonal: 'from-emerald-500 to-teal-500 text-emerald-400'
};

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  scale: number;
  rotate: number;
  duration: number;
  drift: number;
}

export default function GiftSystem() {
  const { user, profile } = useAuthStore();
  const walletStore = useWalletStore();
  const giftStore = useGiftStore();

  const [activeTab, setActiveTab] = useState<'shop' | 'creator' | 'leaderboard' | 'vault' | 'admin'>('shop');
  const [selectedCreator, setSelectedCreator] = useState(SIMULATED_CREATORS[0]);
  const [selectedItemType, setSelectedItemType] = useState<'profile' | 'post' | 'story' | 'omniclip' | 'live'>('profile');
  const [targetItemId, setTargetItemId] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [giftQuantity, setGiftQuantity] = useState<number>(1);
  const [selectedGiftId, setSelectedGiftId] = useState<string>('');
  
  // Leaderboard filters
  const [leaderboardTimeframe, setLeaderboardTimeframe] = useState<'daily' | 'weekly' | 'monthly' | 'lifetime'>('lifetime');

  // Animation Particle State
  const [particles, setParticles] = useState<Particle[]>([]);
  const [showHugeAnimation, setShowHugeAnimation] = useState(false);
  const [hugeGiftName, setHugeGiftName] = useState('');
  const [hugeGiftEmoji, setHugeGiftEmoji] = useState('🎁');

  // Admin states
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [editingGift, setEditingGift] = useState<Partial<GiftItem> | null>(null);
  const [isCreatingGift, setIsCreatingGift] = useState(false);
  const [newGiftForm, setNewGiftForm] = useState({
    name: '',
    cost: 50,
    animation: 'heart',
    category: 'standard' as any,
    is_limited: false,
    limited_stock: 100
  });

  // Load Initial Store Data
  useEffect(() => {
    giftStore.fetchCatalog();
    giftStore.fetchLeaderboard(leaderboardTimeframe);
    if (user?.id) {
      giftStore.fetchUserTransactions(user.id);
      giftStore.fetchUserInventory(user.id);
      giftStore.fetchCreatorMetrics(user.id);
      walletStore.fetchWalletData(user.id);
    }
    
    // Check if user has admin permissions
    if (profile?.role === 'super_admin' || profile?.role === 'admin') {
      setIsAdminMode(true);
    }
  }, [user?.id, profile?.role, leaderboardTimeframe]);

  // Handle selected gift changes
  useEffect(() => {
    if (giftStore.catalog.length > 0 && !selectedGiftId) {
      setSelectedGiftId(giftStore.catalog[0].id);
    }
  }, [giftStore.catalog, selectedGiftId]);

  // Helper: Trigger custom gift particle storm
  const triggerVisualAnimation = (gift: GiftItem, qty: number) => {
    const emoji = ANIMATION_EMOJIS[gift.animation] || '🎁';
    const totalParticles = Math.min(25 * qty, 100); // Limit count to ensure smooth framerate
    
    const newParticles: Particle[] = Array.from({ length: totalParticles }).map((_, i) => ({
      id: Date.now() + i,
      emoji,
      x: 10 + Math.random() * 80, // Viewport width %
      y: 100, // Starts at bottom
      scale: 0.5 + Math.random() * 1.5,
      rotate: Math.random() * 360,
      duration: 1.5 + Math.random() * 2.5,
      drift: -150 + Math.random() * 300
    }));

    setParticles(prev => [...prev, ...newParticles]);

    // Handle high-tier spectacular overlay
    if (gift.cost >= 250) {
      setHugeGiftName(gift.name);
      setHugeGiftEmoji(emoji);
      setShowHugeAnimation(true);
      setTimeout(() => setShowHugeAnimation(false), 4000);
    }

    // Clean up particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
    }, 4500);
  };

  const handleSendGift = async () => {
    if (!user?.id) return;
    if (!selectedGiftId) return;

    const gift = giftStore.catalog.find(g => g.id === selectedGiftId);
    if (!gift) return;

    const totalCost = gift.cost * giftQuantity;
    if ((walletStore.wallet?.coin_balance || 0) < totalCost) {
      alert(`Insufficient coins. This transaction requires ${totalCost} coins, but your current balance is ${walletStore.wallet?.coin_balance || 0} coins.`);
      return;
    }

    // Send Gift Action
    for (let i = 0; i < giftQuantity; i++) {
      const res = await giftStore.sendVirtualGift(
        user.id,
        selectedCreator.id,
        gift.id,
        selectedItemType,
        targetItemId || `mock-${selectedItemType}-${Math.floor(Math.random()*1000)}`
      );

      if (res.success) {
        triggerVisualAnimation(gift, giftQuantity);
      } else {
        alert(res.error || 'Failed to send virtual gift.');
        break;
      }
    }

    // Refresh wallet
    walletStore.fetchWalletData(user.id);
    setCustomMessage('');
  };

  // Admin: Catalog managers
  const handleCreateGift = async () => {
    await giftStore.createGiftCatalogItem({
      name: newGiftForm.name,
      cost: Number(newGiftForm.cost),
      animation: newGiftForm.animation,
      category: newGiftForm.category,
      is_limited: newGiftForm.is_limited,
      limited_stock: newGiftForm.is_limited ? Number(newGiftForm.limited_stock) : null,
      is_active: true
    });
    setIsCreatingGift(false);
    setNewGiftForm({
      name: '',
      cost: 50,
      animation: 'heart',
      category: 'standard',
      is_limited: false,
      limited_stock: 100
    });
  };

  const handleUpdateGift = async (id: string, updates: Partial<GiftItem>) => {
    await giftStore.updateGiftCatalogItem(id, updates);
    setEditingGift(null);
  };

  const handleDeleteGift = async (id: string) => {
    if (confirm('Are you sure you want to remove this virtual gift from the catalog?')) {
      await giftStore.deleteGiftCatalogItem(id);
    }
  };

  const handleRefundTx = async (txId: string) => {
    if (confirm(`Do you wish to initiate an official administrative reversal/refund for transaction ID ${txId}? This will debit coins back from the creator and credit the sender.`)) {
      const success = await giftStore.refundGiftTransaction(txId);
      if (success) {
        alert('Transaction successfully refunded. User ledgers have been re-balanced.');
        if (user?.id) {
          giftStore.fetchUserTransactions(user.id);
          walletStore.fetchWalletData(user.id);
        }
      } else {
        alert('Refund transaction failed. Please ensure the creator has sufficient coins to execute deduction or verify log consistency.');
      }
    }
  };

  // Recharts Helper: Process chart data
  const chartData = [
    { name: 'Mon', coins: 450, gifts: 5 },
    { name: 'Tue', coins: 950, gifts: 12 },
    { name: 'Wed', coins: 350, gifts: 8 },
    { name: 'Thu', coins: 1550, gifts: 15 },
    { name: 'Fri', coins: 1200, gifts: 9 },
    { name: 'Sat', coins: 2100, gifts: 22 },
    { name: 'Sun', coins: 2800, gifts: 35 },
  ];

  const giftShareData = [
    { name: 'Heart ❤️', value: 45, color: '#f43f5e' },
    { name: 'Rose 🌹', value: 25, color: '#ec4899' },
    { name: 'Fire 🔥', value: 15, color: '#f97316' },
    { name: 'Diamond 💎', value: 10, color: '#06b6d4' },
    { name: 'Crown 👑', value: 5, color: '#eab308' },
  ];

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-purple-600/30 p-4 pb-20 md:p-6" id="gift-system-root">
      
      {/* 1. Header Hero section */}
      <div className="max-w-4xl mx-auto mb-8 bg-gradient-to-r from-purple-950/40 via-black to-zinc-900/40 border border-purple-900/30 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6" id="gift-header-hero">
        <div className="space-y-3 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-xs font-semibold tracking-wider uppercase border border-purple-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Interactive Creator Economy
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-purple-400 bg-clip-text text-transparent">
            Omnix Virtual Gifts
          </h1>
          <p className="text-sm text-zinc-400 max-w-lg">
            Support your favorite creators, streamers, and stars in real-time. Send beautiful animated gifts with standard coin ledger synchronization.
          </p>
        </div>
        
        {/* User Coins Display widget */}
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-5 w-full md:w-auto min-w-[220px] flex flex-col gap-3 shadow-xl" id="gift-user-wallet-card">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>MY LEDGER BALANCE</span>
            {giftStore.useLocalFallback && <span className="text-amber-500 font-bold">SANDBOX</span>}
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-600/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-md">
              <Coins className="w-5.5 h-5.5" />
            </div>
            <div>
              <div className="text-2xl font-black font-mono tracking-tight text-white">
                {walletStore.wallet?.coin_balance?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-zinc-500">Omnix Gold Coins</div>
            </div>
          </div>
          <Link 
            to="/coin-shop" 
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold text-center transition-all shadow-md flex items-center justify-center gap-1.5"
            id="buy-coins-shortcut"
          >
            <Coins className="w-3.5 h-3.5" /> Get More Coins
          </Link>
        </div>
      </div>

      {/* 2. Interactive Navigation Tabs */}
      <div className="max-w-4xl mx-auto mb-6 flex overflow-x-auto no-scrollbar border-b border-zinc-800 gap-2" id="gift-tabs-nav">
        <button
          onClick={() => setActiveTab('shop')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all shrink-0
            ${activeTab === 'shop' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}
          `}
          id="tab-btn-shop"
        >
          <Gift className="w-4 h-4" /> Send Gifts
        </button>
        <button
          onClick={() => setActiveTab('creator')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all shrink-0
            ${activeTab === 'creator' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}
          `}
          id="tab-btn-creator"
        >
          <TrendingUp className="w-4 h-4" /> Creator Dashboard
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all shrink-0
            ${activeTab === 'leaderboard' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}
          `}
          id="tab-btn-leaderboard"
        >
          <Award className="w-4 h-4" /> Supporters
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all shrink-0
            ${activeTab === 'vault' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-400 hover:text-zinc-200'}
          `}
          id="tab-btn-vault"
        >
          <Layers className="w-4 h-4" /> My Vault
        </button>
        {isAdminMode && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all shrink-0 text-red-400
              ${activeTab === 'admin' ? 'border-red-500 bg-red-950/10' : 'border-transparent hover:text-red-300'}
            `}
            id="tab-btn-admin"
          >
            <Shield className="w-4 h-4" /> Administrative
          </button>
        )}
      </div>

      {/* 3. Primary Content Section */}
      <div className="max-w-4xl mx-auto" id="gift-tab-content">
        
        {/* TAB 1: SEND GIFTS (SHOP) */}
        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="gift-shop-layout">
            
            {/* Catalog Grid (Left Column) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold tracking-tight">Gift Catalog</h3>
                <span className="text-xs text-zinc-500 font-mono uppercase">
                  {giftStore.catalog.length} available items
                </span>
              </div>

              {/* Grid representation */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" id="gift-catalog-grid">
                {giftStore.catalog.map(gift => {
                  const isSelected = selectedGiftId === gift.id;
                  const emoji = ANIMATION_EMOJIS[gift.animation] || '🎁';
                  return (
                    <button
                      key={gift.id}
                      onClick={() => setSelectedGiftId(gift.id)}
                      className={`relative flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all group overflow-hidden
                        ${isSelected 
                          ? 'bg-purple-950/20 border-purple-500 shadow-purple-900/10 shadow-lg' 
                          : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700'
                        }
                      `}
                      id={`gift-card-${gift.id}`}
                    >
                      {/* Limited Edition tag */}
                      {gift.is_limited && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-[10px] font-bold text-rose-400 tracking-wider uppercase">
                          LIMITED
                        </div>
                      )}

                      {/* Animated representation container */}
                      <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center text-3xl mb-3 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        {emoji}
                      </div>

                      {/* Details */}
                      <div className="space-y-1 w-full">
                        <div className="text-sm font-bold text-white tracking-tight truncate">
                          {gift.name}
                        </div>
                        <div className="text-xs text-zinc-400 font-mono uppercase tracking-wide">
                          {gift.category}
                        </div>
                        <div className="flex items-center justify-center gap-1 text-purple-400 font-mono text-xs font-bold mt-1">
                          <Coins className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {gift.cost}
                        </div>
                      </div>

                      {/* Stock overlay for limited */}
                      {gift.is_limited && gift.limited_stock !== null && (
                        <div className="text-[10px] text-zinc-500 mt-2 font-mono">
                          Stock: {gift.limited_stock} left
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Gifting Wizard Panel (Right Column) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-5 space-y-4 shadow-xl" id="gifting-wizard-card">
                <h3 className="text-base font-bold tracking-tight border-b border-zinc-800 pb-2">
                  Sender Wizard
                </h3>

                {/* 1. Target Creator Select */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                    Select Target Creator
                  </label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                    {SIMULATED_CREATORS.map(creator => {
                      const isTarget = selectedCreator.id === creator.id;
                      return (
                        <button
                          key={creator.id}
                          onClick={() => setSelectedCreator(creator)}
                          className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left transition-all
                            ${isTarget 
                              ? 'bg-purple-900/10 border-purple-500' 
                              : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                            }
                          `}
                          id={`target-creator-${creator.username}`}
                        >
                          <img 
                            src={creator.avatar} 
                            alt={creator.full_name} 
                            className="w-8 h-8 rounded-full border border-zinc-800 shrink-0 object-cover" 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-white truncate">{creator.full_name}</div>
                            <div className="text-[10px] text-zinc-400 truncate">@{creator.username}</div>
                          </div>
                          {isTarget && (
                            <div className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                              <Check className="w-3 h-3" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Item Context type */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                    Gifting Context
                  </label>
                  <div className="grid grid-cols-3 gap-1.5" id="context-selector">
                    {(['profile', 'post', 'story', 'omniclip', 'live'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setSelectedItemType(type)}
                        className={`py-1.5 px-2 rounded-lg border text-[10px] font-bold uppercase tracking-wider text-center transition-all
                          ${selectedItemType === type 
                            ? 'bg-purple-600 text-white border-purple-500' 
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }
                        `}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Resource ID */}
                {selectedItemType !== 'profile' && (
                  <div className="space-y-2">
                    <label className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                      Target {selectedItemType} ID (Optional)
                    </label>
                    <input 
                      type="text"
                      value={targetItemId}
                      onChange={e => setTargetItemId(e.target.value)}
                      placeholder={`e.g. ${selectedItemType}_942_11`}
                      className="w-full px-3 py-2 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* 3. Quantity Combo Multipliers */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                    Quantity Combo
                  </label>
                  <div className="grid grid-cols-6 gap-1" id="qty-selector">
                    {([1, 5, 10, 25, 50, 100] as const).map(qty => (
                      <button
                        key={qty}
                        onClick={() => setGiftQuantity(qty)}
                        className={`py-1.5 rounded-lg border text-xs font-bold font-mono transition-all
                          ${giftQuantity === qty 
                            ? 'bg-purple-600 text-white border-purple-500' 
                            : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                          }
                        `}
                      >
                        {qty}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Optional message */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-400 font-medium tracking-wide uppercase">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={e => setCustomMessage(e.target.value)}
                    placeholder="Write a message to creator..."
                    className="w-full h-16 p-3 text-xs bg-zinc-900 border border-zinc-800 rounded-xl focus:border-purple-500 focus:outline-none resize-none"
                    maxLength={100}
                  />
                </div>

                {/* Price review */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Gift Cost:</span>
                    <span className="font-mono text-white">
                      {giftStore.catalog.find(g => g.id === selectedGiftId)?.cost || 0} Coins
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Multiplier Combo:</span>
                    <span className="font-mono text-white">x{giftQuantity}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-bold border-t border-dashed border-zinc-800 pt-2 text-white">
                    <span>Total Cost:</span>
                    <span className="font-mono text-purple-400 flex items-center gap-1 text-base">
                      <Coins className="w-4 h-4 shrink-0" />
                      {((giftStore.catalog.find(g => g.id === selectedGiftId)?.cost || 0) * giftQuantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Send action Button */}
                <button
                  onClick={handleSendGift}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-md shadow-purple-950/20 flex items-center justify-center gap-2"
                  id="send-gift-trigger"
                >
                  <Gift className="w-4 h-4" />
                  Send Animated Gift
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CREATOR DASHBOARD */}
        {activeTab === 'creator' && (
          <div className="space-y-6" id="creator-dashboard-view">
            
            {/* Stats row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" id="creator-metrics-cards">
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg">
                <div className="text-xs text-zinc-500 font-mono uppercase">TOTAL GIFT COINS EARNED</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {((giftStore.creatorEarnings?.total_coins_earned || 24500)).toLocaleString()}
                  </div>
                  <div className="text-xs text-purple-400 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +15.4%
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500">Fully withdrawable balance conversion</div>
              </div>

              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg">
                <div className="text-xs text-zinc-500 font-mono uppercase">TOTAL GIFTS RECEIVED</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black font-mono tracking-tight text-white">
                    {((giftStore.creatorEarnings?.total_gifts_received || 142)).toLocaleString()}
                  </div>
                  <div className="text-xs text-emerald-400 font-bold flex items-center gap-0.5">
                    <ArrowUpRight className="w-3 h-3" /> +8.2%
                  </div>
                </div>
                <div className="text-[11px] text-zinc-500">From 54 unique supporters</div>
              </div>

              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 flex flex-col gap-2 shadow-lg">
                <div className="text-xs text-zinc-500 font-mono uppercase">CONVERSION CASH OUT</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black font-mono tracking-tight text-emerald-400">
                    ${(((giftStore.creatorEarnings?.total_coins_earned || 24500) * 0.01)).toFixed(2)}
                  </div>
                  <div className="text-xs text-zinc-500">USD</div>
                </div>
                <div className="text-[11px] text-zinc-500">Est. payout at $0.01 per coin</div>
              </div>
            </div>

            {/* Visualizer charts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="creator-charts-row">
              {/* Earnings line chart */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold tracking-tight">Daily Gifting Earnings (Coins)</h3>
                <div className="h-60" id="earnings-trend-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCoins" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="name" stroke="#71717a" fontSize={10} tickLine={false} />
                      <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }} />
                      <Area type="monotone" dataKey="coins" stroke="#a78bfa" fillOpacity={1} fill="url(#colorCoins)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gift breakdown pie */}
              <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
                <h3 className="text-sm font-bold tracking-tight">Gift Catalog Popularity Share</h3>
                <div className="h-60 flex flex-col sm:flex-row items-center justify-between" id="share-pie-chart">
                  <div className="w-full sm:w-1/2 h-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={giftShareData}
                          cx="50%"
                          cy="50%"
                          innerRadius={45}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {giftShareData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#09090b', borderColor: '#27272a', color: '#fff' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 space-y-2 mt-4 sm:mt-0">
                    {giftShareData.map((g, i) => (
                      <div key={g.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                          {g.name}
                        </div>
                        <span className="font-bold font-mono text-white">{g.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Received History List */}
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold tracking-tight">Gift Receipt History Log</h3>
                <span className="text-xs text-zinc-500 font-mono">LATEST INCOMING</span>
              </div>

              <div className="space-y-2" id="incoming-gifts-list">
                {giftStore.transactions.length === 0 ? (
                  <div className="text-center py-8 text-zinc-500 text-xs">
                    No gift transactions recorded yet for this creator profile.
                  </div>
                ) : (
                  giftStore.transactions.map(tx => {
                    const isSender = tx.sender_id === user?.id;
                    const emoji = ANIMATION_EMOJIS[tx.gift_animation || ''] || '🎁';
                    return (
                      <div 
                        key={tx.id}
                        className="flex items-center justify-between p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-xl hover:bg-zinc-900/60 transition-all text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                            {emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-bold flex items-center gap-1.5 truncate">
                              {isSender ? (
                                <>
                                  <span>To creator</span>
                                  <span className="text-purple-400">@{tx.receiver_username || 'creator'}</span>
                                </>
                              ) : (
                                <>
                                  <span>From supporter</span>
                                  <span className="text-purple-400">@{tx.sender_username || 'supporter'}</span>
                                </>
                              )}
                            </div>
                            <div className="text-zinc-500 text-[10px] uppercase font-mono flex items-center gap-1 mt-0.5">
                              <span>Gift: {tx.gift_name}</span>
                              <span>•</span>
                              <span>Context: {tx.item_type} ({tx.item_id})</span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className={`font-bold font-mono flex items-center gap-0.5 justify-end text-sm
                            ${isSender ? 'text-red-400' : 'text-emerald-400'}
                          `}>
                            {isSender ? '-' : '+'}{tx.coin_cost}
                            <Coins className="w-3.5 h-3.5 text-purple-400" />
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {new Date(tx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-6" id="supporters-leaderboard-view">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold tracking-tight">Supporters Leaderboard</h3>
                <p className="text-xs text-zinc-400">Top patrons sending coin-backed animated virtual gifts on Omnix</p>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl" id="leaderboard-timeframe">
                {(['daily', 'weekly', 'monthly', 'lifetime'] as const).map(time => (
                  <button
                    key={time}
                    onClick={() => setLeaderboardTimeframe(time)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                      ${leaderboardTimeframe === time 
                        ? 'bg-purple-600 text-white' 
                        : 'text-zinc-400 hover:text-zinc-200'
                      }
                    `}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>

            {/* Top 3 Spotlight podium */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="leaderboard-podium">
              {giftStore.topSupporters.slice(0, 3).map((rank, i) => {
                const colors = ['border-amber-500 shadow-amber-950/10', 'border-zinc-400 shadow-zinc-950/10', 'border-amber-800 shadow-amber-950/10'];
                const badges = ['🏆 #1 patron', '🥈 #2 supporter', '🥉 #3 supporter'];
                
                return (
                  <div 
                    key={rank.user_id}
                    className={`bg-zinc-950 border rounded-2xl p-5 text-center flex flex-col items-center gap-3 shadow-lg relative overflow-hidden
                      ${colors[i] || 'border-zinc-800'}
                    `}
                  >
                    <div className="absolute top-2.5 right-2.5 text-xs font-bold uppercase font-mono tracking-widest text-zinc-500">
                      #{i+1}
                    </div>

                    <div className="relative">
                      <div className="w-16 h-16 rounded-full bg-zinc-900 border-2 border-zinc-800 overflow-hidden">
                        <img 
                          src={rank.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${rank.username}`} 
                          alt={rank.username} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-purple-600 border border-purple-500 flex items-center justify-center text-xs text-white font-mono font-black shadow">
                        {i+1}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white truncate max-w-[180px]">{rank.full_name}</div>
                      <div className="text-xs text-purple-400 font-medium truncate">@{rank.username}</div>
                    </div>

                    <div className="px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-300 font-mono">
                      {badges[i]}
                    </div>

                    <div className="pt-2 border-t border-zinc-800 w-full">
                      <div className="text-xs text-zinc-500 font-mono">TOTAL GIFTED</div>
                      <div className="text-xl font-black font-mono tracking-tight text-white flex items-center justify-center gap-1">
                        <Coins className="w-4 h-4 text-purple-400" />
                        {rank.total_gifted_coins.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-zinc-400 mt-1">{rank.gifts_count} individual gifts sent</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Leaderboard Table listing */}
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg" id="leaderboard-table-list">
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/20">
                <h4 className="text-xs font-bold text-zinc-400 font-mono uppercase tracking-wider">Patron Rankings</h4>
                <span className="text-[10px] text-zinc-500">SORTED BY COINS INITIATED</span>
              </div>

              <div className="divide-y divide-zinc-800">
                {giftStore.topSupporters.map((rank, idx) => (
                  <div 
                    key={rank.user_id}
                    className="flex items-center justify-between p-4 hover:bg-zinc-900/20 transition-all text-xs"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-6 text-center font-black font-mono text-zinc-500 text-sm">
                        {idx + 1}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden shrink-0">
                        <img 
                          src={rank.avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${rank.username}`} 
                          alt={rank.username} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="text-white font-bold truncate">{rank.full_name}</div>
                        <div className="text-zinc-500 text-[10px] font-mono">@{rank.username}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="font-bold text-white font-mono flex items-center gap-1 justify-end">
                          <Coins className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          {rank.total_gifted_coins.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">{rank.gifts_count} gifts sent</div>
                      </div>
                      
                      <div className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider
                        ${rank.badge === 'Gold Supporter' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : ''}
                        ${rank.badge === 'Silver Supporter' ? 'bg-zinc-400/10 text-zinc-300 border border-zinc-400/20' : ''}
                        ${rank.badge === 'Bronze Supporter' ? 'bg-amber-800/10 text-amber-600 border border-amber-800/20' : ''}
                        ${rank.badge === 'Elite Supporter' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : ''}
                      `}>
                        {rank.badge}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MY VAULT (INVENTORY) */}
        {activeTab === 'vault' && (
          <div className="space-y-6" id="user-vault-view">
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
              <div className="space-y-2 text-center md:text-left">
                <h3 className="text-lg font-bold tracking-tight">My Gift Vault Inventory</h3>
                <p className="text-xs text-zinc-400 max-w-md">
                  Review the collection of premium virtual gifts you have purchased or received. Show off your collected credentials!
                </p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center shrink-0 min-w-[150px]">
                <div className="text-xs text-zinc-500 font-mono uppercase">UNIQUE UNLOCKED</div>
                <div className="text-2xl font-black font-mono text-purple-400 mt-1">
                  {giftStore.inventory.length} Gifts
                </div>
              </div>
            </div>

            {/* Inventory listing */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="vault-inventory-grid">
              {giftStore.inventory.length === 0 ? (
                <div className="col-span-full bg-zinc-950 border border-zinc-850 p-12 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-500 mx-auto text-xl">
                    🎁
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Your Vault is Empty</div>
                    <p className="text-xs text-zinc-500 mt-1">Send your first virtual gift to seed inventory records!</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('shop')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Go to Gift Shop
                  </button>
                </div>
              ) : (
                giftStore.inventory.map(item => {
                  const emoji = ANIMATION_EMOJIS[item.gift_animation || ''] || '🎁';
                  return (
                    <div 
                      key={item.id}
                      className="bg-zinc-950/60 border border-zinc-800/80 rounded-2xl p-4 flex flex-col items-center text-center relative overflow-hidden shadow"
                    >
                      {item.is_limited && (
                        <div className="absolute top-2 left-2 px-1.5 py-0.5 bg-rose-500/15 border border-rose-500/30 rounded text-[9px] font-bold text-rose-400">
                          LIMITED
                        </div>
                      )}

                      <div className="w-14 h-14 rounded-full bg-zinc-900 flex items-center justify-center text-2xl mb-3 shadow-inner">
                        {emoji}
                      </div>

                      <div className="text-xs font-bold text-white truncate max-w-full mb-1">
                        {item.gift_name || 'Gift Item'}
                      </div>

                      <div className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-bold text-purple-400 font-mono mt-2">
                        Quantity: {item.quantity}x
                      </div>
                      
                      <div className="text-[9px] text-zinc-600 font-mono mt-3">
                        Obtained: {new Date(item.obtained_at).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

        {/* TAB 5: ADMINISTRATIVE CONTROLS */}
        {activeTab === 'admin' && isAdminMode && (
          <div className="space-y-6" id="admin-management-view">
            
            {/* Catalog editor controller */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold tracking-tight">Administrative Gift Catalog Control Panel</h3>
                  <p className="text-xs text-zinc-400">Manage interactive catalog parameters, stocking, active flags, and cost thresholds</p>
                </div>
                <button
                  onClick={() => setIsCreatingGift(!isCreatingGift)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  id="add-new-gift-trigger"
                >
                  <Plus className="w-3.5 h-3.5" /> New Catalog Item
                </button>
              </div>

              {/* Create/Edit dialog panel overlay */}
              {isCreatingGift && (
                <div className="bg-zinc-900/90 border border-purple-900/30 rounded-xl p-4 space-y-4" id="create-gift-form">
                  <h4 className="text-sm font-bold text-purple-400">Create New Virtual Gift</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400">Gift Name</label>
                      <input 
                        type="text" 
                        value={newGiftForm.name}
                        onChange={e => setNewGiftForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg focus:border-purple-500 text-white"
                        placeholder="e.g. Magic Wand"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Coin Cost</label>
                      <input 
                        type="number" 
                        value={newGiftForm.cost}
                        onChange={e => setNewGiftForm(prev => ({ ...prev, cost: Number(e.target.value) }))}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg focus:border-purple-500 text-white font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Animation Theme Key</label>
                      <select 
                        value={newGiftForm.animation}
                        onChange={e => setNewGiftForm(prev => ({ ...prev, animation: e.target.value }))}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg focus:border-purple-500 text-white"
                      >
                        {Object.keys(ANIMATION_EMOJIS).map(k => (
                          <option key={k} value={k}>{k} {ANIMATION_EMOJIS[k]}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-zinc-400">Category Tag</label>
                      <select 
                        value={newGiftForm.category}
                        onChange={e => setNewGiftForm(prev => ({ ...prev, category: e.target.value as any }))}
                        className="w-full p-2 bg-black border border-zinc-800 rounded-lg focus:border-purple-500 text-white"
                      >
                        <option value="standard">Standard</option>
                        <option value="exclusive">Exclusive</option>
                        <option value="festival">Festival</option>
                        <option value="seasonal">Seasonal</option>
                      </select>
                    </div>
                    <div className="space-y-1.5 flex items-center gap-2 pt-5">
                      <input 
                        type="checkbox" 
                        id="check-limited"
                        checked={newGiftForm.is_limited}
                        onChange={e => setNewGiftForm(prev => ({ ...prev, is_limited: e.target.checked }))}
                        className="w-4 h-4 rounded border-zinc-800 text-purple-600 focus:ring-purple-500 bg-black"
                      />
                      <label htmlFor="check-limited" className="text-zinc-400 cursor-pointer select-none">Limited Edition Stock</label>
                    </div>
                    {newGiftForm.is_limited && (
                      <div className="space-y-1">
                        <label className="text-zinc-400">Initial Stock</label>
                        <input 
                          type="number" 
                          value={newGiftForm.limited_stock}
                          onChange={e => setNewGiftForm(prev => ({ ...prev, limited_stock: Number(e.target.value) }))}
                          className="w-full p-2 bg-black border border-zinc-800 rounded-lg focus:border-purple-500 text-white font-mono"
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <button 
                      onClick={() => setIsCreatingGift(false)} 
                      className="px-3.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleCreateGift} 
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold"
                    >
                      Publish Item
                    </button>
                  </div>
                </div>
              )}

              {/* Table list of admin gifts */}
              <div className="overflow-x-auto no-scrollbar" id="admin-catalog-table">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400 font-mono uppercase tracking-wider">
                      <th className="py-3 px-2">Gift Name</th>
                      <th className="py-3 px-2">Cost</th>
                      <th className="py-3 px-2">Category</th>
                      <th className="py-3 px-2">Animation</th>
                      <th className="py-3 px-2">Stock Type</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-900">
                    {giftStore.catalog.map(gift => (
                      <tr key={gift.id} className="hover:bg-zinc-900/30 transition-all">
                        <td className="py-3 px-2 font-bold text-white">{gift.name}</td>
                        <td className="py-3 px-2 font-mono text-purple-400 font-bold">{gift.cost} Coins</td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 capitalize font-mono text-[10px]">
                            {gift.category}
                          </span>
                        </td>
                        <td className="py-3 px-2 font-mono">
                          {gift.animation} {ANIMATION_EMOJIS[gift.animation] || ''}
                        </td>
                        <td className="py-3 px-2 font-mono text-zinc-400">
                          {gift.is_limited 
                            ? `Limited (${gift.limited_stock !== null ? gift.limited_stock : 'sold-out'})` 
                            : 'Unlimited Standard'
                          }
                        </td>
                        <td className="py-3 px-2 text-right space-x-2">
                          <button
                            onClick={() => {
                              const newCostStr = prompt('Enter new Coin Cost for this gift:', gift.cost.toString());
                              if (newCostStr) {
                                handleUpdateGift(gift.id, { cost: Number(newCostStr) });
                              }
                            }}
                            className="text-[11px] text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-2 py-1 rounded"
                          >
                            Edit Cost
                          </button>
                          <button
                            onClick={() => handleDeleteGift(gift.id)}
                            className="text-[11px] text-red-400 hover:text-red-300 hover:bg-red-500/5 px-2 py-1 rounded"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Global Gifting Transactions ledger for administrative refunds */}
            <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-lg">
              <div className="space-y-0.5 border-b border-zinc-800 pb-3">
                <h3 className="text-base font-bold tracking-tight">Platform Gifting Transaction Ledger</h3>
                <p className="text-xs text-zinc-400">Global audit of virtual gift transfers. Administrative reversal triggers refund reversals on wallet stores.</p>
              </div>

              <div className="space-y-2" id="global-ledger-transactions">
                {giftStore.transactions.length === 0 ? (
                  <div className="text-center py-6 text-zinc-500 text-xs">
                    No public transactions recorded in current session. Send a gift to trigger ledger records.
                  </div>
                ) : (
                  giftStore.transactions.map(tx => {
                    const emoji = ANIMATION_EMOJIS[tx.gift_animation || ''] || '🎁';
                    return (
                      <div 
                        key={tx.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-zinc-900/30 border border-zinc-800/80 rounded-xl hover:bg-zinc-900/60 transition-all gap-4 text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-xl shrink-0">
                            {emoji}
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-bold flex items-center gap-1.5 truncate">
                              <span className="text-purple-400">@{tx.sender_username || 'Sender'}</span>
                              <span className="text-zinc-500 font-normal">gifted</span>
                              <span className="text-purple-400">@{tx.receiver_username || 'Creator'}</span>
                            </div>
                            <div className="text-zinc-500 text-[10px] uppercase font-mono mt-0.5 truncate">
                              ID: {tx.id} • Gift: {tx.gift_name} • cost: {tx.coin_cost} coins • context: {tx.item_type}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 justify-between sm:justify-end shrink-0">
                          <div className="text-right sm:text-left">
                            <div className="font-mono text-zinc-400 font-bold flex items-center gap-1 justify-end sm:justify-start">
                              <Coins className="w-3.5 h-3.5 text-purple-400" />
                              {tx.coin_cost}
                            </div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                              {new Date(tx.created_at).toLocaleDateString()} {new Date(tx.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleRefundTx(tx.id)}
                            className="px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all"
                          >
                            Refund Gift
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* 4. REAL-TIME BEAUTIFUL FULL-SCREEN VECTOR PARTICLE CANVAS OVERLAY */}
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" id="particle-overlay-container">
        <AnimatePresence>
          {particles.map(p => (
            <motion.div
              key={p.id}
              initial={{ x: `${p.x}vw`, y: '110vh', scale: 0, opacity: 0, rotate: p.rotate }}
              animate={{ 
                y: '-10vh', 
                x: `${p.x + (p.drift / 20)}vw`,
                scale: p.scale, 
                opacity: [0, 1, 1, 0],
                rotate: p.rotate + 360 
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: p.duration, ease: 'easeOut' }}
              className="absolute text-3xl select-none"
            >
              {p.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Spectacular Overlay for Luxury Gifting (Diamond, Crown, Rocket, etc.) */}
      <AnimatePresence>
        {showHugeAnimation && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md pointer-events-none"
            id="spectacular-luxury-overlay"
          >
            <motion.div 
              initial={{ scale: 0.3, y: 100 }}
              animate={{ scale: [0.3, 1.1, 1], y: 0 }}
              exit={{ scale: 1.5, opacity: 0, y: -100 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-center p-8 rounded-3xl bg-gradient-to-tr from-purple-900/30 via-zinc-950 to-indigo-950/30 border border-purple-500/20 max-w-sm flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden"
            >
              {/* Spinning particle stars in background */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.1)_0,transparent_60%)]" />
              
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}
                className="text-7xl relative z-10"
              >
                {hugeGiftEmoji}
              </motion.div>

              <div className="space-y-1 relative z-10">
                <div className="text-xs text-purple-400 font-mono font-bold uppercase tracking-widest">SPECTACULAR LUXURY GIFT</div>
                <h4 className="text-2xl font-black text-white tracking-tight">{hugeGiftName}!</h4>
                <p className="text-xs text-zinc-400 max-w-xs px-4">
                  A spectacular virtual token of high appreciation has been sent, lighting up the platform.
                </p>
              </div>

              {/* Sparks confetti */}
              <div className="flex gap-1.5 text-lg mt-1 relative z-10">
                <span>⚡</span>
                <span>✨</span>
                <span>🔥</span>
                <span>⭐</span>
                <span>✨</span>
                <span>⚡</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

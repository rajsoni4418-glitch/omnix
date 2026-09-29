import React, { useState, useEffect } from 'react';
import { 
  Wallet as WalletIcon, Coins, ArrowUpRight, ArrowDownLeft, Clock, 
  ShieldCheck, CreditCard, Loader2, Search, Download, Gift, 
  TrendingUp, Plus, ShieldAlert, CheckCircle2, FileText, Calendar, 
  ArrowRight, Info, AlertTriangle, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../store/authStore';
import { useWalletStore, WalletTransaction } from '../store/walletStore';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid 
} from 'recharts';

export default function Wallet() {
  const { user } = useAuthStore();
  const { 
    wallet, 
    transactions, 
    isLoading, 
    error, 
    fetchWalletData, 
    executeTransaction, 
    downloadStatement 
  } = useWalletStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'shop'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Gift Simulator States
  const [giftRecipient, setGiftRecipient] = useState('');
  const [giftAmount, setGiftAmount] = useState(100);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // Selected Transaction for detail modal
  const [selectedTx, setSelectedTx] = useState<WalletTransaction | null>(null);

  useEffect(() => {
    if (user) {
      fetchWalletData(user.id);
    }
  }, [user, fetchWalletData]);

  // Handle message timeouts
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage || error) {
      const timer = setTimeout(() => setErrorMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, error]);

  const handleClaimDailyReward = async () => {
    if (!user) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const todayStr = new Date().toISOString().split('T')[0];
    const refId = `daily_claim_${user.id}_${todayStr}`;

    const success = await executeTransaction(
      user.id,
      50,
      'daily_reward',
      'Daily Login Reward claimed!',
      'system',
      refId
    );

    setIsProcessing(false);
    if (success) {
      setSuccessMessage('Successfully claimed 50 daily reward coins!');
    } else {
      setErrorMessage(useWalletStore.getState().error || 'Duplicate claim detected for today!');
    }
  };

  const handleBuyCoinPackage = async (coins: number, usdPrice: number) => {
    if (!user) return;
    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const refId = `coin_purchase_${Date.now()}`;
    const success = await executeTransaction(
      user.id,
      coins,
      'coin_purchase',
      `Purchased ${coins.toLocaleString()} Coins Package`,
      'purchase_gateway',
      refId
    );

    setIsProcessing(false);
    if (success) {
      setSuccessMessage(`Successfully purchased ${coins.toLocaleString()} coins!`);
    } else {
      setErrorMessage(useWalletStore.getState().error || 'Coin purchase failed.');
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !giftRecipient) return;
    if (giftAmount <= 0) {
      setErrorMessage('Please enter a positive amount of coins.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const refId = `gift_sent_${Date.now()}`;
    const success = await executeTransaction(
      user.id,
      -giftAmount,
      'gift_sent',
      `Sent ${giftAmount} Coins to @${giftRecipient.trim()}`,
      'user_gift',
      refId
    );

    setIsProcessing(false);
    if (success) {
      setSuccessMessage(`Successfully gifted ${giftAmount} coins to @${giftRecipient.trim()}!`);
      setShowGiftModal(false);
      setGiftRecipient('');
    } else {
      setErrorMessage(useWalletStore.getState().error || 'Gift transmission failed.');
    }
  };

  // Prepare Chart Data
  const getChartData = () => {
    if (transactions.length === 0) {
      return [{ date: 'Join', balance: 100 }];
    }

    // Build cumulative running balance starting from the oldest
    const cumulative: { date: string; balance: number }[] = [];
    let running = 0;

    const sortedTxs = [...transactions].reverse();
    sortedTxs.forEach((tx, idx) => {
      running += tx.amount;
      cumulative.push({
        date: new Date(tx.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: running
      });
    });

    // If only one data point, pad it
    if (cumulative.length === 1) {
      return [{ date: 'Start', balance: 100 }, ...cumulative];
    }

    return cumulative;
  };

  // Filter and Search Transactions
  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    if (filterType === 'credits') return matchesSearch && tx.amount > 0;
    if (filterType === 'debits') return matchesSearch && tx.amount < 0;
    if (filterType === 'rewards') return matchesSearch && tx.type.includes('reward');
    if (filterType === 'purchases') return matchesSearch && tx.type === 'coin_purchase';
    if (filterType === 'gifts') return matchesSearch && (tx.type === 'gift_sent' || tx.type === 'gift_received');
    return matchesSearch;
  });

  return (
    <div className="pb-12 min-h-screen bg-black text-white" id="omnix-wallet-container">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/15 rounded-xl border border-purple-500/20">
            <WalletIcon className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Omnix Secure Wallet
            </h1>
            <p className="text-xs text-zinc-500">Real-time ledger & cryptographic balance controls</p>
          </div>
        </div>
        <button 
          onClick={() => user && fetchWalletData(user.id)}
          className="p-2 hover:bg-zinc-900 rounded-lg text-zinc-400 hover:text-white transition-colors"
          title="Refresh ledger"
          id="refresh-ledger-btn"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Status Alerts */}
        <AnimatePresence>
          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-sm"
              id="wallet-success-alert"
            >
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {(errorMessage || error) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm"
              id="wallet-error-alert"
            >
              <ShieldAlert className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage || error}</span>
            </motion.div>
          )}

          {wallet?.is_frozen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-4 p-5 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-3xl"
              id="wallet-frozen-notice"
            >
              <AlertTriangle className="w-8 h-8 flex-shrink-0 text-yellow-400 animate-pulse" />
              <div>
                <h4 className="font-bold text-white">Wallet Security Freezing Enabled</h4>
                <p className="text-xs text-zinc-400 mt-1">This wallet has been locked by network administrators. Debit operations, gift sending, andcoin withdrawals are temporarily disabled.</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading && !wallet ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-purple-500" />
            <p className="text-sm text-zinc-400">Querying secure ledger database...</p>
          </div>
        ) : (
          <>
            {/* Bento Grid Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Primary Card - Glassmorphism */}
              <div className="md:col-span-2 bg-gradient-to-br from-purple-950 via-zinc-950 to-black border border-purple-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-purple-500/5">
                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                  <Coins className="w-48 h-48 text-purple-400" />
                </div>
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-purple-300/80 text-xs font-semibold uppercase tracking-wider">Omnix Coin Ledger</span>
                    <h2 className="text-5xl font-extrabold text-white mt-1 flex items-baseline gap-2">
                      {wallet?.coin_balance.toLocaleString() || '0'}
                      <span className="text-sm font-medium text-purple-400 uppercase">Coins</span>
                    </h2>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full text-xs font-semibold text-purple-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" /> SECURED
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/60">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Reward Pool</p>
                    <p className="text-base font-bold text-yellow-500 mt-0.5">{wallet?.reward_coins.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Gift Earnings</p>
                    <p className="text-base font-bold text-pink-500 mt-0.5">{wallet?.gift_coins.toLocaleString() || '0'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold">Pending Escrow</p>
                    <p className="text-base font-bold text-cyan-500 mt-0.5">{wallet?.pending_coins.toLocaleString() || '0'}</p>
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button 
                    onClick={() => setActiveTab('shop')}
                    className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-600/25 cursor-pointer"
                    id="add-coins-shortcut-btn"
                  >
                    <Plus className="w-4 h-4" /> Add Coins
                  </button>
                  <button 
                    onClick={() => setShowGiftModal(true)}
                    disabled={wallet?.is_frozen}
                    className="flex-1 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 cursor-pointer"
                    id="gift-coins-shortcut-btn"
                  >
                    <Gift className="w-4 h-4 text-pink-500" /> Send Gift
                  </button>
                </div>
              </div>

              {/* Side Stats Card */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-white font-bold text-sm mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-400" /> Historical Performance
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Total Coins Earned</span>
                      <span className="font-bold text-green-400">+{wallet?.total_earned_coins.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Total Coins Spent</span>
                      <span className="font-bold text-zinc-300">-{wallet?.total_spent_coins.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Total Gifted Outbound</span>
                      <span className="font-bold text-pink-400">-{wallet?.total_gifted_coins.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/80 mt-4">
                  <button 
                    onClick={handleClaimDailyReward}
                    disabled={isProcessing}
                    className="w-full bg-yellow-500/10 hover:bg-yellow-500/15 border border-yellow-500/20 py-2.5 rounded-xl text-yellow-400 font-bold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    id="claim-daily-btn"
                  >
                    Claim Daily Reward (+50)
                  </button>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-zinc-800" id="wallet-navigation-tabs">
              <button 
                className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'overview' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setActiveTab('overview')}
                id="tab-overview"
              >
                Overview & Analytics
              </button>
              <button 
                className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'history' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setActiveTab('history')}
                id="tab-history"
              >
                Ledger Timeline
              </button>
              <button 
                className={`pb-3 text-sm font-semibold border-b-2 px-4 transition-colors relative cursor-pointer ${activeTab === 'shop' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                onClick={() => setActiveTab('shop')}
                id="tab-shop"
              >
                Buy Packages
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'overview' && (
              <div className="space-y-6" id="wallet-overview-panel">
                {/* Balance Chart Area */}
                <div className="bg-zinc-900/40 border border-zinc-850 rounded-3xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-bold text-sm">Coin Balance Trend</h4>
                      <p className="text-xs text-zinc-500">Live chart representing cumulative historical assets</p>
                    </div>
                    <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md font-medium">Recharts Active</span>
                  </div>
                  
                  <div className="h-56 w-full" id="wallet-recharts-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                        <XAxis dataKey="date" stroke="#71717a" fontSize={10} />
                        <YAxis stroke="#71717a" fontSize={10} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '12px' }} 
                          labelStyle={{ color: '#a1a1aa', fontWeight: 'bold' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#a855f7" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Secure Escrow Notice */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white mb-0.5">Double-Spending Guarded</h5>
                      <p className="text-[11px] text-zinc-400">Every single transaction undergoes a cryptographic audit before ledger synchronization to prevent racing exploits.</p>
                    </div>
                  </div>
                  <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-2xl flex items-start gap-3">
                    <Info className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-bold text-white mb-0.5">Anti-Tampering System</h5>
                      <p className="text-[11px] text-zinc-400">Offline LocalStorage fallbacks maintain detailed tamper verification hash blocks that automatically sync back once database access restores.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4" id="wallet-history-panel">
                {/* Timeline Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                  {/* Search Bar */}
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text"
                      placeholder="Search transactions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      id="tx-search-input"
                    />
                  </div>

                  {/* Statement Downloader */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500 font-medium">Download Statement:</span>
                    <button 
                      onClick={() => user && downloadStatement(user.id, 'csv')}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download CSV"
                      id="download-csv-btn"
                    >
                      <Download className="w-3.5 h-3.5" /> CSV
                    </button>
                    <button 
                      onClick={() => user && downloadStatement(user.id, 'json')}
                      className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Download JSON"
                      id="download-json-btn"
                    >
                      <Download className="w-3.5 h-3.5" /> JSON
                    </button>
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap gap-2 pt-1" id="filter-chips-container">
                  {[
                    { key: 'all', label: 'All Transactions' },
                    { key: 'credits', label: 'Credits' },
                    { key: 'debits', label: 'Debits' },
                    { key: 'rewards', label: 'Rewards' },
                    { key: 'purchases', label: 'Purchases' },
                    { key: 'gifts', label: 'Gifts' }
                  ].map(chip => (
                    <button
                      key={chip.key}
                      onClick={() => setFilterType(chip.key)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide border transition-all cursor-pointer ${filterType === chip.key ? 'bg-purple-600/15 border-purple-500 text-purple-300' : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'}`}
                      id={`filter-chip-${chip.key}`}
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>

                {/* Transaction List */}
                <div className="space-y-2.5">
                  {filteredTxs.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-3xl text-zinc-500">
                      <FileText className="w-10 h-10 mx-auto text-zinc-700 mb-2.5" />
                      <p className="text-sm">No transaction matches found.</p>
                    </div>
                  ) : (
                    filteredTxs.map(tx => {
                      const isCredit = tx.amount > 0;
                      return (
                        <div 
                          key={tx.id} 
                          onClick={() => setSelectedTx(tx)}
                          className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 hover:border-zinc-800 rounded-2xl transition-all cursor-pointer"
                          id={`tx-row-${tx.id}`}
                        >
                          <div className="flex items-center gap-3.5">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${isCredit ? 'bg-green-500/10 border-green-500/10 text-green-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}>
                              {isCredit ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white mb-0.5">{tx.description}</h4>
                              <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span className="capitalize text-purple-400 font-semibold">{tx.type.replace('_', ' ')}</span>
                                <span>•</span>
                                <span>{new Date(tx.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-base font-extrabold ${isCredit ? 'text-green-400' : 'text-zinc-100'}`}>
                              {isCredit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}
                            </span>
                            <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-semibold">Coins</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'shop' && (
              <div className="space-y-6" id="wallet-shop-panel">
                <div className="text-center max-w-md mx-auto mb-2">
                  <h3 className="text-white font-extrabold text-lg">Acquire Omnix Coins</h3>
                  <p className="text-xs text-zinc-500 mt-1">Acquire coins to support creators, buy premium stickers, and join premium communities!</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  {[
                    { coins: 500, label: 'Starter Bundle', price: 4.99, badge: 'Standard' },
                    { coins: 1200, label: 'Value Pack', price: 9.99, badge: 'Popular', bonus: '20% Bonus' },
                    { coins: 3000, label: 'Elite Chest', price: 19.99, badge: 'Best Deal', bonus: '50% Bonus' }
                  ].map(pkg => (
                    <div 
                      key={pkg.coins}
                      className="bg-zinc-950 border border-zinc-850 hover:border-purple-500/40 p-5 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all shadow-lg"
                    >
                      {pkg.bonus && (
                        <div className="absolute top-0 right-0 bg-purple-600 text-[9px] font-bold tracking-wider px-2.5 py-0.5 rounded-bl-xl uppercase text-white">
                          {pkg.bonus}
                        </div>
                      )}
                      
                      <div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{pkg.label}</span>
                        <h4 className="text-3xl font-extrabold text-white mt-1 flex items-baseline gap-1">
                          {pkg.coins.toLocaleString()}
                          <span className="text-xs text-purple-400 uppercase font-semibold">coins</span>
                        </h4>
                        <p className="text-xs text-purple-300 font-semibold mt-2">${pkg.price.toFixed(2)} USD</p>
                      </div>

                      <button
                        onClick={() => handleBuyCoinPackage(pkg.coins, pkg.price)}
                        disabled={isProcessing}
                        className="w-full bg-zinc-900 hover:bg-purple-600 text-white hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all mt-6 cursor-pointer"
                        id={`buy-pkg-${pkg.coins}`}
                      >
                        Buy Package
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Gift Modal */}
      <AnimatePresence>
        {showGiftModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="gift-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
              id="gift-modal-container"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Gift className="w-5 h-5 text-pink-500" /> Gift Omnix Coins
                </h3>
                <button 
                  onClick={() => setShowGiftModal(false)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                  id="close-gift-modal-btn"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSendGift} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Recipient Username</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 font-bold">@</span>
                    <input 
                      type="text"
                      required
                      placeholder="username"
                      value={giftRecipient}
                      onChange={(e) => setGiftRecipient(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 pl-8 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                      id="gift-recipient-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Amount of Coins</label>
                  <input 
                    type="number"
                    required
                    min={1}
                    max={wallet?.coin_balance || 1000}
                    value={giftAmount}
                    onChange={(e) => setGiftAmount(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-sm text-white rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
                    id="gift-amount-input"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1 flex justify-between">
                    <span>Inbound transfer fee: 0%</span>
                    <span>Max available: {wallet?.coin_balance.toLocaleString() || '0'} coins</span>
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isProcessing || (wallet?.coin_balance || 0) < giftAmount}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    id="submit-gift-btn"
                  >
                    Transfer Coins
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Transaction Detail Modal */}
        {selectedTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="tx-modal-backdrop">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative"
              id="tx-modal-container"
            >
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" /> Transaction Audit Receipt
                </h3>
                <button 
                  onClick={() => setSelectedTx(null)}
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                  id="close-tx-modal-btn"
                >
                  &times;
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-center p-5 bg-zinc-900/40 border border-zinc-850 rounded-2xl">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Net Ledger Transfer</span>
                  <h4 className={`text-4xl font-extrabold mt-1 ${txAmountColor(selectedTx.amount)}`}>
                    {selectedTx.amount > 0 ? '+' : ''}{selectedTx.amount.toLocaleString()}
                  </h4>
                  <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-bold">Coins</p>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Transaction ID</span>
                    <span className="font-mono text-zinc-300 font-medium select-all">{selectedTx.id}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Type</span>
                    <span className="capitalize text-zinc-300 font-semibold">{selectedTx.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Timestamp</span>
                    <span className="text-zinc-300">{new Date(selectedTx.created_at).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-green-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> SECURELY COMPLETE
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-900">
                    <span className="text-zinc-500">Source Channel</span>
                    <span className="text-zinc-300 uppercase tracking-wide font-bold text-[10px]">{selectedTx.source}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Reference Hash</span>
                    <span className="font-mono text-zinc-400 text-[10px]">{selectedTx.reference_id || 'N/A'}</span>
                  </div>
                </div>

                <div className="bg-purple-950/20 border border-purple-500/15 p-3 rounded-xl flex items-start gap-2.5 mt-2">
                  <ShieldCheck className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-zinc-400">This receipt has been recorded on the decentralised Omnix Ledger and is fully verified against triple-accounting double-spending security routines.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function txAmountColor(amount: number): string {
  if (amount > 0) return 'text-green-400';
  return 'text-white';
}

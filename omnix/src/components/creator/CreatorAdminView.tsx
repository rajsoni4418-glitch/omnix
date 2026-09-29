import React, { useState, useEffect } from 'react';
import { useCreatorMonetizationStore, AdminCreatorDetail } from '../../store/creatorMonetizationStore';
import { 
  Shield, Users, Search, DollarSign, Award, Settings, Eye, Clock, 
  Trash2, Edit3, ArrowUpRight, Check, X, AlertCircle, RefreshCw, BarChart2,
  Lock, Unlock, Slash, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function CreatorAdminView() {
  const store = useCreatorMonetizationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [activeCreator, setActiveCreator] = useState<AdminCreatorDetail | null>(null);
  
  // Forms state
  const [adjAmount, setAdjAmount] = useState('');
  const [adjSource, setAdjSource] = useState('gift');
  const [adjDescription, setAdjDescription] = useState('');
  
  const [statName, setStatName] = useState('followers');
  const [statValue, setStatValue] = useState('');
  
  const [payoutTab, setPayoutTab] = useState<'creators' | 'payouts'>('creators');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    store.fetchAdminCreatorPanel();
  }, []);

  const handleRefresh = () => {
    store.fetchAdminCreatorPanel();
  };

  const handleAdjustEarnings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreator) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    const amount = parseFloat(adjAmount);
    if (isNaN(amount)) {
      setErrorMsg('Please enter a valid adjustments value.');
      return;
    }

    const res = await store.adminAdjustEarnings(
      activeCreator.user_id,
      amount,
      adjSource,
      adjDescription.trim() || 'Admin Adjustment'
    );

    if (res.success) {
      setSuccessMsg(res.message || 'Adjusted earnings successfully!');
      setAdjAmount('');
      setAdjDescription('');
      // Refresh active creator context
      setTimeout(() => {
        const updated = store.adminCreators.find(c => c.user_id === activeCreator.user_id);
        if (updated) setActiveCreator(updated);
      }, 500);
    } else {
      setErrorMsg('Failed to adjust creator earnings.');
    }
  };

  const handleAdjustStatistics = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCreator) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    const value = parseInt(statValue, 10);
    if (isNaN(value) || value < 0) {
      setErrorMsg('Please enter a valid positive metric count.');
      return;
    }

    const res = await store.adminAdjustStatistics(activeCreator.user_id, statName, value);
    if (res.success) {
      setSuccessMsg(res.message || 'Adjusted metrics & automated ranks successfully.');
      setStatValue('');
      setTimeout(() => {
        const updated = store.adminCreators.find(c => c.user_id === activeCreator.user_id);
        if (updated) setActiveCreator(updated);
      }, 500);
    } else {
      setErrorMsg('Failed to adjust metrics.');
    }
  };

  const handleMonetizationStatus = async (frozen: boolean, suspended: boolean) => {
    if (!activeCreator) return;
    setSuccessMsg(null);
    setErrorMsg(null);

    const res = await store.adminSetMonetizationStatus(activeCreator.user_id, frozen, suspended);
    if (res.success) {
      setSuccessMsg(res.message || 'Creator status updated successfully!');
      setTimeout(() => {
        const updated = store.adminCreators.find(c => c.user_id === activeCreator.user_id);
        if (updated) setActiveCreator(updated);
      }, 500);
    } else {
      setErrorMsg('Failed to modify status.');
    }
  };

  const handleUpdateTransaction = async (txId: string, status: 'completed' | 'rejected') => {
    setSuccessMsg(null);
    setErrorMsg(null);
    const res = await store.adminUpdateTransactionStatus(txId, status);
    if (res.success) {
      alert(`Payout transaction request has been successfully marked as: ${status.toUpperCase()}`);
      if (activeCreator) {
        const updated = store.adminCreators.find(c => c.user_id === activeCreator.user_id);
        if (updated) setActiveCreator(updated);
      }
    } else {
      alert('Failed to update payout transaction.');
    }
  };

  // Filter creators list
  const filteredCreators = store.adminCreators.filter(c => {
    const matchesSearch = c.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || c.levels.level === parseInt(levelFilter, 10);
    return matchesSearch && matchesLevel;
  });

  // Extract all pending payout transactions across creators (or fallback)
  const pendingPayoutsList: any[] = [];
  store.adminCreators.forEach(c => {
    const localTxs = localStorage.getItem(`creator_txs_${c.user_id}`);
    if (localTxs) {
      const parsed = JSON.parse(localTxs);
      parsed.forEach((t: any) => {
        if (t.source === 'payout' && t.status === 'pending') {
          pendingPayoutsList.push({
            ...t,
            creator_name: c.full_name,
            creator_username: c.username,
            creator_email: c.email
          });
        }
      });
    }
  });

  return (
    <div className="space-y-6">
      {/* Admin Panel Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-950/40 via-zinc-900 to-indigo-950/40 border border-purple-500/20 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="text-white font-black text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-400 animate-pulse" /> Omnix Creator Oversight Console
          </h3>
          <p className="text-zinc-400 text-xs mt-1">Super-admin panel to adjust creator balances, audit ledger statements, and authorize IBAN bank transfer payouts.</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Sync Datasets
        </button>
      </div>

      {/* Tabs segment */}
      <div className="flex gap-4 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setPayoutTab('creators')}
          className={`font-bold pb-2 text-sm transition-colors flex items-center gap-2 ${payoutTab === 'creators' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <Users className="w-4 h-4" /> Creator Accounts ({filteredCreators.length})
        </button>
        <button 
          onClick={() => setPayoutTab('payouts')}
          className={`font-bold pb-2 text-sm transition-colors flex items-center gap-2 ${payoutTab === 'payouts' ? 'text-white border-b-2 border-purple-500' : 'text-zinc-500 hover:text-white'}`}
        >
          <DollarSign className="w-4 h-4" /> Pending Bank Payouts ({pendingPayoutsList.length})
        </button>
      </div>

      {payoutTab === 'creators' ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          {/* Header search controls */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div className="relative col-span-3">
              <input 
                type="text"
                placeholder="Search creator by name, handle, or email ID..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 pl-9 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3.5" />
            </div>

            <select
              value={levelFilter}
              onChange={e => setLevelFilter(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-xs text-white outline-none"
            >
              <option value="all">All Creator Levels</option>
              <option value="1">Level 1 (Bronze)</option>
              <option value="2">Level 2 (Silver)</option>
              <option value="3">Level 3 (Gold)</option>
              <option value="4">Level 4 (Platinum)</option>
              <option value="5">Level 5 (Diamond)</option>
            </select>
          </div>

          {/* Creators Oversight Table */}
          <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-950/20">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-black tracking-wider bg-zinc-950/60">
                  <th className="p-3.5">Creator Identity</th>
                  <th className="p-3.5 text-center">Rank / level</th>
                  <th className="p-3.5 text-right">Available Bal.</th>
                  <th className="p-3.5 text-right">Lifetime Rev.</th>
                  <th className="p-3.5 text-center">Security Block</th>
                  <th className="p-3.5 text-center">Oversight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {filteredCreators.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 italic">No creators matching filter query found.</td>
                  </tr>
                ) : (
                  filteredCreators.map((creator) => (
                    <tr key={creator.user_id} className="hover:bg-zinc-900/40 transition-all">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center font-black text-purple-400 shrink-0">
                            {creator.full_name[0]}
                          </div>
                          <div>
                            <span className="font-bold text-white block">{creator.full_name}</span>
                            <span className="text-[10px] text-zinc-500 block">@{creator.username} • {creator.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <span className="text-[10px] bg-purple-500/10 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase block max-w-xs mx-auto">
                          {creator.levels.rank}
                        </span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">Score: {creator.levels.score}/100</span>
                      </td>
                      <td className="p-3.5 text-right font-black text-purple-400">
                        ${creator.earnings.available_balance.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-right font-black text-zinc-400">
                        ${creator.earnings.lifetime_earnings.toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          {creator.earnings.frozen && (
                            <span className="text-[9px] bg-red-500/10 text-red-400 font-black px-2 py-0.5 rounded">FROZEN</span>
                          )}
                          {creator.earnings.monetization_suspended && (
                            <span className="text-[9px] bg-zinc-800 text-zinc-400 font-black px-2 py-0.5 rounded">SUSPENDED</span>
                          )}
                          {!creator.earnings.frozen && !creator.earnings.monetization_suspended && (
                            <span className="text-[9px] bg-green-500/10 text-green-400 font-black px-2 py-0.5 rounded">ACTIVE</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3.5 text-center">
                        <button 
                          onClick={() => setActiveCreator(creator)}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-800 hover:border-purple-500/20 text-[10px] font-black uppercase text-purple-400 rounded-lg hover:bg-purple-600/10 transition-colors"
                        >
                          Oversight
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Pending Bank Payout Requests segment */
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <div className="overflow-x-auto rounded-2xl border border-zinc-850 bg-zinc-950/20">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-black tracking-wider bg-zinc-950/60">
                  <th className="p-3.5">Creator details</th>
                  <th className="p-3.5">Request Date</th>
                  <th className="p-3.5">Bank Payout Credentials</th>
                  <th className="p-3.5 text-right">Transfer Amount</th>
                  <th className="p-3.5 text-center">Authorize Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850 text-zinc-300">
                {pendingPayoutsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No pending bank payout requests currently awaiting clearance.</td>
                  </tr>
                ) : (
                  pendingPayoutsList.map((payout, idx) => (
                    <tr key={idx} className="hover:bg-zinc-900/40 transition-all">
                      <td className="p-3.5">
                        <span className="font-bold text-white block">{payout.creator_name}</span>
                        <span className="text-[10px] text-zinc-500 block">@{payout.creator_username}</span>
                      </td>
                      <td className="p-3.5 text-zinc-400">
                        {new Date(payout.date).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 max-w-xs font-mono text-[11px] text-zinc-300 truncate">
                        {payout.description}
                      </td>
                      <td className="p-3.5 text-right font-black text-purple-400">
                        ${Math.abs(payout.amount).toFixed(2)}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex justify-center gap-1.5">
                          <button 
                            onClick={() => handleUpdateTransaction(payout.id, 'completed')}
                            className="p-1.5 bg-green-600/20 text-green-400 border border-green-500/20 hover:bg-green-600 hover:text-white transition-all rounded-lg"
                            title="Approve & Complete Bank Transfer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleUpdateTransaction(payout.id, 'rejected')}
                            className="p-1.5 bg-red-600/20 text-red-400 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all rounded-lg"
                            title="Reject Request & Refund"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DETAILED MANAGING CREATOR OVERSIGHT PORTAL MODAL */}
      <AnimatePresence>
        {activeCreator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-2xl p-6 rounded-3xl space-y-6 my-8"
            >
              {/* Modal header */}
              <div className="flex justify-between items-start pb-4 border-b border-zinc-800/60">
                <div>
                  <h3 className="text-white font-black text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-purple-400 animate-spin" /> Manage Creator: {activeCreator.full_name}
                  </h3>
                  <p className="text-zinc-500 text-[10px] uppercase mt-0.5">UID: {activeCreator.user_id}</p>
                </div>
                <button onClick={() => { setActiveCreator(null); setErrorMsg(null); setSuccessMsg(null); }} className="text-zinc-500 hover:text-white font-black text-xs">Close</button>
              </div>

              {/* Feedback messages */}
              {successMsg && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-xl font-bold">{successMsg}</div>}
              {errorMsg && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-bold">{errorMsg}</div>}

              {/* Creator details summary row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Available Bal.</span>
                  <span className="text-base font-black text-white">${activeCreator.earnings.available_balance.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Lifetime Rev.</span>
                  <span className="text-base font-black text-white">${activeCreator.earnings.lifetime_earnings.toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Current Rank</span>
                  <span className="text-xs font-bold text-purple-400 block mt-1">{activeCreator.levels.rank}</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase font-black block">Audited Status</span>
                  <div className="flex gap-1.5 mt-1">
                    {activeCreator.earnings.frozen ? (
                      <span className="text-[8px] bg-red-500/20 text-red-400 font-bold px-1.5 py-0.5 rounded">FROZEN</span>
                    ) : activeCreator.earnings.monetization_suspended ? (
                      <span className="text-[8px] bg-zinc-800 text-zinc-400 font-bold px-1.5 py-0.5 rounded">SUSPENDED</span>
                    ) : (
                      <span className="text-[8px] bg-green-500/20 text-green-400 font-bold px-1.5 py-0.5 rounded">ACTIVE</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Inner operational tabs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. EARNING ADJUSTMENT FORM */}
                <div className="space-y-3">
                  <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1">
                    💰 Adjust Ledger Balance
                  </h4>
                  <p className="text-zinc-500 text-[10px]">Add positive credits or deduct negative adjustments from available balance.</p>
                  
                  <form onSubmit={handleAdjustEarnings} className="space-y-3 text-xs">
                    <div className="space-y-1">
                      <label className="text-zinc-400 font-bold">Adjustment Amount ($)</label>
                      <input 
                        type="number"
                        step="0.01"
                        required
                        placeholder="E.g. 150.00 or -50.00"
                        value={adjAmount}
                        onChange={e => setAdjAmount(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">Revenue Source</label>
                        <select
                          value={adjSource}
                          onChange={e => setAdjSource(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white outline-none"
                        >
                          <option value="gift">Virtual Gift</option>
                          <option value="story_reward">Story Rewards</option>
                          <option value="post_reward">Post Rewards</option>
                          <option value="omniclip_reward">OmniClip Rewards</option>
                          <option value="referral">Referrals</option>
                          <option value="premium_share">Premium Share</option>
                          <option value="challenge">Challenges</option>
                          <option value="sponsored">Sponsored Content</option>
                          <option value="brand_collab">Brand Collab</option>
                          <option value="community_revenue">Community Rev.</option>
                          <option value="event_reward">Event Rewards</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold">Statement Memo</label>
                        <input 
                          type="text"
                          required
                          placeholder="E.g. Challenge reward"
                          value={adjDescription}
                          onChange={e => setAdjDescription(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-2.5 text-white font-bold rounded-xl transition-all">
                      Apply Ledger Adjustments
                    </button>
                  </form>
                </div>

                {/* 2. SECURITY SUSPENSIONS & METRIC MODIFICATION */}
                <div className="space-y-5">
                  {/* Account lock/block state */}
                  <div className="space-y-3">
                    <h4 className="text-white text-xs font-black uppercase tracking-wider">
                      🔒 Security Block Controls
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {activeCreator.earnings.frozen ? (
                        <button 
                          onClick={() => handleMonetizationStatus(false, activeCreator.earnings.monetization_suspended)}
                          className="px-4 py-2 bg-green-600/15 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Unfreeze Payouts
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleMonetizationStatus(true, activeCreator.earnings.monetization_suspended)}
                          className="px-4 py-2 bg-red-600/15 border border-red-500/20 text-red-400 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" /> Freeze Payouts
                        </button>
                      )}

                      {activeCreator.earnings.monetization_suspended ? (
                        <button 
                          onClick={() => handleMonetizationStatus(activeCreator.earnings.frozen, false)}
                          className="px-4 py-2 bg-green-600/15 border border-green-500/20 text-green-400 text-xs font-bold rounded-xl hover:bg-green-600 hover:text-white transition-all flex items-center gap-1.5"
                        >
                          <Unlock className="w-3.5 h-3.5" /> Resume Monetization
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleMonetizationStatus(activeCreator.earnings.frozen, true)}
                          className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-400 text-xs font-bold rounded-xl hover:bg-red-600 hover:text-white hover:border-transparent transition-all flex items-center gap-1.5"
                        >
                          <Slash className="w-3.5 h-3.5" /> Suspend Monetization
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Statistics Modifier Form */}
                  <div className="space-y-3 border-t border-zinc-800/40 pt-4">
                    <h4 className="text-white text-xs font-black uppercase tracking-wider flex items-center gap-1">
                      📊 Modify Creator Metrics
                    </h4>
                    <p className="text-zinc-500 text-[10px]">Altering follower or engagement counts automatically recalculates creator ranks & unlocks achievements!</p>
                    
                    <form onSubmit={handleAdjustStatistics} className="space-y-2.5 text-xs flex gap-2 items-end">
                      <div className="flex-1 space-y-1">
                        <label className="text-zinc-400 font-bold">Metric Variable</label>
                        <select
                          value={statName}
                          onChange={e => setStatName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white outline-none text-[11px]"
                        >
                          <option value="followers">Followers Count</option>
                          <option value="profile_views">Profile Views</option>
                          <option value="story_views">Story Views</option>
                          <option value="post_reach">Post Reach</option>
                          <option value="omniclip_views">OmniClip Views</option>
                          <option value="likes">Total Likes</option>
                          <option value="comments">Total Comments</option>
                          <option value="shares">Total Shares</option>
                          <option value="saves">Total Saves</option>
                        </select>
                      </div>

                      <div className="w-24 space-y-1">
                        <label className="text-zinc-400 font-bold">New value</label>
                        <input 
                          type="number"
                          required
                          placeholder="0"
                          value={statValue}
                          onChange={e => setStatValue(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-white outline-none focus:border-purple-500 text-[11px]"
                        />
                      </div>

                      <button type="submit" className="bg-purple-600 hover:bg-purple-700 p-2 text-white font-bold rounded-xl transition-all h-[36px] px-3">
                        Set
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

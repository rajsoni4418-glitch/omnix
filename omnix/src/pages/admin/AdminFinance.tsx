import React, { useState, useEffect } from 'react';
import { 
  Coins, Search, ShieldCheck, Download, Ban, Unlock, 
  ArrowUpRight, ArrowDownLeft, Plus, Minus, Info, 
  Filter, AlertTriangle, CheckCircle, RefreshCw, Users, FileText 
} from 'lucide-react';
import { useWalletStore, AdminWalletDetail } from '../../store/walletStore';

export default function AdminFinance() {
  const { 
    adminWallets, 
    transactions, 
    isLoading, 
    error, 
    fetchAdminWallets, 
    setWalletFrozenState, 
    adminAdjustCoins,
    downloadStatement
  } = useWalletStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'wallets' | 'logs'>('wallets');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Adjustment Modal States
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminWalletDetail | null>(null);
  const [adjustAmount, setAdjustAmount] = useState(100);
  const [adjustType, setAdjustType] = useState('admin_reward');
  const [adjustDesc, setAdjustDesc] = useState('');

  // Freezing State Justification
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeWallet, setFreezeWallet] = useState<AdminWalletDetail | null>(null);
  const [freezeReason, setFreezeReason] = useState('');

  useEffect(() => {
    fetchAdminWallets();
  }, [fetchAdminWallets]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg || error) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg, error]);

  const handleAdjustCoins = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet) return;

    if (adjustAmount === 0) {
      setErrorMsg('Please specify a non-zero coin count.');
      return;
    }

    setIsProcessing(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await adminAdjustCoins(
        selectedWallet.user_id,
        adjustAmount,
        adjustType,
        adjustDesc || `Admin Manual Adjustment`
      );
      setSuccessMsg(`Successfully adjusted ${adjustAmount} coins for @${selectedWallet.username}!`);
      setShowAdjustModal(false);
      setAdjustDesc('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Ledger adjustment failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!freezeWallet) return;

    setIsProcessing(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const nextFrozenState = !freezeWallet.is_frozen;
      await setWalletFrozenState(
        freezeWallet.user_id,
        nextFrozenState,
        freezeReason || 'Administrative directive'
      );
      setSuccessMsg(`Successfully ${nextFrozenState ? 'FROZEN' : 'UNFROZEN'} wallet of @${freezeWallet.username}!`);
      setShowFreezeModal(false);
      setFreezeReason('');
    } catch (e: any) {
      setErrorMsg(e.message || 'Freezing action failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Filter list of wallets
  const filteredWallets = adminWallets.filter(w => 
    w.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.user_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats
  const totalSystemCoins = adminWallets.reduce((sum, w) => sum + w.coin_balance, 0);
  const frozenWalletsCount = adminWallets.filter(w => w.is_frozen).length;

  return (
    <div className="space-y-6" id="admin-finance-container">
      {/* Page Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-6 h-6 text-purple-400" />
            Financial ledger controls
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Audit security metrics, inject adjustments, and freeze fraudulent accounts</p>
        </div>
        <button 
          onClick={fetchAdminWallets}
          className="p-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-colors"
          title="Refresh statistics"
          id="admin-refresh-btn"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-2xl text-sm" id="admin-success-alert">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}
      {(errorMsg || error) && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm" id="admin-error-alert">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-red-400" />
          <span>{errorMsg || error}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Total Coins Circulating</p>
          <h3 className="text-3xl font-extrabold text-white mt-1.5">{totalSystemCoins.toLocaleString()}</h3>
          <p className="text-[10px] text-purple-400 mt-1">In system-wide wallets</p>
        </div>
        
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Security Freezing Accounts</p>
          <h3 className="text-3xl font-extrabold text-yellow-500 mt-1.5">{frozenWalletsCount}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Active frozen locks</p>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 relative overflow-hidden">
          <p className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">Ledger Health Status</p>
          <h3 className="text-xl font-extrabold text-green-400 mt-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-5 h-5" /> SECURE & COMPLIANT
          </h3>
          <p className="text-[10px] text-zinc-500 mt-1">Dual-accounting balances active</p>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-zinc-900" id="admin-tabs">
        <button 
          onClick={() => setActiveTab('wallets')}
          className={`pb-3 text-sm font-semibold border-b-2 px-5 transition-colors relative cursor-pointer ${activeTab === 'wallets' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          id="admin-tab-wallets"
        >
          Circulation Directory ({filteredWallets.length})
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`pb-3 text-sm font-semibold border-b-2 px-5 transition-colors relative cursor-pointer ${activeTab === 'logs' ? 'border-purple-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          id="admin-tab-logs"
        >
          Security Ledger Logs
        </button>
      </div>

      {activeTab === 'wallets' && (
        <div className="space-y-4" id="admin-wallets-directory">
          {/* Search bar */}
          <div className="relative max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search user, email, or id..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-900 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              id="admin-user-search"
            />
          </div>

          {/* Directory Table */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-500 uppercase font-semibold">
                  <tr>
                    <th className="px-5 py-4">User Details</th>
                    <th className="px-5 py-4">Coin Balance</th>
                    <th className="px-5 py-4">Reward Balance</th>
                    <th className="px-5 py-4">Gift Balance</th>
                    <th className="px-5 py-4">Security Status</th>
                    <th className="px-5 py-4 text-right">Ledger Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 animate-pulse font-medium">Scanning circulation directory...</td>
                    </tr>
                  ) : filteredWallets.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-12 text-center text-zinc-500 font-medium">No wallets found in directory.</td>
                    </tr>
                  ) : (
                    filteredWallets.map(w => (
                      <tr key={w.user_id} className="hover:bg-zinc-900/10 transition-colors" id={`admin-row-${w.user_id}`}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-white">@{w.username}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{w.email}</p>
                        </td>
                        <td className="px-5 py-4 font-extrabold text-zinc-200">
                          {w.coin_balance.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 font-bold text-yellow-500">
                          {w.reward_coins.toLocaleString()}
                        </td>
                        <td className="px-5 py-4 font-bold text-pink-500">
                          {w.gift_coins.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${w.is_frozen ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/10'}`}>
                            {w.is_frozen ? 'Locked (Frozen)' : 'Active'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right flex items-center justify-end gap-2.5">
                          <button 
                            onClick={() => {
                              setSelectedWallet(w);
                              setShowAdjustModal(true);
                            }}
                            className="p-1.5 bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 hover:text-purple-300 border border-purple-500/10 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
                            title="Credit/Debit Coins"
                            id={`adjust-btn-${w.user_id}`}
                          >
                            <Plus className="w-3.5 h-3.5" /> Adjust
                          </button>
                          
                          <button 
                            onClick={() => {
                              setFreezeWallet(w);
                              setShowFreezeModal(true);
                            }}
                            className={`p-1.5 border rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors cursor-pointer ${w.is_frozen ? 'bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/10' : 'bg-red-500/10 hover:bg-red-500/20 text-red-400 border-red-500/10'}`}
                            title={w.is_frozen ? 'Unfreeze wallet' : 'Freeze wallet'}
                            id={`freeze-btn-${w.user_id}`}
                          >
                            {w.is_frozen ? (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> Unlock
                              </>
                            ) : (
                              <>
                                <Ban className="w-3.5 h-3.5" /> Lock
                              </>
                            )}
                          </button>

                          <button 
                            onClick={() => downloadStatement(w.user_id, 'csv')}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white border border-zinc-850 rounded-lg cursor-pointer"
                            title="Export statement CSV"
                            id={`export-btn-${w.user_id}`}
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4" id="admin-ledger-logs">
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-500 font-semibold flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-400" /> Site-wide transaction logs
            </span>
            <button 
              onClick={() => {
                // Export total transactions
                const headers = ['User ID', 'Amount', 'Type', 'Status', 'Description', 'Source', 'Reference ID'];
                const rows = transactions.map(t => [
                  t.user_id, t.amount, t.type, t.status, `"${t.description.replace(/"/g, '""')}"`, t.source, t.reference_id || ''
                ]);
                const dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
                const blob = new Blob([dataStr], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'omnix_ledger_circulation_report.csv';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-xs font-bold text-zinc-300 rounded-xl flex items-center gap-1.5 cursor-pointer transition-colors"
              id="export-circulation-btn"
            >
              <Download className="w-4 h-4" /> Export Circulation Report
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3.5">
            {transactions.length === 0 ? (
              <p className="text-center text-zinc-500 text-xs py-8">No recent security ledger transactions recorded.</p>
            ) : (
              transactions.map(t => {
                const isCredit = t.amount > 0;
                return (
                  <div key={t.id} className="flex justify-between items-center p-4 bg-black/30 border border-zinc-900 rounded-xl text-xs">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full border ${isCredit ? 'bg-green-500/10 border-green-500/10 text-green-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                        {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">UserID: {t.user_id.slice(0, 8)}...</span>
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 px-1.5 py-0.5 rounded uppercase font-bold tracking-wide">{t.type}</span>
                        </div>
                        <p className="text-zinc-400 mt-1">{t.description}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(t.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-extrabold text-sm ${isCredit ? 'text-green-400' : 'text-zinc-200'}`}>
                        {isCredit ? '+' : '-'}{Math.abs(t.amount).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-zinc-500 uppercase mt-0.5 font-bold">Coins</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Credit / Debit Modal */}
      {showAdjustModal && selectedWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="adjust-modal-backdrop">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative" id="adjust-modal">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-purple-400" /> Adjust Coins Balance
              </h3>
              <button onClick={() => setShowAdjustModal(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">&times;</button>
            </div>

            <form onSubmit={handleAdjustCoins} className="space-y-4">
              <p className="text-xs text-zinc-400">
                You are manually editing coin counts for user <strong className="text-white">@{selectedWallet.username}</strong>. This adjust action is logged in administrative security logs.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Amount of Coins</label>
                <div className="flex gap-2">
                  <input 
                    type="number"
                    required
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-purple-500"
                    id="adjust-amount"
                  />
                  <div className="flex rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 font-bold text-xs">
                    <button 
                      type="button" 
                      onClick={() => setAdjustAmount(prev => -Math.abs(prev))}
                      className={`px-3 transition-colors ${adjustAmount < 0 ? 'bg-red-600 text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
                    >
                      DEBIT
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setAdjustAmount(prev => Math.abs(prev))}
                      className={`px-3 transition-colors ${adjustAmount >= 0 ? 'bg-green-600 text-white' : 'hover:bg-zinc-800 text-zinc-400'}`}
                    >
                      CREDIT
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Adjustment Type</label>
                <select 
                  value={adjustType}
                  onChange={(e) => setAdjustType(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-purple-500"
                  id="adjust-type"
                >
                  <option value="admin_reward">Admin Reward</option>
                  <option value="creator_reward">Creator Reward</option>
                  <option value="refund">Refund Adjustment</option>
                  <option value="manual_adjustment">Manual Correction Adjustment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Justification Comment</label>
                <textarea 
                  required
                  placeholder="E.g., Reimbursement for system bug"
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  className="w-full h-20 bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  id="adjust-desc"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  id="submit-adjust-btn"
                >
                  Apply Balance Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Freeze / Unfreeze Justification Modal */}
      {showFreezeModal && freezeWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md" id="freeze-modal-backdrop">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-850 rounded-3xl p-6 relative" id="freeze-modal">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Ban className="w-5 h-5 text-red-500" /> Wallet security freeze
              </h3>
              <button onClick={() => setShowFreezeModal(false)} className="p-1 text-zinc-500 hover:text-white transition-colors">&times;</button>
            </div>

            <form onSubmit={handleToggleFreeze} className="space-y-4">
              <p className="text-xs text-zinc-400">
                You are updating the security lock state for user <strong className="text-white">@{freezeWallet.username}</strong> to <strong className={freezeWallet.is_frozen ? 'text-green-400' : 'text-red-500'}>{freezeWallet.is_frozen ? 'UNFROZEN (ACTIVE)' : 'FROZEN (LOCKED)'}</strong>.
              </p>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase">Audit Justification Comment</label>
                <textarea 
                  required
                  placeholder="E.g., Suspected double-spending attempts or referral exploit logs."
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-800 px-4 py-2.5 text-xs text-white rounded-xl focus:outline-none focus:border-purple-500 resize-none"
                  id="freeze-reason"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${freezeWallet.is_frozen ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}
                  id="submit-freeze-btn"
                >
                  {freezeWallet.is_frozen ? 'Remove Lock' : 'Enable Security Freeze'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '../../store/authStore';
import { useCreatorMonetizationStore } from '../../store/creatorMonetizationStore';
import { 
  DollarSign, Coins, TrendingUp, Users, Heart, Sparkles, Briefcase, 
  HelpCircle, AlertCircle, Calendar, RefreshCw, Download, FileText, 
  ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Award, Lock, 
  ChevronRight, CheckCircle2, Search, Filter, Play, Check, Send, ChevronDown,
  Plus, Trash2, Upload, CreditCard, Building, FileCheck, ShieldAlert, QrCode
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

const SOURCES_METADATA: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  gift: { label: 'Virtual Gifts', icon: Coins, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  story_reward: { label: 'Story Rewards', icon: Sparkles, color: 'text-orange-400', bg: 'bg-orange-500/10' },
  post_reward: { label: 'Post Rewards', icon: Heart, color: 'text-pink-400', bg: 'bg-pink-500/10' },
  omniclip_reward: { label: 'OmniClip Rewards', icon: Play, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  referral: { label: 'Referral Share', icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  premium_share: { label: 'Premium Rev-Share', icon: Award, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  challenge: { label: 'Challenges', icon: ShieldCheck, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  sponsored: { label: 'Sponsored Content', icon: Briefcase, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
  brand_collab: { label: 'Brand Collabs', icon: Send, color: 'text-teal-400', bg: 'bg-teal-500/10' },
  community_revenue: { label: 'Community Revenue', icon: Users, color: 'text-violet-400', bg: 'bg-violet-500/10' },
  event_reward: { label: 'Event Rewards', icon: Calendar, color: 'text-rose-400', bg: 'bg-rose-500/10' },
  payout: { label: 'Payout Transfer', icon: ArrowDownRight, color: 'text-red-400', bg: 'bg-red-500/10' }
};

export default function CreatorMonetizationView() {
  const { user } = useAuthStore();
  const store = useCreatorMonetizationStore();

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [withdrawDescription, setWithdrawDescription] = useState('');
  
  const [activeReportName, setActiveReportName] = useState('');
  const [reportStart, setReportStart] = useState('');
  const [reportEnd, setReportEnd] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Payout Account states
  const [addMethodId, setAddMethodId] = useState<'upi' | 'bank_account'>('upi');
  const [upiId, setUpiId] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfscCode, setBankIfscCode] = useState('');
  const [uploadedDocName, setUploadedDocName] = useState('');
  const [uploadedDocType, setUploadedDocType] = useState('ID Proof (PAN/Aadhaar)');
  const [uploadedDocUrl, setUploadedDocUrl] = useState('');
  const [payoutMethodFormOpen, setPayoutMethodFormOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (user?.id) {
      store.fetchCreatorData(user.id);
      store.fetchReports(user.id);
    }
  }, [user?.id]);

  // Set default selected payout account once loaded
  useEffect(() => {
    if (store.paymentAccounts && store.paymentAccounts.length > 0 && !selectedAccountId) {
      const verified = store.paymentAccounts.find(a => a.verification_status === 'verified');
      if (verified) {
        setSelectedAccountId(verified.id);
      } else {
        setSelectedAccountId(store.paymentAccounts[0].id);
      }
    }
  }, [store.paymentAccounts]);

  const handleRefresh = async () => {
    if (user?.id) {
      await store.fetchCreatorData(user.id);
    }
  };

  // Drag and Drop document handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedDocName(file.name);
      setUploadedDocUrl(URL.createObjectURL(file));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedDocName(file.name);
      setUploadedDocUrl(URL.createObjectURL(file));
    }
  };

  const handleAddPayoutMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!user?.id) return;

    let details = {};
    if (addMethodId === 'upi') {
      if (!upiId.trim() || !upiId.includes('@')) {
        setErrorMessage('Please enter a valid UPI ID (e.g., name@okaxis).');
        return;
      }
      details = { upi_id: upiId.trim() };
    } else {
      if (!bankHolderName.trim() || !bankName.trim() || !bankAccountNumber.trim() || !bankIfscCode.trim()) {
        setErrorMessage('Please fill in all bank details.');
        return;
      }
      details = {
        holder_name: bankHolderName.trim(),
        bank_name: bankName.trim(),
        account_number: bankAccountNumber.trim(),
        ifsc_code: bankIfscCode.trim()
      };
    }

    if (!uploadedDocName) {
      setErrorMessage('Please upload a proof of identity / verification document.');
      return;
    }

    const res = await store.addPaymentAccount(
      user.id,
      addMethodId,
      details,
      uploadedDocType,
      uploadedDocUrl || 'https://example.com/mock-id-document.pdf'
    );

    if (res.success) {
      setSuccessMessage(res.message || 'Payout method added successfully!');
      setUpiId('');
      setBankHolderName('');
      setBankName('');
      setBankAccountNumber('');
      setBankIfscCode('');
      setUploadedDocName('');
      setUploadedDocUrl('');
      setPayoutMethodFormOpen(false);
      await store.fetchCreatorData(user.id);
    } else {
      setErrorMessage(res.error || 'Failed to add payout method.');
    }
  };

  const handleDeletePayoutAccount = async (accountId: string) => {
    if (!user?.id) return;
    if (confirm('Are you sure you want to remove this payout method?')) {
      const res = await store.deletePaymentAccount(accountId, user.id);
      if (res.success) {
        if (selectedAccountId === accountId) {
          setSelectedAccountId('');
        }
        await store.fetchCreatorData(user.id);
      }
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      setErrorMessage('Please enter a valid positive withdrawal amount.');
      return;
    }

    if (amount < 50) {
      setErrorMessage('Minimum withdrawal amount is $50.00.');
      return;
    }

    if (store.summary && store.summary.available_balance < amount) {
      setErrorMessage('Insufficient available balance to proceed with withdrawal.');
      return;
    }

    if (!selectedAccountId) {
      setErrorMessage('Please register and select a verified payout method.');
      return;
    }

    const selectedAccount = store.paymentAccounts.find(a => a.id === selectedAccountId);
    if (!selectedAccount) {
      setErrorMessage('Selected payout account not found.');
      return;
    }

    // Determine processing speed and limits based on selected method
    const isUpi = selectedAccount.method_id === 'upi';
    if (isUpi && amount > 1000) {
      setErrorMessage('Maximum withdrawal per transaction for UPI is $1,000.00. For higher payouts, please use Bank Transfer.');
      return;
    }
    if (!isUpi && amount > 5000) {
      setErrorMessage('Maximum withdrawal per transaction is $5,000.00.');
      return;
    }

    // Check Eligibility next withdrawal date
    if (store.summary?.next_eligible_withdrawal_date) {
      const eligibleDate = new Date(store.summary.next_eligible_withdrawal_date);
      if (eligibleDate > new Date()) {
        setErrorMessage(`You will be eligible for your next withdrawal payout after ${eligibleDate.toLocaleDateString()}.`);
        return;
      }
    }

    let accountLabel = '';
    if (isUpi) {
      accountLabel = `UPI: ${selectedAccount.details.upi_id}`;
    } else {
      accountLabel = `Bank: ${selectedAccount.details.bank_name} - A/C: ****${selectedAccount.details.account_number?.slice(-4)}`;
    }

    if (user?.id) {
      const result = await store.requestWithdrawal(
        user.id,
        amount,
        `${withdrawDescription.trim() || 'Creator Earnings Payout'} (${accountLabel})`,
        selectedAccountId
      );

      if (result.success) {
        setSuccessMessage(result.message || 'Withdrawal request submitted successfully!');
        setWithdrawAmount('');
        setWithdrawDescription('');
        setTimeout(() => setWithdrawModalOpen(false), 2000);
      } else {
        setErrorMessage(result.error || 'Failed to submit withdrawal request.');
      }
    }
  };

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReportName.trim() || !reportStart || !reportEnd) {
      alert('Please fill in all report parameters.');
      return;
    }
    if (user?.id) {
      await store.generateReport(user.id, activeReportName, reportStart, reportEnd);
      setActiveReportName('');
      setReportStart('');
      setReportEnd('');
      setReportModalOpen(false);
    }
  };

  const handleDownloadStatement = (format: 'csv' | 'json') => {
    if (!user?.id) return;
    
    const txs = store.transactions;
    let dataStr = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      dataStr = JSON.stringify(txs, null, 2);
      mimeType = 'application/json';
      fileName = `omnix_earnings_${user.id.slice(0, 8)}.json`;
    } else {
      const headers = ['Transaction ID', 'Date', 'Source', 'Content ID', 'Amount', 'Status', 'Description'];
      const rows = txs.map(t => [
        t.id,
        new Date(t.date).toLocaleDateString(),
        t.source,
        t.content_id || '',
        t.amount,
        t.status,
        `"${t.description.replace(/"/g, '""')}"`
      ]);
      dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
      fileName = `omnix_earnings_${user.id.slice(0, 8)}.csv`;
    }

    const blob = new Blob([dataStr], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter Transactions
  const filteredTxs = store.transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSource = sourceFilter === 'all' || t.source === sourceFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesSearch && matchesSource && matchesStatus;
  });

  // Recharts preparation
  const sourceAmounts: Record<string, number> = {};
  store.transactions.forEach(t => {
    if (t.amount > 0 && t.status === 'completed') {
      sourceAmounts[t.source] = (sourceAmounts[t.source] || 0) + t.amount;
    }
  });

  const pieData = Object.entries(sourceAmounts).map(([source, val]) => ({
    name: SOURCES_METADATA[source]?.label || source,
    value: parseFloat(val.toFixed(2))
  })).sort((a, b) => b.value - a.value);

  // Time sequence chart data for the past 7 records of earnings
  const lineData = [...store.transactions]
    .filter(t => t.amount > 0 && t.status === 'completed')
    .reverse()
    .slice(-7)
    .map(t => ({
      date: new Date(t.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      amount: t.amount,
      source: SOURCES_METADATA[t.source]?.label || t.source
    }));

  const COLORS = ['#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1', '#06b6d4', '#14b8a6', '#f43f5e', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Synchronization Error Warning */}
      {store.error && (
        <div className="bg-red-950/40 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-white text-xs font-black">Sync Warning</h4>
            <p className="text-zinc-400 text-[11px] mt-0.5">{store.error}</p>
          </div>
        </div>
      )}

      {/* Local Storage Sandbox Badge */}
      {store.useLocalFallback && (
        <div className="bg-purple-900/10 border border-purple-500/20 px-4 py-2.5 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            <span className="text-[10px] text-purple-300 font-bold tracking-wider uppercase">Sandbox Mode Active</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold">Data persistently cached locally</span>
        </div>
      )}

      {/* Main Stats Header */}
      {store.summary && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: "Today", val: store.summary.today_earnings, color: "text-purple-400" },
            { label: "Yesterday", val: store.summary.yesterday_earnings, color: "text-zinc-400" },
            { label: "This Week", val: store.summary.weekly_earnings, color: "text-indigo-400" },
            { label: "This Month", val: store.summary.monthly_earnings, color: "text-emerald-400" },
            { label: "This Year", val: store.summary.yearly_earnings, color: "text-pink-400" },
            { label: "Lifetime", val: store.summary.lifetime_earnings, color: "text-purple-500" }
          ].map((item, i) => (
            <div key={i} className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between hover:border-purple-500/10 transition-all">
              <span className="text-[9px] text-zinc-500 font-black uppercase tracking-wider">{item.label} Earnings</span>
              <h3 className={`text-xl font-black mt-2 ${item.color}`}>${item.val.toFixed(2)}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Payout & Creator Levels */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Payout Summary Card */}
        {store.summary && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl md:col-span-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-purple-400" /> Payout Summary
                </h3>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full uppercase">Verified Account</span>
              </div>

              <div className="grid grid-cols-2 gap-4 my-6">
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-wider block mb-1">Available Payout</span>
                  <h4 className="text-2xl font-black text-purple-400">${store.summary.available_balance.toFixed(2)}</h4>
                </div>
                <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl">
                  <span className="text-zinc-500 text-[9px] font-black uppercase tracking-wider block mb-1">Pending Clearance</span>
                  <h4 className="text-2xl font-black text-zinc-400">${store.summary.pending_balance.toFixed(2)}</h4>
                </div>
              </div>

              <div className="space-y-2 text-xs border-t border-zinc-800/60 pt-4">
                <div className="flex justify-between text-zinc-400">
                  <span>Processing Withdrawals</span>
                  <span className="text-white font-bold">${store.summary.processing_balance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Lifetime Withdrawn</span>
                  <span className="text-white font-bold">${store.summary.withdrawn_balance.toFixed(2)}</span>
                </div>
                {store.summary.last_withdrawal_date && (
                  <div className="flex justify-between text-zinc-500 text-[10px]">
                    <span>Last Payout Cleared</span>
                    <span>{new Date(store.summary.last_withdrawal_date).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button 
                onClick={() => setWithdrawModalOpen(true)}
                disabled={store.summary.available_balance < 50 || store.summary.frozen || store.summary.monetization_suspended}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:hover:bg-purple-600 text-white text-xs font-bold py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-purple-500/10"
              >
                <ArrowUpRight className="w-4 h-4" /> Request Withdrawal Payout
              </button>
              {store.summary.available_balance < 50 && (
                <p className="text-zinc-500 text-[10px] text-center mt-1">Minimum payout request is $50.00. Convert more coins to reach limit.</p>
              )}
            </div>
          </div>
        )}

        {/* Creator Levels Progress Banner */}
        {store.levels && (
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl md:col-span-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-400 animate-bounce" /> Creator Levels & Achievements
                </h3>
                <span className="text-[10px] text-zinc-400 font-bold">Score: <strong className="text-purple-400">{store.levels.score}/100</strong></span>
              </div>

              <div className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-lg font-black text-white flex items-center gap-2">
                    {store.levels.rank}
                  </h4>
                  <p className="text-zinc-500 text-xs mt-0.5">Level {store.levels.level} Pro Star Profile</p>
                </div>
                <div className="w-12 h-12 bg-purple-600/15 border border-purple-500/20 rounded-full flex items-center justify-center text-xl shadow-inner shadow-purple-500/5">
                  🏆
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 mt-6">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-zinc-400">Progress to Next Rank</span>
                  <span className="text-purple-400">{store.levels.progress}%</span>
                </div>
                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850 p-0.5">
                  <div className="bg-gradient-to-r from-purple-600 to-indigo-500 h-full rounded-full" style={{ width: `${store.levels.progress}%` }} />
                </div>
              </div>
            </div>

            {/* Achievements unlocks tracking list */}
            <div className="mt-6 border-t border-zinc-800/60 pt-4">
              <h4 className="text-zinc-400 text-xs font-bold mb-3">Recent Unlocked Achievements</h4>
              <div className="flex flex-wrap gap-2">
                {store.achievements.length === 0 ? (
                  <span className="text-zinc-500 text-xs italic">No achievements unlocked yet. Continue uploading stories & posts!</span>
                ) : (
                  store.achievements.map((ach, idx) => (
                    <span 
                      key={idx} 
                      className="text-[10px] bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold px-3 py-1 rounded-full flex items-center gap-1.5"
                    >
                      👑 {ach.achievement_type.replace('_', ' ')}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payout Methods & KYC Verification Card */}
      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/60">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-purple-400" /> Registered Payout Accounts & Verification
            </h3>
            <p className="text-zinc-500 text-[11px] mt-0.5">Manage your direct deposit methods and upload required tax/ID documents for secure settlements.</p>
          </div>
          <button
            onClick={() => setPayoutMethodFormOpen(!payoutMethodFormOpen)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold py-2 px-4 rounded-xl transition-colors flex items-center gap-1.5 self-start md:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Register Payout Method
          </button>
        </div>

        {/* Payout Method Form */}
        <AnimatePresence>
          {payoutMethodFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleAddPayoutMethod} className="bg-zinc-950/50 border border-zinc-850 p-5 rounded-2xl space-y-4 text-xs">
                <div className="flex items-center gap-6 pb-2 border-b border-zinc-900">
                  <span className="text-zinc-400 font-bold">Account Type:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="addMethodId"
                      checked={addMethodId === 'upi'}
                      onChange={() => setAddMethodId('upi')}
                      className="accent-purple-500"
                    />
                    UPI Transfer (Instant)
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-white">
                    <input
                      type="radio"
                      name="addMethodId"
                      checked={addMethodId === 'bank_account'}
                      onChange={() => setAddMethodId('bank_account')}
                      className="accent-purple-500"
                    />
                    Direct Bank Deposit (1-2 days)
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {addMethodId === 'upi' ? (
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-zinc-400 font-bold block">UPI ID / Virtual Payment Address (VPA)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. username@okaxis, brand@ybl"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 text-xs"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold block">Account Holder Name</label>
                        <input
                          type="text"
                          required
                          placeholder="Full Name as in Bank Records"
                          value={bankHolderName}
                          onChange={e => setBankHolderName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold block">Bank Name</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., HDFC Bank, Axis Bank, Chase"
                          value={bankName}
                          onChange={e => setBankName(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold block">Account Number</label>
                        <input
                          type="text"
                          required
                          placeholder="Bank Account Number"
                          value={bankAccountNumber}
                          onChange={e => setBankAccountNumber(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-zinc-400 font-bold block">IFSC / Routing Code</label>
                        <input
                          type="text"
                          required
                          placeholder="IFSC (e.g., HDFC0001234) / ABA Routing"
                          value={bankIfscCode}
                          onChange={e => setBankIfscCode(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 text-xs"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Identity Verification Document Section */}
                <div className="space-y-2 border-t border-zinc-900 pt-3">
                  <div className="flex items-center justify-between">
                    <label className="text-zinc-400 font-bold">Required Verification Proof</label>
                    <select
                      value={uploadedDocType}
                      onChange={e => setUploadedDocType(e.target.value)}
                      className="bg-zinc-900 border border-zinc-850 text-zinc-300 text-[10px] rounded p-1 outline-none font-bold"
                    >
                      <option value="ID Proof (PAN/Aadhaar)">PAN / Aadhaar / Passport ID</option>
                      <option value="Voided Check">Voided Check</option>
                      <option value="Bank Statement">Recent Bank Statement</option>
                    </select>
                  </div>

                  {/* Document Dropzone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center transition-all cursor-pointer ${
                      dragActive ? 'border-purple-500 bg-purple-500/5' : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700'
                    }`}
                    onClick={() => document.getElementById('doc-upload-input')?.click()}
                  >
                    <input
                      id="doc-upload-input"
                      type="file"
                      className="hidden"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                    />
                    <Upload className="w-5 h-5 text-zinc-500 mb-1" />
                    {uploadedDocName ? (
                      <div className="text-center">
                        <p className="text-white font-bold text-[11px]">{uploadedDocName}</p>
                        <p className="text-[10px] text-emerald-400 flex items-center justify-center gap-1 mt-0.5"><Check className="w-3 h-3" /> Ready for upload</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-zinc-400 font-bold text-[10px]">Drag & drop verification files here, or <span className="text-purple-400">browse</span></p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">Supports PDF, PNG, JPG (Max 5MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Register & Submit Verification
                  </button>
                  <button
                    type="button"
                    onClick={() => setPayoutMethodFormOpen(false)}
                    className="border border-zinc-800 hover:bg-zinc-900 text-zinc-400 py-2 px-4 rounded-xl font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* List of Registered Accounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {store.paymentAccounts.length === 0 ? (
            <div className="md:col-span-2 bg-zinc-950 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
              <ShieldAlert className="w-8 h-8 text-zinc-600" />
              <p className="text-zinc-400 text-xs font-bold">No registered payout accounts found.</p>
              <p className="text-zinc-500 text-[10px] max-w-sm">To request withdrawal payout, please register your UPI or Bank Account with identity verification first.</p>
            </div>
          ) : (
            store.paymentAccounts.map((acc) => {
              const isUpi = acc.method_id === 'upi';
              return (
                <div key={acc.id} className="bg-zinc-950 border border-zinc-850 p-4 rounded-2xl flex flex-col justify-between hover:border-zinc-750 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2.5">
                      <div className="w-9 h-9 bg-zinc-900 border border-zinc-800 rounded-lg flex items-center justify-center text-lg mt-0.5">
                        {isUpi ? <QrCode className="w-4 h-4 text-purple-400" /> : <Building className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-white font-bold text-xs">{isUpi ? 'UPI Transfer' : acc.details.bank_name || 'Direct Deposit'}</h4>
                          {acc.verification_status === 'verified' && (
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Check className="w-2.5 h-2.5" /> Verified
                            </span>
                          )}
                          {acc.verification_status === 'pending' && (
                            <span className="text-[9px] bg-amber-500/10 text-amber-400 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Clock className="w-2.5 h-2.5 animate-spin" /> Pending KYC
                            </span>
                          )}
                          {acc.verification_status === 'rejected' && (
                            <span className="text-[9px] bg-rose-500/10 text-rose-400 font-bold px-1.5 py-0.5 rounded">
                              Rejected
                            </span>
                          )}
                        </div>
                        {isUpi ? (
                          <p className="font-mono text-zinc-300 text-xs mt-1">{acc.details.upi_id}</p>
                        ) : (
                          <div className="text-[11px] text-zinc-400 mt-1 space-y-0.5">
                            <p>Holder: <strong className="text-zinc-200">{acc.details.holder_name}</strong></p>
                            <p>A/C: <strong className="font-mono text-zinc-200">****{acc.details.account_number?.slice(-4)}</strong></p>
                            <p>Routing/IFSC: <strong className="font-mono text-zinc-200">{acc.details.ifsc_code}</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePayoutAccount(acc.id)}
                      className="text-zinc-600 hover:text-red-400 p-1.5 rounded transition-all shrink-0"
                      title="Remove payout method"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="border-t border-zinc-900 mt-3 pt-2 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Added {new Date(acc.created_at).toLocaleDateString()}</span>
                    <span>{isUpi ? 'Limit: $1,000/tx' : 'Limit: $5,000/tx'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Eligibility Checkbox Guide */}
        <div className="bg-zinc-950/40 border border-zinc-850 p-4 rounded-2xl">
          <h4 className="text-white font-bold text-xs mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-purple-400" /> KYC Identity & Withdrawal Eligibility Status
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span>Creator Profile Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-emerald-400" />
              </div>
              <span>Platform Authenticity Verification Passed</span>
            </div>
            <div className="flex items-center gap-2">
              {store.summary && store.summary.available_balance >= 50 ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-rose-400" />
                </div>
              )}
              <span>Minimum Payout Balance Reached ($50.00 threshold)</span>
            </div>
            <div className="flex items-center gap-2">
              {store.paymentAccounts.some(a => a.verification_status === 'verified') ? (
                <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 text-emerald-400" />
                </div>
              ) : (
                <div className="w-4 h-4 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Clock className="w-2.5 h-2.5 text-amber-400" />
                </div>
              )}
              <span>Approved Payout Method Verified (KYC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Data Visualization Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Earnings Over Time Area Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl lg:col-span-7">
          <h3 className="text-white font-bold text-sm mb-4">Earnings History (Past Deposits)</h3>
          <div className="h-64">
            {lineData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                No verified deposits found. Complete missions, stream updates, or receive gifts to start!
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={lineData}>
                  <defs>
                    <linearGradient id="colorDeposit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#09090b', border: '1px solid #27272a', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="amount" stroke="#a855f7" strokeWidth={2} name="Earning ($)" fillOpacity={1} fill="url(#colorDeposit)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Earning Sources breakdown Pie Chart */}
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl lg:col-span-5">
          <h3 className="text-white font-bold text-sm mb-4">Earning Revenue Sources</h3>
          <div className="h-64 flex flex-col justify-between">
            {pieData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
                Revenue split analysis will appear when your wallet receives transactions.
              </div>
            ) : (
              <>
                <div className="h-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Custom list description */}
                <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-zinc-400 overflow-y-auto max-h-16 pt-2 border-t border-zinc-800/40">
                  {pieData.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 truncate">
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="truncate">{item.name}: <strong className="text-white">${item.value.toFixed(2)}</strong></span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Transaction History Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-white font-bold text-sm">Monetization Transactions</h3>
            <p className="text-zinc-500 text-xs mt-0.5">Real-time ledger audit history</p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => handleDownloadStatement('csv')} 
              className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> CSV Export
            </button>
            <button 
              onClick={() => handleDownloadStatement('json')} 
              className="px-3.5 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> JSON Export
            </button>
          </div>
        </div>

        {/* Filters and search box */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
          <div className="relative col-span-2">
            <input 
              type="text"
              placeholder="Search by description or transaction..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 px-3 pl-9 text-xs text-white placeholder-zinc-500 outline-none focus:border-purple-500"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-3" />
          </div>

          <select
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
          >
            <option value="all">All Earning Sources</option>
            {Object.entries(SOURCES_METADATA).map(([key, item]) => (
              <option key={key} value={key}>{item.label}</option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-xl p-2 text-xs text-white outline-none"
          >
            <option value="all">All Payout Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Interactive Transaction History Table */}
        <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/40">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-zinc-850 text-zinc-400 uppercase font-black tracking-wider bg-zinc-950/60">
                <th className="p-3">Reference / Date</th>
                <th className="p-3">Source Channel</th>
                <th className="p-3">ledger description</th>
                <th className="p-3 text-right">Transaction Amount</th>
                <th className="p-3 text-center">Transfer Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-850 text-zinc-300">
              {filteredTxs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 italic">No ledger transaction records found.</td>
                </tr>
              ) : (
                filteredTxs.map((tx) => {
                  const src = SOURCES_METADATA[tx.source] || { label: tx.source, icon: HelpCircle, color: 'text-zinc-400', bg: 'bg-zinc-500/10' };
                  const SrcIcon = src.icon;
                  const isEarning = tx.amount > 0;

                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/40 transition-all">
                      <td className="p-3">
                        <span className="font-mono text-[10px] text-zinc-400 block truncate max-w-[100px]">{tx.id}</span>
                        <span className="text-[10px] text-zinc-500 mt-0.5 block">{new Date(tx.date).toLocaleDateString()}</span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold ${src.bg} ${src.color}`}>
                          <SrcIcon className="w-3 h-3" />
                          {src.label}
                        </span>
                      </td>
                      <td className="p-3 max-w-xs font-medium text-zinc-300 text-xs truncate">
                        {tx.description}
                      </td>
                      <td className={`p-3 text-right font-black ${isEarning ? 'text-green-400' : 'text-red-400'}`}>
                        {isEarning ? '+' : ''}${tx.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-400'
                          : tx.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400'
                          : tx.status === 'processing' ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reports Center */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-white font-bold text-sm">Revenue Reports</h3>
            <p className="text-zinc-500 text-xs">Generate custom statements & summary reports</p>
          </div>
          <button 
            onClick={() => setReportModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Generate Custom Report
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {store.reports.length === 0 ? (
            <div className="p-6 text-center border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-xs col-span-2">
              No custom reports compiled yet. Fill in date boundaries to create reports.
            </div>
          ) : (
            store.reports.map((report) => (
              <div key={report.id} className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-600/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-xs">{report.report_name}</h4>
                    <p className="text-zinc-500 text-[10px] mt-0.5">
                      {new Date(report.start_date).toLocaleDateString()} to {new Date(report.end_date).toLocaleDateString()}
                    </p>
                    <span className="text-purple-400 text-xs font-black mt-2 block">Total Revenue: ${report.total_revenue.toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-0.5 rounded uppercase">{report.payout_status || 'Ready'}</span>
                  <button 
                    onClick={() => {
                      // Custom download compiled report
                      const reportContent = `Omnix Creator Monetization Report: ${report.report_name}\nCreated: ${new Date(report.created_at).toLocaleString()}\nPeriod: ${new Date(report.start_date).toLocaleDateString()} - ${new Date(report.end_date).toLocaleDateString()}\nTotal Compiled Revenue: $${report.total_revenue.toFixed(2)}\nPayout Status: ${report.payout_status || 'Completed'}`;
                      const blob = new Blob([reportContent], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `omnix_report_${report.id}.txt`;
                      link.click();
                    }}
                    className="text-[11px] text-purple-400 hover:text-purple-300 font-bold block mt-3"
                  >
                    Download Statement
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* MODAL 1: WITHDRAW PAYOUT */}
      <AnimatePresence>
        {withdrawModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-3xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-purple-400" /> Withdraw Earnings Payout
                </h3>
                <button onClick={() => setWithdrawModalOpen(false)} className="text-zinc-500 hover:text-white font-bold text-xs">Close</button>
              </div>

              {store.summary && (
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase block font-black">Available for Payout</span>
                    <span className="text-2xl font-black text-white">${store.summary.available_balance.toFixed(2)}</span>
                  </div>
                  <span className="text-[10px] bg-green-500/10 text-green-400 font-bold px-2 py-1 rounded">FAST BANK TRANFER</span>
                </div>
              )}

              <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
                {successMessage && <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl font-bold">{successMessage}</div>}
                {errorMessage && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-bold">{errorMessage}</div>}

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold">Transfer Amount ($)</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    placeholder="Enter withdrawal amount (min $50.00)"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold">Select Payout Method</label>
                  {store.paymentAccounts.length === 0 ? (
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-amber-400 font-bold flex flex-col gap-2">
                      <span>No registered payout methods found. You must register an account first.</span>
                      <button
                        type="button"
                        onClick={() => {
                          setWithdrawModalOpen(false);
                          setPayoutMethodFormOpen(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg py-1.5 px-3 self-start text-[10px]"
                      >
                        Register Payout Method Now
                      </button>
                    </div>
                  ) : (
                    <select
                      required
                      value={selectedAccountId}
                      onChange={e => setSelectedAccountId(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold"
                    >
                      <option value="">-- Choose Payout Method --</option>
                      {store.paymentAccounts.map(acc => {
                        const isUpi = acc.method_id === 'upi';
                        const statusTag = acc.verification_status !== 'verified' ? ` (${acc.verification_status.toUpperCase()})` : '';
                        const details = isUpi 
                          ? `UPI: ${acc.details.upi_id}`
                          : `Bank Account: ${acc.details.bank_name} - ****${acc.details.account_number?.slice(-4)}`;
                        return (
                          <option key={acc.id} value={acc.id}>
                            {details}{statusTag}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                {selectedAccountId && (() => {
                  const acc = store.paymentAccounts.find(a => a.id === selectedAccountId);
                  if (!acc) return null;
                  const isUpi = acc.method_id === 'upi';
                  return (
                    <div className="bg-zinc-950/60 border border-zinc-850 rounded-xl p-3 space-y-1.5 text-[10.5px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Method:</span>
                        <strong className="text-zinc-300">{isUpi ? 'UPI Transfer' : 'Direct Bank Deposit'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Processing Time:</span>
                        <strong className="text-emerald-400">{isUpi ? 'Instant (within 2 hrs)' : '1 - 2 Business Days'}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Limits:</span>
                        <strong className="text-zinc-300">{isUpi ? 'Max $1,000/tx' : 'Max $5,000/tx'}</strong>
                      </div>
                      {acc.verification_status !== 'verified' && (
                        <div className="text-amber-400 text-[10px] font-bold mt-1.5 pt-1.5 border-t border-zinc-900 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Note: This payout account is awaiting approval. Withdrawal will clear once verified.
                        </div>
                      )}
                    </div>
                  );
                })()}

                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold font-mono">Statement Memo (Optional)</label>
                  <input 
                    type="text"
                    placeholder="E.g. Bank payout Q3"
                    value={withdrawDescription}
                    onChange={e => setWithdrawDescription(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={store.paymentAccounts.length === 0}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-500/20 flex items-center justify-center gap-1.5"
                >
                  <ArrowUpRight className="w-4 h-4" /> Confirm Payout Request
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: GENERATE REPORT */}
      <AnimatePresence>
        {reportModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 w-full max-w-md p-6 rounded-3xl space-y-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800/60">
                <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" /> Generate Revenue Statement
                </h3>
                <button onClick={() => setReportModalOpen(false)} className="text-zinc-500 hover:text-white font-bold text-xs">Close</button>
              </div>

              <form onSubmit={handleGenerateReport} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-zinc-400 font-bold">Statement / Report Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="E.g. July 2026 Earnings Summary"
                    value={activeReportName}
                    onChange={e => setActiveReportName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">From Date</label>
                    <input 
                      type="date"
                      required
                      value={reportStart}
                      onChange={e => setReportStart(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-zinc-400 font-bold">To Date</label>
                    <input 
                      type="date"
                      required
                      value={reportEnd}
                      onChange={e => setReportEnd(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-white outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 py-3 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/20">
                  Compile Statement Report
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

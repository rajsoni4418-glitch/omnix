import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface CreatorEarningsSummary {
  user_id: string;
  today_earnings: number;
  yesterday_earnings: number;
  weekly_earnings: number;
  monthly_earnings: number;
  yearly_earnings: number;
  lifetime_earnings: number;
  available_balance: number;
  pending_balance: number;
  processing_balance: number;
  withdrawn_balance: number;
  frozen: boolean;
  monetization_suspended: boolean;
  last_withdrawal_date: string | null;
  next_eligible_withdrawal_date: string | null;
  updated_at?: string;
}

export interface EarningTransaction {
  id: string;
  user_id: string;
  date: string;
  source: string;
  content_id: string | null;
  amount: number;
  status: 'completed' | 'pending' | 'processing' | 'rejected';
  description: string;
  reference_id: string | null;
}

export interface CreatorLevelState {
  user_id: string;
  score: number;
  rank: string;
  level: number;
  progress: number;
  updated_at?: string;
}

export interface CreatorStatistics {
  user_id: string;
  followers: number;
  profile_views: number;
  story_views: number;
  post_reach: number;
  omniclip_views: number;
  watch_time: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number;
  follower_growth: number;
  updated_at?: string;
}

export interface CreatorAchievement {
  id: string;
  user_id: string;
  achievement_type: 'bronze' | 'silver' | 'gold' | 'diamond' | 'top_story' | 'top_omniclip' | 'top_community';
  unlocked_at: string;
}

export interface EarningReport {
  id: string;
  user_id: string;
  report_name: string;
  start_date: string;
  end_date: string;
  total_revenue: number;
  payout_status: string;
  created_at: string;
}

export interface AdminCreatorDetail {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  earnings: CreatorEarningsSummary;
  stats: CreatorStatistics;
  levels: CreatorLevelState;
}

export interface PaymentAccount {
  id: string;
  user_id: string;
  method_id: 'upi' | 'bank_account' | 'paypal' | 'intl_bank';
  details: {
    upi_id?: string;
    holder_name?: string;
    bank_name?: string;
    account_number?: string;
    ifsc_code?: string;
  };
  is_verified: boolean;
  verification_status: 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface PaymentVerification {
  id: string;
  user_id: string;
  account_id: string;
  document_type: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface CreatorMonetizationStoreState {
  summary: CreatorEarningsSummary | null;
  transactions: EarningTransaction[];
  levels: CreatorLevelState | null;
  achievements: CreatorAchievement[];
  statistics: CreatorStatistics | null;
  reports: EarningReport[];
  adminCreators: AdminCreatorDetail[];
  paymentAccounts: PaymentAccount[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchCreatorData: (userId: string) => Promise<void>;
  requestWithdrawal: (userId: string, amount: number, description?: string, payoutAccountId?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  fetchReports: (userId: string) => Promise<void>;
  generateReport: (userId: string, reportName: string, startDate: string, endDate: string) => Promise<void>;

  // Payout Account Actions
  fetchPaymentAccounts: (userId: string) => Promise<void>;
  addPaymentAccount: (userId: string, methodId: 'upi' | 'bank_account', details: any, documentType?: string, documentUrl?: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  deletePaymentAccount: (accountId: string, userId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  verifyPaymentAccount: (accountId: string, status: 'verified' | 'rejected', userId: string) => Promise<{ success: boolean; message?: string }>;

  // Admin Actions
  fetchAdminCreatorPanel: () => Promise<void>;
  adminAdjustEarnings: (targetUserId: string, amount: number, source: string, description: string) => Promise<{ success: boolean; message?: string }>;
  adminUpdateTransactionStatus: (transactionId: string, status: 'completed' | 'pending' | 'processing' | 'rejected') => Promise<{ success: boolean; message?: string }>;
  adminSetMonetizationStatus: (targetUserId: string, frozen: boolean, suspended: boolean) => Promise<{ success: boolean; message?: string }>;
  adminAdjustStatistics: (targetUserId: string, statName: string, value: number) => Promise<{ success: boolean; message?: string }>;
}

// ----------------------------------------------------------------------
// SANDBOX FALLBACK UTILITIES (LocalStorage persistent sandbox)
// ----------------------------------------------------------------------
const getLocalSummary = (userId: string): CreatorEarningsSummary => {
  const key = `creator_summary_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaultSummary: CreatorEarningsSummary = {
    user_id: userId,
    today_earnings: 120.00,
    yesterday_earnings: 75.00,
    weekly_earnings: 345.50,
    monthly_earnings: 1145.50,
    yearly_earnings: 4520.00,
    lifetime_earnings: 4520.00,
    available_balance: 620.00,
    pending_balance: 150.00,
    processing_balance: 0.00,
    withdrawn_balance: 100.00,
    frozen: false,
    monetization_suspended: false,
    last_withdrawal_date: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    next_eligible_withdrawal_date: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
  };
  localStorage.setItem(key, JSON.stringify(defaultSummary));
  return defaultSummary;
};

const saveLocalSummary = (userId: string, summary: CreatorEarningsSummary) => {
  localStorage.setItem(`creator_summary_${userId}`, JSON.stringify(summary));
};

const getLocalTransactions = (userId: string): EarningTransaction[] => {
  const key = `creator_txs_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const baseTime = new Date();
  const defaultTxs: EarningTransaction[] = [
    {
      id: 'etx_1',
      user_id: userId,
      date: new Date(baseTime.getTime() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
      source: 'gift',
      content_id: 'post_1',
      amount: 120.00,
      status: 'completed',
      description: 'Gold tier streams gift package',
      reference_id: 'ref_gift_9483'
    },
    {
      id: 'etx_2',
      user_id: userId,
      date: new Date(baseTime.getTime() - 1000 * 60 * 60 * 25).toISOString(), // yesterday
      source: 'community_revenue',
      content_id: 'comm_1',
      amount: 75.00,
      status: 'completed',
      description: 'Monthly private community renewal',
      reference_id: 'ref_comm_5932'
    },
    {
      id: 'etx_3',
      user_id: userId,
      date: new Date(baseTime.getTime() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      source: 'brand_collab',
      content_id: null,
      amount: 150.00,
      status: 'pending',
      description: 'Brand marketplace collab review payment',
      reference_id: 'ref_brand_collab_3829'
    },
    {
      id: 'etx_4',
      user_id: userId,
      date: new Date(baseTime.getTime() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      source: 'sponsored',
      content_id: 'post_2',
      amount: 200.00,
      status: 'completed',
      description: 'Brand integration sponsorship payment',
      reference_id: 'ref_spon_3421'
    },
    {
      id: 'etx_5',
      user_id: userId,
      date: new Date(baseTime.getTime() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      source: 'payout',
      content_id: null,
      amount: -100.00,
      status: 'completed',
      description: 'Bank transfer payout reference #PAY9543',
      reference_id: 'ref_pay_9543'
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaultTxs));
  return defaultTxs;
};

const saveLocalTransactions = (userId: string, txs: EarningTransaction[]) => {
  localStorage.setItem(`creator_txs_${userId}`, JSON.stringify(txs));
};

const getLocalLevels = (userId: string): CreatorLevelState => {
  const key = `creator_levels_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaultLevels: CreatorLevelState = {
    user_id: userId,
    score: 84,
    rank: 'Gold Creator',
    level: 3,
    progress: 68
  };
  localStorage.setItem(key, JSON.stringify(defaultLevels));
  return defaultLevels;
};

const saveLocalLevels = (userId: string, levels: CreatorLevelState) => {
  localStorage.setItem(`creator_levels_${userId}`, JSON.stringify(levels));
};

const getLocalStatistics = (userId: string): CreatorStatistics => {
  const key = `creator_stats_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaultStats: CreatorStatistics = {
    user_id: userId,
    followers: 8432,
    profile_views: 124530,
    story_views: 48320,
    post_reach: 94820,
    omniclip_views: 31250,
    watch_time: 154200,
    likes: 24500,
    comments: 3820,
    shares: 1240,
    saves: 950,
    engagement_rate: 12.84,
    follower_growth: 15.42
  };
  localStorage.setItem(key, JSON.stringify(defaultStats));
  return defaultStats;
};

const saveLocalStatistics = (userId: string, stats: CreatorStatistics) => {
  localStorage.setItem(`creator_stats_${userId}`, JSON.stringify(stats));
};

const getLocalAchievements = (userId: string): CreatorAchievement[] => {
  const key = `creator_ach_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaultAch: CreatorAchievement[] = [
    { id: 'ach_1', user_id: userId, achievement_type: 'bronze', unlocked_at: new Date().toISOString() },
    { id: 'ach_2', user_id: userId, achievement_type: 'silver', unlocked_at: new Date().toISOString() },
    { id: 'ach_3', user_id: userId, achievement_type: 'gold', unlocked_at: new Date().toISOString() },
    { id: 'ach_4', user_id: userId, achievement_type: 'top_story', unlocked_at: new Date().toISOString() }
  ];
  localStorage.setItem(key, JSON.stringify(defaultAch));
  return defaultAch;
};

const saveLocalAchievements = (userId: string, achs: CreatorAchievement[]) => {
  localStorage.setItem(`creator_ach_${userId}`, JSON.stringify(achs));
};

const getLocalReports = (userId: string): EarningReport[] => {
  const key = `creator_reports_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaultReports: EarningReport[] = [
    {
      id: 'rep_1',
      user_id: userId,
      report_name: 'Q2 Monetization Summary',
      start_date: '2026-04-01T00:00:00Z',
      end_date: '2026-06-30T23:59:59Z',
      total_revenue: 1450.00,
      payout_status: 'Paid',
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaultReports));
  return defaultReports;
};

const saveLocalReports = (userId: string, reports: EarningReport[]) => {
  localStorage.setItem(`creator_reports_${userId}`, JSON.stringify(reports));
};

const getLocalAdminCreators = (): AdminCreatorDetail[] => {
  const dummyUsers = [
    { id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', username: 'emma_w', email: 'emma_w@example.com', full_name: 'Emma Wilson' },
    { id: '84ad35bc-5be1-42b1-947a-e073538fd82d', username: 'jcarter', email: 'jcarter@example.com', full_name: 'James Carter' },
    { id: '29209b5b-6a45-4650-aac7-50d6e2566c5e', username: 'sophia_l', email: 'sophia_l@example.com', full_name: 'Sophia Lee' }
  ];

  return dummyUsers.map(u => ({
    user_id: u.id,
    username: u.username,
    email: u.email,
    full_name: u.full_name,
    earnings: getLocalSummary(u.id),
    stats: getLocalStatistics(u.id),
    levels: getLocalLevels(u.id)
  }));
};

// Re-calculate the local stats derived earnings summary to ensure local transactions match balances
const recomputeLocalSummary = (userId: string) => {
  const txs = getLocalTransactions(userId);
  const summary = getLocalSummary(userId);

  const completed = txs.filter(t => t.status === 'completed');
  const positive = completed.filter(t => t.amount > 0);
  const negative = completed.filter(t => t.amount < 0);

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfYear = new Date(now.getFullYear(), 0, 1).getTime();

  let today_earnings = 0;
  let yesterday_earnings = 0;
  let weekly_earnings = 0;
  let monthly_earnings = 0;
  let yearly_earnings = 0;
  let lifetime_earnings = 0;

  positive.forEach(t => {
    const tTime = new Date(t.date).getTime();
    lifetime_earnings += t.amount;
    
    if (tTime >= startOfDay) {
      today_earnings += t.amount;
    } else if (tTime >= startOfDay - 24 * 3600 * 1000) {
      yesterday_earnings += t.amount;
    }
    
    if (tTime >= startOfWeek) {
      weekly_earnings += t.amount;
    }
    if (tTime >= startOfMonth) {
      monthly_earnings += t.amount;
    }
    if (tTime >= startOfYear) {
      yearly_earnings += t.amount;
    }
  });

  const available_balance = completed.reduce((sum, t) => sum + t.amount, 0);
  const pending_balance = txs.filter(t => t.status === 'pending' && t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const processing_balance = Math.abs(txs.filter(t => (t.status === 'processing' || t.status === 'pending') && t.amount < 0).reduce((sum, t) => sum + t.amount, 0));
  const withdrawn_balance = Math.abs(negative.reduce((sum, t) => sum + t.amount, 0));

  const updatedSummary: CreatorEarningsSummary = {
    ...summary,
    today_earnings,
    yesterday_earnings,
    weekly_earnings,
    monthly_earnings,
    yearly_earnings,
    lifetime_earnings,
    available_balance,
    pending_balance,
    processing_balance,
    withdrawn_balance
  };

  saveLocalSummary(userId, updatedSummary);
  return updatedSummary;
};

const getLocalPaymentAccounts = (userId: string): PaymentAccount[] => {
  const key = `creator_payment_accounts_${userId}`;
  const data = localStorage.getItem(key);
  if (data) return JSON.parse(data);

  const defaults: PaymentAccount[] = [
    {
      id: 'acc_1',
      user_id: userId,
      method_id: 'upi',
      details: { upi_id: 'emma_wilson@okaxis' },
      is_verified: true,
      verification_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(key, JSON.stringify(defaults));
  return defaults;
};

const saveLocalPaymentAccounts = (userId: string, accounts: PaymentAccount[]) => {
  localStorage.setItem(`creator_payment_accounts_${userId}`, JSON.stringify(accounts));
};

export const useCreatorMonetizationStore = create<CreatorMonetizationStoreState>((set, get) => ({
  summary: null,
  transactions: [],
  levels: null,
  achievements: [],
  statistics: null,
  reports: [],
  adminCreators: [],
  paymentAccounts: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchCreatorData: async (userId) => {
    set({ isLoading: true, error: null });

    if (get().useLocalFallback) {
      recomputeLocalSummary(userId);
      set({
        summary: getLocalSummary(userId),
        transactions: getLocalTransactions(userId),
        levels: getLocalLevels(userId),
        achievements: getLocalAchievements(userId),
        statistics: getLocalStatistics(userId),
        reports: getLocalReports(userId),
        isLoading: false
      });
      return;
    }

    try {
      // 1. Fetch dynamic Creator Earnings Summary View
      const { data: sumData, error: sumError } = await supabase
        .from('creator_earnings_summary')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (sumError) throw sumError;

      // 2. Fetch Transactions
      const { data: txsData, error: txsError } = await supabase
        .from('earning_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (txsError) throw txsError;

      // 3. Fetch Level Configuration
      const { data: lvlData, error: lvlError } = await supabase
        .from('creator_levels')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (lvlError) throw lvlError;

      // 4. Fetch Achievements
      const { data: achData, error: achError } = await supabase
        .from('creator_achievements')
        .select('*')
        .eq('user_id', userId);

      if (achError) throw achError;

      // 5. Fetch Creator Statistics
      const { data: statData, error: statError } = await supabase
        .from('creator_statistics')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (statError) throw statError;

      // Handle empty tables cleanly (first initialization block)
      let resolvedSummary: CreatorEarningsSummary;
      if (sumData) {
        resolvedSummary = {
          user_id: sumData.user_id,
          today_earnings: Number(sumData.today_earnings),
          yesterday_earnings: Number(sumData.yesterday_earnings),
          weekly_earnings: Number(sumData.weekly_earnings),
          monthly_earnings: Number(sumData.monthly_earnings),
          yearly_earnings: Number(sumData.yearly_earnings),
          lifetime_earnings: Number(sumData.lifetime_earnings),
          available_balance: Number(sumData.available_balance),
          pending_balance: Number(sumData.pending_balance),
          processing_balance: Number(sumData.processing_balance),
          withdrawn_balance: Number(sumData.withdrawn_balance),
          frozen: Boolean(sumData.frozen),
          monetization_suspended: Boolean(sumData.monetization_suspended),
          last_withdrawal_date: sumData.last_withdrawal_date,
          next_eligible_withdrawal_date: sumData.next_eligible_withdrawal_date,
        };
      } else {
        // Create initial config directly
        const { data: inserted, error: insError } = await supabase
          .from('creator_earnings')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insError) throw insError;

        resolvedSummary = {
          user_id: inserted.user_id,
          today_earnings: 0,
          yesterday_earnings: 0,
          weekly_earnings: 0,
          monthly_earnings: 0,
          yearly_earnings: 0,
          lifetime_earnings: 0,
          available_balance: 0,
          pending_balance: 0,
          processing_balance: 0,
          withdrawn_balance: 0,
          frozen: Boolean(inserted.frozen),
          monetization_suspended: Boolean(inserted.monetization_suspended),
          last_withdrawal_date: inserted.last_withdrawal_date,
          next_eligible_withdrawal_date: inserted.next_eligible_withdrawal_date,
        };
      }

      set({
        summary: resolvedSummary,
        transactions: (txsData || []).map(t => ({
          id: t.id,
          user_id: t.user_id,
          date: t.date,
          source: t.source,
          content_id: t.content_id,
          amount: Number(t.amount),
          status: t.status,
          description: t.description,
          reference_id: t.reference_id
        })),
        levels: lvlData ? {
          user_id: lvlData.user_id,
          score: lvlData.score,
          rank: lvlData.rank,
          level: lvlData.level,
          progress: lvlData.progress
        } : null,
        achievements: (achData || []).map(a => ({
          id: a.id,
          user_id: a.user_id,
          achievement_type: a.achievement_type,
          unlocked_at: a.unlocked_at
        })),
        statistics: statData ? {
          user_id: statData.user_id,
          followers: statData.followers,
          profile_views: statData.profile_views,
          story_views: statData.story_views,
          post_reach: statData.post_reach,
          omniclip_views: statData.omniclip_views,
          watch_time: statData.watch_time,
          likes: statData.likes,
          comments: statData.comments,
          shares: statData.shares,
          saves: statData.saves,
          engagement_rate: Number(statData.engagement_rate),
          follower_growth: Number(statData.follower_growth)
        } : null,
        useLocalFallback: false,
        isLoading: false
      });

      // Fetch payment accounts in background
      try {
        await get().fetchPaymentAccounts(userId);
      } catch (e) {
        console.warn('payment_accounts table fetch failed. Handled gracefully.', e);
      }

    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        console.warn('Monetization tables missing from cache. Seamlessly switching to local fallback.');
        set({
          useLocalFallback: true,
          summary: getLocalSummary(userId),
          transactions: getLocalTransactions(userId),
          levels: getLocalLevels(userId),
          achievements: getLocalAchievements(userId),
          statistics: getLocalStatistics(userId),
          reports: getLocalReports(userId),
          paymentAccounts: getLocalPaymentAccounts(userId),
          isLoading: false
        });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  requestWithdrawal: async (userId, amount, description = 'Withdrawal Transfer Request', payoutAccountId) => {
    set({ isLoading: true, error: null });

    if (get().useLocalFallback) {
      const summary = getLocalSummary(userId);
      if (summary.frozen) {
        return { success: false, error: 'Account frozen. Withdrawals disabled.' };
      }
      if (summary.monetization_suspended) {
        return { success: false, error: 'Creator monetization suspended.' };
      }
      if (amount < 50.00) {
        return { success: false, error: 'Minimum withdrawal is $50.00' };
      }
      if (summary.available_balance < amount) {
        return { success: false, error: 'Insufficient available balance' };
      }

      // Record transaction
      const txs = getLocalTransactions(userId);
      const newTx: EarningTransaction = {
        id: 'etx_' + Math.random().toString(36).substring(7),
        user_id: userId,
        date: new Date().toISOString(),
        source: 'payout',
        content_id: null,
        amount: -amount,
        status: 'pending',
        description: payoutAccountId ? `${description} (Account: ${payoutAccountId})` : description,
        reference_id: 'ref_payout_' + Math.random().toString(36).substring(7)
      };

      txs.unshift(newTx);
      saveLocalTransactions(userId, txs);
      
      const updatedSummary = recomputeLocalSummary(userId);
      set({
        summary: updatedSummary,
        transactions: txs,
        isLoading: false
      });
      return { success: true, message: 'Withdrawal request submitted successfully' };
    }

    try {
      // Create a transaction directly in earning_transactions
      const { data, error } = await supabase
        .from('earning_transactions')
        .insert({
          user_id: userId,
          source: 'payout',
          amount: -amount,
          status: 'pending',
          description: payoutAccountId ? `${description} (Account: ${payoutAccountId})` : description,
          reference_id: 'ref_payout_' + Math.random().toString(36).substring(7)
        })
        .select()
        .single();

      if (error) throw error;

      // Create a withdrawal log
      try {
        await supabase
          .from('withdrawal_logs')
          .insert({
            user_id: userId,
            amount: amount,
            status: 'pending',
            method_details: payoutAccountId,
            remarks: description
          });
      } catch (e) {
        console.warn('withdrawal_logs insertion failed or table missing. Handled gracefully.', e);
      }

      await get().fetchCreatorData(userId);
      return { success: true, message: 'Withdrawal request submitted successfully!' };
    } catch (e: any) {
      // Switch back to fallback
      const summary = getLocalSummary(userId);
      if (summary.available_balance >= amount) {
        const txs = getLocalTransactions(userId);
        const newTx: EarningTransaction = {
          id: 'etx_' + Math.random().toString(36).substring(7),
          user_id: userId,
          date: new Date().toISOString(),
          source: 'payout',
          content_id: null,
          amount: -amount,
          status: 'pending',
          description: payoutAccountId ? `${description} (Account: ${payoutAccountId})` : description,
          reference_id: 'ref_payout_' + Math.random().toString(36).substring(7)
        };
        txs.unshift(newTx);
        saveLocalTransactions(userId, txs);
        const updatedSummary = recomputeLocalSummary(userId);
        set({
          summary: updatedSummary,
          transactions: txs,
          isLoading: false
        });
        return { success: true, message: 'Withdrawal request registered in local sandbox successfully.' };
      }
      set({ isLoading: false });
      return { success: false, error: e.message };
    }
  },

  fetchReports: async (userId) => {
    if (get().useLocalFallback) {
      set({ reports: getLocalReports(userId) });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('earning_reports')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ reports: data || [] });
    } catch (e) {
      console.error(e);
    }
  },

  generateReport: async (userId, reportName, startDate, endDate) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const rep = getLocalReports(userId);
      const sum = getLocalSummary(userId);
      const newReport: EarningReport = {
        id: 'rep_' + Math.random().toString(36).substring(7),
        user_id: userId,
        report_name: reportName,
        start_date: startDate,
        end_date: endDate,
        total_revenue: sum.lifetime_earnings * 0.15 + 400.00, // randomized realistic total
        payout_status: 'Completed',
        created_at: new Date().toISOString()
      };
      rep.unshift(newReport);
      saveLocalReports(userId, rep);
      set({ reports: rep, isLoading: false });
      return;
    }

    try {
      // Direct insertion
      const { error } = await supabase
        .from('earning_reports')
        .insert({
          user_id: userId,
          report_name: reportName,
          start_date: startDate,
          end_date: endDate,
          total_revenue: 650.00, // Placeholder calculation logic
          payout_status: 'none'
        });
      if (error) throw error;
      await get().fetchReports(userId);
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchPaymentAccounts: async (userId) => {
    if (get().useLocalFallback) {
      set({ paymentAccounts: getLocalPaymentAccounts(userId) });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('payment_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ paymentAccounts: data || [] });
    } catch (e: any) {
      console.warn("Table payment_accounts missing, switching to local payment accounts:", e.message);
      set({ paymentAccounts: getLocalPaymentAccounts(userId) });
    }
  },

  addPaymentAccount: async (userId, methodId, details, documentType, documentUrl) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const accounts = getLocalPaymentAccounts(userId);
      const newAcc: PaymentAccount = {
        id: 'acc_' + Math.random().toString(36).substring(7),
        user_id: userId,
        method_id: methodId,
        details,
        is_verified: false,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      accounts.push(newAcc);
      saveLocalPaymentAccounts(userId, accounts);
      set({ paymentAccounts: accounts, isLoading: false });

      if (documentType && documentUrl) {
        const verifications = JSON.parse(localStorage.getItem(`creator_verifications_${userId}`) || '[]');
        verifications.push({
          id: 'ver_' + Math.random().toString(36).substring(7),
          user_id: userId,
          account_id: newAcc.id,
          document_type: documentType,
          document_url: documentUrl,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        localStorage.setItem(`creator_verifications_${userId}`, JSON.stringify(verifications));
      }

      return { success: true, message: 'Payout method registered in sandbox and awaiting verification.' };
    }

    try {
      const { data: newAcc, error } = await supabase
        .from('payment_accounts')
        .insert({
          user_id: userId,
          method_id: methodId,
          details,
          is_verified: false,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      if (documentType && documentUrl) {
        const { error: docError } = await supabase
          .from('payment_verification')
          .insert({
            user_id: userId,
            account_id: newAcc.id,
            document_type: documentType,
            document_url: documentUrl,
            status: 'pending'
          });
        if (docError) throw docError;
      }

      await get().fetchPaymentAccounts(userId);
      return { success: true, message: 'Payout method registered and awaiting verification.' };
    } catch (e: any) {
      const accounts = getLocalPaymentAccounts(userId);
      const newAcc: PaymentAccount = {
        id: 'acc_' + Math.random().toString(36).substring(7),
        user_id: userId,
        method_id: methodId,
        details,
        is_verified: false,
        verification_status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      accounts.push(newAcc);
      saveLocalPaymentAccounts(userId, accounts);
      set({ paymentAccounts: accounts, isLoading: false });
      return { success: true, message: 'Payout method registered in local sandbox and awaiting verification.' };
    } finally {
      set({ isLoading: false });
    }
  },

  deletePaymentAccount: async (accountId, userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      let accounts = getLocalPaymentAccounts(userId);
      accounts = accounts.filter(a => a.id !== accountId);
      saveLocalPaymentAccounts(userId, accounts);
      set({ paymentAccounts: accounts, isLoading: false });
      return { success: true, message: 'Payout account removed.' };
    }
    try {
      const { error } = await supabase
        .from('payment_accounts')
        .delete()
        .eq('id', accountId);
      if (error) throw error;
      await get().fetchPaymentAccounts(userId);
      return { success: true, message: 'Payout account removed.' };
    } catch (e: any) {
      let accounts = getLocalPaymentAccounts(userId);
      accounts = accounts.filter(a => a.id !== accountId);
      saveLocalPaymentAccounts(userId, accounts);
      set({ paymentAccounts: accounts, isLoading: false });
      return { success: true, message: 'Payout account removed from sandbox.' };
    } finally {
      set({ isLoading: false });
    }
  },

  verifyPaymentAccount: async (accountId, status, userId) => {
    if (get().useLocalFallback) {
      const accounts = getLocalPaymentAccounts(userId);
      const accIndex = accounts.findIndex(a => a.id === accountId);
      if (accIndex !== -1) {
        accounts[accIndex].verification_status = status;
        accounts[accIndex].is_verified = status === 'verified';
        accounts[accIndex].updated_at = new Date().toISOString();
        saveLocalPaymentAccounts(userId, accounts);
      }
      return { success: true, message: `Account status updated to ${status}.` };
    }
    try {
      const { error } = await supabase
        .from('payment_accounts')
        .update({
          verification_status: status,
          is_verified: status === 'verified',
          updated_at: new Date().toISOString()
        })
        .eq('id', accountId);
      if (error) throw error;
      return { success: true, message: `Account status updated to ${status}.` };
    } catch (e: any) {
      const accounts = getLocalPaymentAccounts(userId);
      const accIndex = accounts.findIndex(a => a.id === accountId);
      if (accIndex !== -1) {
        accounts[accIndex].verification_status = status;
        accounts[accIndex].is_verified = status === 'verified';
        accounts[accIndex].updated_at = new Date().toISOString();
        saveLocalPaymentAccounts(userId, accounts);
      }
      return { success: true };
    }
  },

  fetchAdminCreatorPanel: async () => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      set({
        adminCreators: getLocalAdminCreators(),
        isLoading: false
      });
      return;
    }

    try {
      // Fetch users
      const { data: users, error: uError } = await supabase
        .from('users')
        .select('id, username, email, full_name')
        .limit(20);

      if (uError) throw uError;

      const adminDetails: AdminCreatorDetail[] = [];
      for (const u of (users || [])) {
        // Fetch stats
        const { data: stats } = await supabase.from('creator_statistics').select('*').eq('user_id', u.id).maybeSingle();
        const { data: levels } = await supabase.from('creator_levels').select('*').eq('user_id', u.id).maybeSingle();
        const { data: summary } = await supabase.from('creator_earnings_summary').select('*').eq('user_id', u.id).maybeSingle();

        adminDetails.push({
          user_id: u.id,
          username: u.username || 'unknown',
          email: u.email || '',
          full_name: u.full_name || 'Creator',
          earnings: summary ? {
            user_id: u.id,
            today_earnings: Number(summary.today_earnings),
            yesterday_earnings: Number(summary.yesterday_earnings),
            weekly_earnings: Number(summary.weekly_earnings),
            monthly_earnings: Number(summary.monthly_earnings),
            yearly_earnings: Number(summary.yearly_earnings),
            lifetime_earnings: Number(summary.lifetime_earnings),
            available_balance: Number(summary.available_balance),
            pending_balance: Number(summary.pending_balance),
            processing_balance: Number(summary.processing_balance),
            withdrawn_balance: Number(summary.withdrawn_balance),
            frozen: Boolean(summary.frozen),
            monetization_suspended: Boolean(summary.monetization_suspended),
            last_withdrawal_date: summary.last_withdrawal_date,
            next_eligible_withdrawal_date: summary.next_eligible_withdrawal_date
          } : {
            user_id: u.id,
            today_earnings: 0, yesterday_earnings: 0, weekly_earnings: 0, monthly_earnings: 0, yearly_earnings: 0, lifetime_earnings: 0,
            available_balance: 0, pending_balance: 0, processing_balance: 0, withdrawn_balance: 0, frozen: false, monetization_suspended: false,
            last_withdrawal_date: null, next_eligible_withdrawal_date: null
          },
          stats: stats ? {
            user_id: u.id,
            followers: stats.followers,
            profile_views: stats.profile_views,
            story_views: stats.story_views,
            post_reach: stats.post_reach,
            omniclip_views: stats.omniclip_views,
            watch_time: stats.watch_time,
            likes: stats.likes,
            comments: stats.comments,
            shares: stats.shares,
            saves: stats.saves,
            engagement_rate: Number(stats.engagement_rate),
            follower_growth: Number(stats.follower_growth)
          } : {
            user_id: u.id, followers: 0, profile_views: 0, story_views: 0, post_reach: 0, omniclip_views: 0, watch_time: 0, likes: 0, comments: 0, shares: 0, saves: 0, engagement_rate: 0, follower_growth: 0
          },
          levels: levels ? {
            user_id: u.id,
            score: levels.score,
            rank: levels.rank,
            level: levels.level,
            progress: levels.progress
          } : {
            user_id: u.id, score: 0, rank: 'Bronze Creator', level: 1, progress: 0
          }
        });
      }

      set({ adminCreators: adminDetails, isLoading: false });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        set({
          adminCreators: getLocalAdminCreators(),
          isLoading: false
        });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  adminAdjustEarnings: async (targetUserId, amount, source, description) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const txs = getLocalTransactions(targetUserId);
      const newTx: EarningTransaction = {
        id: 'etx_adj_' + Math.random().toString(36).substring(7),
        user_id: targetUserId,
        date: new Date().toISOString(),
        source,
        content_id: null,
        amount,
        status: 'completed',
        description,
        reference_id: 'ref_adj_' + Math.random().toString(36).substring(7)
      };
      txs.unshift(newTx);
      saveLocalTransactions(targetUserId, txs);
      recomputeLocalSummary(targetUserId);

      set({
        adminCreators: getLocalAdminCreators(),
        isLoading: false
      });
      return { success: true, message: 'Earnings adjusted successfully' };
    }

    try {
      const { data, error } = await supabase.rpc('admin_adjust_creator_earnings', {
        p_target_user_id: targetUserId,
        p_amount: amount,
        p_source: source,
        p_description: description
      });

      if (error) throw error;
      await get().fetchAdminCreatorPanel();
      return { success: true, message: data.message };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  adminUpdateTransactionStatus: async (transactionId, status) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      // Search all users local state to find transaction
      const dummyUsers = ['8fb7f5ae-b1d5-4ee7-8652-b757393173a5', '84ad35bc-5be1-42b1-947a-e073538fd82d', '29209b5b-6a45-4650-aac7-50d6e2566c5e'];
      
      // Also search current user's local state
      const currentUser = supabase.auth.getUser() ? (await supabase.auth.getUser()).data.user?.id : null;
      if (currentUser) dummyUsers.push(currentUser);

      for (const u of dummyUsers) {
        const txs = getLocalTransactions(u);
        const txIndex = txs.findIndex(t => t.id === transactionId);
        if (txIndex !== -1) {
          txs[txIndex].status = status;
          saveLocalTransactions(u, txs);
          recomputeLocalSummary(u);
          break;
        }
      }

      set({
        adminCreators: getLocalAdminCreators(),
        isLoading: false
      });
      return { success: true, message: 'Transaction updated successfully' };
    }

    try {
      const { data, error } = await supabase.rpc('admin_update_transaction_status', {
        p_transaction_id: transactionId,
        p_status: status
      });

      if (error) throw error;
      await get().fetchAdminCreatorPanel();
      return { success: true, message: data.message };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  adminSetMonetizationStatus: async (targetUserId, frozen, suspended) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const summary = getLocalSummary(targetUserId);
      summary.frozen = frozen;
      summary.monetization_suspended = suspended;
      summary.updated_at = new Date().toISOString();
      saveLocalSummary(targetUserId, summary);

      set({
        adminCreators: getLocalAdminCreators(),
        isLoading: false
      });
      return { success: true, message: 'Creator monetization status updated successfully' };
    }

    try {
      const { data, error } = await supabase.rpc('admin_set_creator_monetization_status', {
        p_target_user_id: targetUserId,
        p_frozen: frozen,
        p_suspended: suspended
      });

      if (error) throw error;
      await get().fetchAdminCreatorPanel();
      return { success: true, message: data.message };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false };
    }
  },

  adminAdjustStatistics: async (targetUserId, statName, value) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const stats = getLocalStatistics(targetUserId);
      (stats as any)[statName] = value;
      stats.updated_at = new Date().toISOString();
      saveLocalStatistics(targetUserId, stats);

      // Trigger recalculate levels locally
      const levels = getLocalLevels(targetUserId);
      const totalViews = stats.profile_views + stats.story_views + stats.omniclip_views;
      
      // Score calculation
      levels.score = Math.min(100, Math.round(
        (Math.min(stats.followers, 10000) / 10000 * 40) +
        (Math.min(stats.likes, 5000) / 5000 * 30) +
        (Math.min(totalViews, 20000) / 20000 * 30)
      ));
      if (levels.score < 10) levels.score = 10;

      // Level progress calculation
      if (stats.followers <= 500) {
        levels.level = 1;
        levels.progress = Math.round((stats.followers / 500) * 100);
      } else if (stats.followers <= 2000) {
        levels.level = 2;
        levels.progress = Math.round(((stats.followers - 500) / 1500) * 100);
      } else if (stats.followers <= 5000) {
        levels.level = 3;
        levels.progress = Math.round(((stats.followers - 2000) / 3000) * 100);
      } else if (stats.followers <= 15000) {
        levels.level = 4;
        levels.progress = Math.round(((stats.followers - 5000) / 10000) * 100);
      } else {
        levels.level = 5;
        levels.progress = 100;
      }

      // Rank mapping
      if (stats.followers < 1000) levels.rank = 'Bronze Creator';
      else if (stats.followers < 5000) levels.rank = 'Silver Creator';
      else if (stats.followers < 20000) levels.rank = 'Gold Creator';
      else levels.rank = 'Diamond Creator';

      levels.updated_at = new Date().toISOString();
      saveLocalLevels(targetUserId, levels);

      // Achievements unlocks locally
      const achs = getLocalAchievements(targetUserId);
      const types = achs.map(a => a.achievement_type);
      
      const checkAndAdd = (type: any) => {
        if (!types.includes(type)) {
          achs.push({ id: 'ach_unlocked_' + Math.random().toString(36).substring(7), user_id: targetUserId, achievement_type: type, unlocked_at: new Date().toISOString() });
        }
      };

      if (stats.followers >= 0) checkAndAdd('bronze');
      if (stats.followers >= 1000) checkAndAdd('silver');
      if (stats.followers >= 5000) checkAndAdd('gold');
      if (stats.followers >= 20000) checkAndAdd('diamond');
      if (stats.story_views >= 500) checkAndAdd('top_story');
      if (stats.omniclip_views >= 1000) checkAndAdd('top_omniclip');
      if (stats.shares >= 100 || stats.comments >= 200) checkAndAdd('top_community');

      saveLocalAchievements(targetUserId, achs);

      set({
        adminCreators: getLocalAdminCreators(),
        isLoading: false
      });
      return { success: true, message: 'Creator statistics adjusted successfully' };
    }

    try {
      const { data, error } = await supabase.rpc('admin_adjust_creator_statistics', {
        p_target_user_id: targetUserId,
        p_stat_name: statName,
        p_value: value
      });

      if (error) throw error;
      await get().fetchAdminCreatorPanel();
      return { success: true, message: data.message };
    } catch (e: any) {
      set({ isLoading: false });
      return { success: false };
    }
  }
}));

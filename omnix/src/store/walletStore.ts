import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface WalletState {
  coin_balance: number;
  reward_coins: number;
  gift_coins: number;
  pending_coins: number;
  total_earned_coins: number;
  total_spent_coins: number;
  total_gifted_coins: number;
  is_frozen: boolean;
  updated_at: string;
}

export interface WalletTransaction {
  id: string;
  user_id: string;
  amount: number; // Positive for credit, negative for debit
  type: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  description: string;
  source: string;
  reference_id: string | null;
  created_at: string;
}

export interface WalletLog {
  id: string;
  user_id: string;
  action: string;
  details: string;
  created_at: string;
}

export interface WalletAudit {
  id: string;
  user_id: string;
  transaction_id: string;
  previous_balance: number;
  new_balance: number;
  verified: boolean;
  created_at: string;
}

export interface AdminWalletDetail extends WalletState {
  user_id: string;
  username: string;
  email: string;
  full_name: string;
}

interface WalletStoreState {
  wallet: WalletState | null;
  transactions: WalletTransaction[];
  adminWallets: AdminWalletDetail[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchWalletData: (userId: string) => Promise<void>;
  executeTransaction: (
    userId: string, 
    amount: number, 
    type: string, 
    description: string, 
    source: string, 
    referenceId?: string | null
  ) => Promise<boolean>;
  downloadStatement: (userId: string, format: 'csv' | 'json') => void;
  
  // Admin actions
  fetchAdminWallets: () => Promise<void>;
  setWalletFrozenState: (targetUserId: string, isFrozen: boolean, reason?: string) => Promise<void>;
  adminAdjustCoins: (targetUserId: string, amount: number, type: string, description: string) => Promise<void>;
}

// Local Storage helpers for Sandbox environment
const getLocalWallet = (userId: string): WalletState => {
  const data = localStorage.getItem(`wallet_${userId}`);
  if (data) return JSON.parse(data);

  // Default wallet with 100 welcome coins
  const defaultWallet: WalletState = {
    coin_balance: 100,
    reward_coins: 50,
    gift_coins: 0,
    pending_coins: 0,
    total_earned_coins: 100,
    total_spent_coins: 0,
    total_gifted_coins: 0,
    is_frozen: false,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(`wallet_${userId}`, JSON.stringify(defaultWallet));
  return defaultWallet;
};

const saveLocalWallet = (userId: string, wallet: WalletState) => {
  localStorage.setItem(`wallet_${userId}`, JSON.stringify(wallet));
};

const getLocalTransactions = (userId: string): WalletTransaction[] => {
  const data = localStorage.getItem(`wallet_txs_${userId}`);
  if (data) return JSON.parse(data);

  // Default transactions for new wallets
  const defaultTxs: WalletTransaction[] = [
    {
      id: 'tx_welcome_' + Math.random().toString(36).substring(7),
      user_id: userId,
      amount: 100,
      type: 'daily_reward',
      status: 'completed',
      description: 'Welcome reward for joining Omnix!',
      source: 'system',
      reference_id: 'welcome_reward',
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem(`wallet_txs_${userId}`, JSON.stringify(defaultTxs));
  return defaultTxs;
};

const saveLocalTransaction = (userId: string, tx: WalletTransaction) => {
  const txs = getLocalTransactions(userId);
  txs.unshift(tx);
  localStorage.setItem(`wallet_txs_${userId}`, JSON.stringify(txs));
};

const getLocalAdminWallets = (): AdminWalletDetail[] => {
  const users = [
    { id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', username: 'emma_w', email: 'emma_w@example.com', full_name: 'Emma Wilson' },
    { id: '84ad35bc-5be1-42b1-947a-e073538fd82d', username: 'jcarter', email: 'jcarter@example.com', full_name: 'James Carter' },
    { id: '29209b5b-6a45-4650-aac7-50d6e2566c5e', username: 'sophia_l', email: 'sophia_l@example.com', full_name: 'Sophia Lee' }
  ];

  return users.map(u => {
    const w = getLocalWallet(u.id);
    return {
      ...w,
      user_id: u.id,
      username: u.username,
      email: u.email,
      full_name: u.full_name
    };
  });
};

export const useWalletStore = create<WalletStoreState>((set, get) => ({
  wallet: null,
  transactions: [],
  adminWallets: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchWalletData: async (userId) => {
    set({ isLoading: true });
    
    // Check local fallback flag
    if (get().useLocalFallback) {
      set({
        wallet: getLocalWallet(userId),
        transactions: getLocalTransactions(userId),
        isLoading: false
      });
      return;
    }

    try {
      // Attempt to load from real Supabase table 'wallets' or 'wallet_balances'
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      let walletInfo: WalletState;

      if (data) {
        walletInfo = {
          coin_balance: Number(data.coin_balance),
          reward_coins: Number(data.reward_coins),
          gift_coins: Number(data.gift_coins),
          pending_coins: Number(data.pending_coins),
          total_earned_coins: Number(data.total_earned_coins),
          total_spent_coins: Number(data.total_spent_coins),
          total_gifted_coins: Number(data.total_gifted_coins),
          is_frozen: Boolean(data.is_frozen),
          updated_at: data.updated_at
        };
      } else {
        // Create initial wallet entry
        const { data: inserted, error: insertError } = await supabase
          .from('wallets')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        
        walletInfo = {
          coin_balance: Number(inserted.coin_balance),
          reward_coins: Number(inserted.reward_coins),
          gift_coins: Number(inserted.gift_coins),
          pending_coins: Number(inserted.pending_coins),
          total_earned_coins: Number(inserted.total_earned_coins),
          total_spent_coins: Number(inserted.total_spent_coins),
          total_gifted_coins: Number(inserted.total_gifted_coins),
          is_frozen: Boolean(inserted.is_frozen),
          updated_at: inserted.updated_at
        };
      }

      // Fetch transaction history
      const { data: txs, error: txsError } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (txsError) throw txsError;

      set({
        wallet: walletInfo,
        transactions: (txs || []).map(t => ({
          id: t.id,
          user_id: t.user_id,
          amount: Number(t.amount),
          type: t.type,
          status: t.status,
          description: t.description,
          source: t.source || 'system',
          reference_id: t.reference_id,
          created_at: t.created_at
        })),
        useLocalFallback: false,
        isLoading: false
      });

    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        console.warn('Supabase wallets table not found. Seamlessly switching to sandbox LocalStorage fallback.');
        set({
          useLocalFallback: true,
          wallet: getLocalWallet(userId),
          transactions: getLocalTransactions(userId),
          isLoading: false
        });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  executeTransaction: async (userId, amount, type, description, source, referenceId = null) => {
    set({ isLoading: true, error: null });

    if (get().useLocalFallback) {
      const wallet = getLocalWallet(userId);

      // Validate: frozen wallet
      if (wallet.is_frozen) {
        set({ error: 'Wallet is frozen. Transactions are disabled.', isLoading: false });
        return false;
      }

      // Validate: negative balance prevention
      if (wallet.coin_balance + amount < 0) {
        set({ error: 'Insufficient balance.', isLoading: false });
        return false;
      }

      // Validate: duplicate transaction check (using reference_id)
      if (referenceId) {
        const txs = getLocalTransactions(userId);
        const duplicate = txs.some(t => t.reference_id === referenceId && t.type === type);
        if (duplicate) {
          set({ error: 'Duplicate transaction detected.', isLoading: false });
          return false;
        }
      }

      // Perform local balance adjustment inside transactional state updates
      const updatedWallet: WalletState = { ...wallet };
      updatedWallet.coin_balance += amount;
      
      if (amount > 0) {
        updatedWallet.total_earned_coins += amount;
        if (type.includes('reward')) {
          updatedWallet.reward_coins += amount;
        } else if (type === 'gift_received') {
          updatedWallet.gift_coins += amount;
        }
      } else {
        const absAmount = Math.abs(amount);
        updatedWallet.total_spent_coins += absAmount;
        if (type === 'gift_sent') {
          updatedWallet.total_gifted_coins += absAmount;
        }
      }
      updatedWallet.updated_at = new Date().toISOString();

      // Create local transaction
      const newTx: WalletTransaction = {
        id: 'tx_' + Math.random().toString(36).substring(7),
        user_id: userId,
        amount,
        type,
        status: 'completed',
        description,
        source,
        reference_id: referenceId,
        created_at: new Date().toISOString()
      };

      saveLocalWallet(userId, updatedWallet);
      saveLocalTransaction(userId, newTx);

      // Log action in audit logs
      const auditLog = {
        id: 'aud_' + Math.random().toString(36).substring(7),
        user_id: userId,
        transaction_id: newTx.id,
        previous_balance: wallet.coin_balance,
        new_balance: updatedWallet.coin_balance,
        verified: true,
        created_at: new Date().toISOString()
      };
      const audits = JSON.parse(localStorage.getItem(`wallet_audits_${userId}`) || '[]');
      audits.unshift(auditLog);
      localStorage.setItem(`wallet_audits_${userId}`, JSON.stringify(audits));

      set({
        wallet: updatedWallet,
        transactions: getLocalTransactions(userId),
        isLoading: false
      });
      return true;
    }

    try {
      // Call Supabase Secure Database RPC Function
      const { data, error } = await supabase.rpc('execute_wallet_transaction', {
        p_user_id: userId,
        p_amount: amount,
        p_type: type,
        p_description: description,
        p_source: source,
        p_reference_id: referenceId
      });

      if (error) throw error;

      if (data && !data.success) {
        set({ error: data.error || 'Transaction failed', isLoading: false });
        return false;
      }

      // Reload updated wallet context
      await get().fetchWalletData(userId);
      return true;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  },

  downloadStatement: (userId, format) => {
    const txs = get().transactions;
    let dataStr = '';
    let mimeType = '';
    let fileName = '';

    if (format === 'json') {
      dataStr = JSON.stringify(txs, null, 2);
      mimeType = 'application/json';
      fileName = `omnix_statement_${userId.slice(0, 8)}.json`;
    } else {
      // CSV format
      const headers = ['Transaction ID', 'Date & Time', 'Amount', 'Type', 'Status', 'Description', 'Source', 'Reference ID'];
      const rows = txs.map(t => [
        t.id,
        new Date(t.created_at).toLocaleString(),
        t.amount,
        t.type,
        t.status,
        `"${t.description.replace(/"/g, '""')}"`,
        t.source,
        t.reference_id || ''
      ]);
      dataStr = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      mimeType = 'text/csv';
      fileName = `omnix_statement_${userId.slice(0, 8)}.csv`;
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
  },

  fetchAdminWallets: async () => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      set({
        adminWallets: getLocalAdminWallets(),
        isLoading: false
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('admin_wallet_overview_view')
        .select('*');

      if (error) throw error;

      set({
        adminWallets: (data || []).map(d => ({
          user_id: d.user_id,
          username: d.username,
          email: d.email,
          full_name: d.full_name,
          coin_balance: Number(d.coin_balance),
          reward_coins: Number(d.reward_coins),
          gift_coins: Number(d.gift_coins),
          pending_coins: Number(d.pending_coins),
          total_earned_coins: Number(d.total_earned_coins),
          total_spent_coins: Number(d.total_spent_coins),
          total_gifted_coins: Number(d.total_gifted_coins),
          is_frozen: Boolean(d.is_frozen),
          updated_at: d.updated_at
        })),
        isLoading: false
      });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        set({
          adminWallets: getLocalAdminWallets(),
          isLoading: false
        });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  setWalletFrozenState: async (targetUserId, isFrozen, reason = 'No reason specified') => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      const w = getLocalWallet(targetUserId);
      w.is_frozen = isFrozen;
      w.updated_at = new Date().toISOString();
      saveLocalWallet(targetUserId, w);

      // Create wallet log
      const log = {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: targetUserId,
        action: isFrozen ? 'wallet_frozen' : 'wallet_unfrozen',
        details: `Wallet freezing changed. Status: ${isFrozen ? 'FROZEN' : 'ACTIVE'}. Reason: ${reason}`,
        created_at: new Date().toISOString()
      };
      const logs = JSON.parse(localStorage.getItem(`wallet_logs_${targetUserId}`) || '[]');
      logs.unshift(log);
      localStorage.setItem(`wallet_logs_${targetUserId}`, JSON.stringify(logs));

      // Refresh admin dataset
      set({
        adminWallets: getLocalAdminWallets(),
        isLoading: false
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('admin_set_wallet_frozen', {
        target_user_id: targetUserId,
        p_frozen: isFrozen,
        p_details: reason
      });

      if (error) throw error;
      await get().fetchAdminWallets();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  adminAdjustCoins: async (targetUserId, amount, type, description) => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      // Call executeTransaction on behalf of the user
      await get().executeTransaction(
        targetUserId, 
        amount, 
        type, 
        `Admin Adjust: ${description}`, 
        'admin_adjustment'
      );
      
      // Update admin view
      set({
        adminWallets: getLocalAdminWallets(),
        isLoading: false
      });
      return;
    }

    try {
      // Run as standard transaction
      await get().executeTransaction(
        targetUserId,
        amount,
        type,
        `Admin Adjust: ${description}`,
        'admin_adjustment'
      );
      await get().fetchAdminWallets();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  }
}));

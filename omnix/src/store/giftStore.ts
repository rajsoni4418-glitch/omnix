import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useWalletStore } from './walletStore';

export interface GiftItem {
  id: string;
  name: string;
  cost: number;
  animation: string; // Animation key: e.g. 'heart', 'rose', 'fire', 'star', 'diamond', etc.
  category: 'standard' | 'exclusive' | 'festival' | 'seasonal';
  popularity: number;
  is_active: boolean;
  is_limited: boolean;
  limited_stock: number | null;
  created_at: string;
  updated_at: string;
}

export interface GiftTransaction {
  id: string;
  sender_id: string;
  sender_username?: string;
  sender_full_name?: string;
  receiver_id: string;
  receiver_username?: string;
  receiver_full_name?: string;
  gift_id: string;
  gift_name?: string;
  gift_animation?: string;
  gift_category?: string;
  item_type: 'post' | 'story' | 'omniclip' | 'live' | 'profile';
  item_id: string | null;
  coin_cost: number;
  created_at: string;
}

export interface GiftInventory {
  id: string;
  user_id: string;
  gift_id: string;
  quantity: number;
  obtained_at: string;
  is_limited: boolean;
  gift_name?: string;
  gift_animation?: string;
}

export interface CreatorEarnings {
  user_id: string;
  total_coins_earned: number;
  total_gifts_received: number;
  updated_at: string;
  username?: string;
  full_name?: string;
}

export interface SupporterRank {
  user_id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  total_gifted_coins: number;
  gifts_count: number;
  badge: 'Gold Supporter' | 'Silver Supporter' | 'Bronze Supporter' | 'Elite Supporter';
}

interface GiftStoreState {
  catalog: GiftItem[];
  transactions: GiftTransaction[];
  inventory: GiftInventory[];
  creatorEarnings: CreatorEarnings | null;
  topSupporters: SupporterRank[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchCatalog: () => Promise<void>;
  fetchUserTransactions: (userId: string) => Promise<void>;
  fetchUserInventory: (userId: string) => Promise<void>;
  fetchCreatorMetrics: (creatorId: string) => Promise<void>;
  fetchLeaderboard: (timeframe: 'daily' | 'weekly' | 'monthly' | 'lifetime') => Promise<void>;
  
  // Gifting flows
  sendVirtualGift: (
    senderId: string,
    receiverId: string,
    giftId: string,
    itemType: 'post' | 'story' | 'omniclip' | 'live' | 'profile',
    itemId?: string | null
  ) => Promise<{ success: boolean; error?: string; txId?: string }>;

  // Admin Actions
  createGiftCatalogItem: (gift: Omit<GiftItem, 'id' | 'created_at' | 'updated_at' | 'popularity'>) => Promise<void>;
  updateGiftCatalogItem: (id: string, updates: Partial<GiftItem>) => Promise<void>;
  deleteGiftCatalogItem: (id: string) => Promise<void>;
  refundGiftTransaction: (txId: string) => Promise<boolean>;
}

// Default standard catalog gifts for fallbacks
const DEFAULT_GIFTS: GiftItem[] = [
  { id: 'gift-heart', name: 'Heart', cost: 10, animation: 'heart', category: 'standard', popularity: 150, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-rose', name: 'Rose', cost: 25, animation: 'rose', category: 'standard', popularity: 120, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-fire', name: 'Fire', cost: 50, animation: 'fire', category: 'standard', popularity: 200, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-star', name: 'Star', cost: 100, animation: 'star', category: 'standard', popularity: 85, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-diamond', name: 'Diamond', cost: 250, animation: 'diamond', category: 'exclusive', popularity: 95, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-crown', name: 'Crown', cost: 500, animation: 'crown', category: 'exclusive', popularity: 70, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-rocket', name: 'Rocket', cost: 1000, animation: 'rocket', category: 'exclusive', popularity: 45, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-box', name: 'Gift Box', cost: 150, animation: 'gift_box', category: 'standard', popularity: 60, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-trophy', name: 'Trophy', cost: 300, animation: 'trophy', category: 'exclusive', popularity: 35, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-bear', name: 'Teddy Bear', cost: 80, animation: 'teddy_bear', category: 'standard', popularity: 50, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-ring', name: 'Ring', cost: 400, animation: 'ring', category: 'exclusive', popularity: 30, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-car', name: 'Sports Car', cost: 2500, animation: 'sports_car', category: 'exclusive', popularity: 15, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-castle', name: 'Castle', cost: 5000, animation: 'castle', category: 'exclusive', popularity: 5, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-money', name: 'Money Rain', cost: 1500, animation: 'money_rain', category: 'exclusive', popularity: 25, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-goldcrown', name: 'Golden Crown', cost: 7500, animation: 'golden_crown', category: 'exclusive', popularity: 10, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-pumpkin', name: 'Spooky Pumpkin', cost: 120, animation: 'pumpkin', category: 'seasonal', popularity: 10, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-snowglobe', name: 'Snow Globe', cost: 180, animation: 'snowglobe', category: 'seasonal', popularity: 15, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-dragon', name: 'Dragon Dance', cost: 2000, animation: 'dragon', category: 'festival', popularity: 8, is_active: true, is_limited: true, limited_stock: 50, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'gift-bunny', name: 'Easter Bunny', cost: 90, animation: 'bunny', category: 'seasonal', popularity: 20, is_active: true, is_limited: false, limited_stock: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

const getLocalCatalog = (): GiftItem[] => {
  const data = localStorage.getItem('gift_shop_catalog');
  if (data) return JSON.parse(data);
  localStorage.setItem('gift_shop_catalog', JSON.stringify(DEFAULT_GIFTS));
  return DEFAULT_GIFTS;
};

const getLocalTransactions = (): GiftTransaction[] => {
  const data = localStorage.getItem('gift_shop_transactions');
  return data ? JSON.parse(data) : [];
};

const getLocalInventory = (userId: string): GiftInventory[] => {
  const data = localStorage.getItem(`gift_inventory_${userId}`);
  return data ? JSON.parse(data) : [];
};

const getLocalCreatorEarnings = (userId: string): CreatorEarnings => {
  const data = localStorage.getItem(`gift_earnings_${userId}`);
  if (data) return JSON.parse(data);
  
  const initial: CreatorEarnings = {
    user_id: userId,
    total_coins_earned: 0,
    total_gifts_received: 0,
    updated_at: new Date().toISOString()
  };
  localStorage.setItem(`gift_earnings_${userId}`, JSON.stringify(initial));
  return initial;
};

export const useGiftStore = create<GiftStoreState>((set, get) => ({
  catalog: DEFAULT_GIFTS,
  transactions: [],
  inventory: [],
  creatorEarnings: null,
  topSupporters: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchCatalog: async () => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      set({ catalog: getLocalCatalog(), isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gift_catalog')
        .select('*')
        .order('cost', { ascending: true });

      if (error) throw error;
      set({ catalog: data as GiftItem[], isLoading: false });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        console.warn('Supabase gift catalog table not found. Switching to sandbox LocalStorage fallback.');
        set({ catalog: getLocalCatalog(), useLocalFallback: true, isLoading: false });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  fetchUserTransactions: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const all = getLocalTransactions();
      const filtered = all.filter(t => t.sender_id === userId || t.receiver_id === userId);
      set({ transactions: filtered, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gift_transactions')
        .select(`
          id,
          sender_id,
          receiver_id,
          gift_id,
          item_type,
          item_id,
          coin_cost,
          created_at,
          gift_catalog ( name, animation, category )
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted: GiftTransaction[] = (data || []).map((t: any) => ({
        id: t.id,
        sender_id: t.sender_id,
        receiver_id: t.receiver_id,
        gift_id: t.gift_id,
        gift_name: t.gift_catalog?.name,
        gift_animation: t.gift_catalog?.animation,
        gift_category: t.gift_catalog?.category,
        item_type: t.item_type,
        item_id: t.item_id,
        coin_cost: Number(t.coin_cost),
        created_at: t.created_at
      }));

      set({ transactions: formatted, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchUserInventory: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      set({ inventory: getLocalInventory(userId), isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('gift_inventory')
        .select(`
          id,
          user_id,
          gift_id,
          quantity,
          obtained_at,
          is_limited,
          gift_catalog ( name, animation )
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const formatted: GiftInventory[] = (data || []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        gift_id: t.gift_id,
        quantity: Number(t.quantity),
        obtained_at: t.obtained_at,
        is_limited: t.is_limited,
        gift_name: t.gift_catalog?.name,
        gift_animation: t.gift_catalog?.animation
      }));

      set({ inventory: formatted, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchCreatorMetrics: async (creatorId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      set({ creatorEarnings: getLocalCreatorEarnings(creatorId), isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('creator_gift_earnings')
        .select('*')
        .eq('user_id', creatorId)
        .maybeSingle();

      if (error) throw error;
      set({ 
        creatorEarnings: data ? {
          user_id: data.user_id,
          total_coins_earned: Number(data.total_coins_earned),
          total_gifts_received: Number(data.total_gifts_received),
          updated_at: data.updated_at
        } : null, 
        isLoading: false 
      });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchLeaderboard: async (timeframe) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      // Simulate supporters leaderboard
      const mockSupporters: SupporterRank[] = [
        { user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5', username: 'emma_w', full_name: 'Emma Wilson', total_gifted_coins: 12500, gifts_count: 52, badge: 'Gold Supporter' },
        { user_id: '84ad35bc-5be1-42b1-947a-e073538fd82d', username: 'jcarter', full_name: 'James Carter', total_gifted_coins: 8200, gifts_count: 31, badge: 'Silver Supporter' },
        { user_id: '29209b5b-6a45-4650-aac7-50d6e2566c5e', username: 'sophia_l', full_name: 'Sophia Lee', total_gifted_coins: 4500, gifts_count: 18, badge: 'Bronze Supporter' },
        { user_id: 'user-demo-id', username: 'rajsoni', full_name: 'Raj Soni', total_gifted_coins: 1500, gifts_count: 8, badge: 'Elite Supporter' }
      ];
      set({ topSupporters: mockSupporters.sort((a,b) => b.total_gifted_coins - a.total_gifted_coins), isLoading: false });
      return;
    }

    try {
      // Aggregate from gift_transactions
      const { data, error } = await supabase
        .from('gift_transactions')
        .select(`
          sender_id,
          coin_cost,
          users:sender_id ( username, full_name, avatar_url )
        `);

      if (error) throw error;

      // Group and sort
      const map: Record<string, { total: number; count: number; user: any }> = {};
      (data || []).forEach((t: any) => {
        if (!map[t.sender_id]) {
          map[t.sender_id] = { total: 0, count: 0, user: t.users };
        }
        map[t.sender_id].total += Number(t.coin_cost);
        map[t.sender_id].count += 1;
      });

      const ranks: SupporterRank[] = Object.keys(map).map(uid => {
        const item = map[uid];
        let badge: any = 'Bronze Supporter';
        if (item.total >= 10000) badge = 'Gold Supporter';
        else if (item.total >= 5000) badge = 'Silver Supporter';
        else if (item.total >= 1000) badge = 'Elite Supporter';

        return {
          user_id: uid,
          username: item.user?.username || 'anonymous',
          full_name: item.user?.full_name || 'Anonymous User',
          avatar_url: item.user?.avatar_url,
          total_gifted_coins: item.total,
          gifts_count: item.count,
          badge
        };
      });

      ranks.sort((a,b) => b.total_gifted_coins - a.total_gifted_coins);
      set({ topSupporters: ranks, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  sendVirtualGift: async (senderId, receiverId, giftId, itemType, itemId = null) => {
    set({ isLoading: true, error: null });

    if (senderId === receiverId) {
      set({ isLoading: false });
      return { success: false, error: 'You cannot send gifts to yourself.' };
    }

    const gift = get().catalog.find(g => g.id === giftId);
    if (!gift) {
      set({ isLoading: false });
      return { success: false, error: 'Gift item not found or deactivated.' };
    }

    // 1. If fallback active
    if (get().useLocalFallback) {
      // Check wallet balance
      const walletStore = useWalletStore.getState();
      const currentBalance = walletStore.wallet?.coin_balance || 0;
      if (currentBalance < gift.cost) {
        set({ isLoading: false });
        return { success: false, error: 'Insufficient coin balance.' };
      }

      // Check limited stock
      if (gift.is_limited && gift.limited_stock !== null) {
        if (gift.limited_stock <= 0) {
          set({ isLoading: false });
          return { success: false, error: 'This exclusive gift is sold out!' };
        }
        // Decrement stock
        const updatedCatalog = get().catalog.map(c => 
          c.id === giftId ? { ...c, limited_stock: (c.limited_stock || 1) - 1 } : c
        );
        localStorage.setItem('gift_shop_catalog', JSON.stringify(updatedCatalog));
        set({ catalog: updatedCatalog });
      }

      const txId = 'gtx_' + Math.random().toString(36).substring(2, 10);

      // Deduct coins from sender wallet
      await walletStore.executeTransaction(
        senderId,
        -gift.cost,
        'gift_sent',
        `Sent gift "${gift.name}"`,
        'gift',
        txId
      );

      // Award coins to creator wallet (or update creator earnings)
      await walletStore.executeTransaction(
        receiverId,
        gift.cost,
        'gift_received',
        `Received gift "${gift.name}"`,
        'gift',
        txId
      );

      // Save to local transactions
      const newTx: GiftTransaction = {
        id: txId,
        sender_id: senderId,
        sender_username: 'me',
        sender_full_name: 'Myself',
        receiver_id: receiverId,
        receiver_username: 'creator_user',
        receiver_full_name: 'Creator Partner',
        gift_id: gift.id,
        gift_name: gift.name,
        gift_animation: gift.animation,
        gift_category: gift.category,
        item_type: itemType,
        item_id: itemId,
        coin_cost: gift.cost,
        created_at: new Date().toISOString()
      };

      const allTxs = getLocalTransactions();
      allTxs.unshift(newTx);
      localStorage.setItem('gift_shop_transactions', JSON.stringify(allTxs));

      // Save to sender inventory
      const senderInv = getLocalInventory(senderId);
      const match = senderInv.find(i => i.gift_id === giftId);
      if (match) {
        match.quantity += 1;
      } else {
        senderInv.push({
          id: 'inv_' + Math.random().toString(36).substring(2, 10),
          user_id: senderId,
          gift_id: giftId,
          quantity: 1,
          obtained_at: new Date().toISOString(),
          is_limited: gift.is_limited,
          gift_name: gift.name,
          gift_animation: gift.animation
        });
      }
      localStorage.setItem(`gift_inventory_${senderId}`, JSON.stringify(senderInv));

      // Update creator earnings
      const earnings = getLocalCreatorEarnings(receiverId);
      earnings.total_coins_earned += gift.cost;
      earnings.total_gifts_received += 1;
      earnings.updated_at = new Date().toISOString();
      localStorage.setItem(`gift_earnings_${receiverId}`, JSON.stringify(earnings));

      set({ 
        transactions: allTxs.filter(t => t.sender_id === senderId || t.receiver_id === senderId),
        inventory: senderInv,
        creatorEarnings: earnings,
        isLoading: false 
      });

      return { success: true, txId };
    }

    try {
      // Supabase Secure Database RPC Function
      const { data, error } = await supabase.rpc('send_virtual_gift', {
        p_sender_id: senderId,
        p_receiver_id: receiverId,
        p_gift_id: giftId,
        p_item_type: itemType,
        p_item_id: itemId
      });

      if (error) throw error;

      if (data && !data.success) {
        set({ error: data.error || 'Gifting transaction failed', isLoading: false });
        return { success: false, error: data.error };
      }

      // Sync user data
      await get().fetchUserTransactions(senderId);
      await get().fetchUserInventory(senderId);
      await useWalletStore.getState().fetchWalletData(senderId);

      set({ isLoading: false });
      return { success: true, txId: data.transaction_id };
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return { success: false, error: e.message };
    }
  },

  // Admin Catalog actions
  createGiftCatalogItem: async (gift) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const catalog = getLocalCatalog();
      const newGift: GiftItem = {
        ...gift,
        id: 'gift-' + Math.random().toString(36).substring(2, 10),
        popularity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      catalog.push(newGift);
      localStorage.setItem('gift_shop_catalog', JSON.stringify(catalog));
      set({ catalog, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('gift_catalog').insert(gift);
      if (error) throw error;
      await get().fetchCatalog();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateGiftCatalogItem: async (id, updates) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const catalog = getLocalCatalog().map(g => g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g);
      localStorage.setItem('gift_shop_catalog', JSON.stringify(catalog));
      set({ catalog, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('gift_catalog').update(updates).eq('id', id);
      if (error) throw error;
      await get().fetchCatalog();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteGiftCatalogItem: async (id) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const catalog = getLocalCatalog().filter(g => g.id !== id);
      localStorage.setItem('gift_shop_catalog', JSON.stringify(catalog));
      set({ catalog, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('gift_catalog').delete().eq('id', id);
      if (error) throw error;
      await get().fetchCatalog();
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  refundGiftTransaction: async (txId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const transactions = getLocalTransactions();
      const tx = transactions.find(t => t.id === txId);
      if (!tx) {
        set({ isLoading: false });
        return false;
      }

      // Deduct coins back from receiver
      await useWalletStore.getState().executeTransaction(
        tx.receiver_id,
        -tx.coin_cost,
        'refund',
        `Refunded gift transaction ${tx.id}`,
        'gift_refund',
        `ref_${tx.id}`
      );

      // Refund sender
      await useWalletStore.getState().executeTransaction(
        tx.sender_id,
        tx.coin_cost,
        'refund',
        `Refunded gift transaction ${tx.id}`,
        'gift_refund',
        `ref_${tx.id}`
      );

      const updatedTxs = transactions.filter(t => t.id !== txId);
      localStorage.setItem('gift_shop_transactions', JSON.stringify(updatedTxs));

      // Adjust earnings
      const earnings = getLocalCreatorEarnings(tx.receiver_id);
      earnings.total_coins_earned = Math.max(0, earnings.total_coins_earned - tx.coin_cost);
      earnings.total_gifts_received = Math.max(0, earnings.total_gifts_received - 1);
      localStorage.setItem(`gift_earnings_${tx.receiver_id}`, JSON.stringify(earnings));

      set({ 
        transactions: updatedTxs,
        creatorEarnings: earnings,
        isLoading: false 
      });
      return true;
    }

    try {
      // In real mode we fetch transaction details
      const { data: tx, error: fetchError } = await supabase
        .from('gift_transactions')
        .select('*')
        .eq('id', txId)
        .single();

      if (fetchError || !tx) throw new Error('Transaction not found');

      // 1. Debit coins from receiver
      const rev_success_1 = await useWalletStore.getState().executeTransaction(
        tx.receiver_id,
        -Number(tx.coin_cost),
        'gift_refund_debit',
        `Refund deduction for gift transaction ${txId}`,
        'gift_refund',
        `ref_rcv_${txId}`
      );

      // 2. Credit coins back to sender
      const rev_success_2 = await useWalletStore.getState().executeTransaction(
        tx.sender_id,
        Number(tx.coin_cost),
        'gift_refund_credit',
        `Refund return for gift transaction ${txId}`,
        'gift_refund',
        `ref_snd_${txId}`
      );

      if (rev_success_1 && rev_success_2) {
        // Delete the transaction record
        await supabase.from('gift_transactions').delete().eq('id', txId);
        
        // Decrement analytics
        const { data: analytics } = await supabase
          .from('gift_analytics')
          .select('*')
          .eq('gift_id', tx.gift_id)
          .maybeSingle();

        if (analytics) {
          await supabase.from('gift_analytics').update({
            send_count: Math.max(0, Number(analytics.send_count) - 1),
            total_coins_volume: Math.max(0, Number(analytics.total_coins_volume) - Number(tx.coin_cost))
          }).eq('gift_id', tx.gift_id);
        }

        // Decrement earnings
        const { data: creatorEarnings } = await supabase
          .from('creator_gift_earnings')
          .select('*')
          .eq('user_id', tx.receiver_id)
          .maybeSingle();

        if (creatorEarnings) {
          await supabase.from('creator_gift_earnings').update({
            total_coins_earned: Math.max(0, Number(creatorEarnings.total_coins_earned) - Number(tx.coin_cost)),
            total_gifts_received: Math.max(0, Number(creatorEarnings.total_gifts_received) - 1)
          }).eq('user_id', tx.receiver_id);
        }

        set({ isLoading: false });
        return true;
      }
      
      set({ isLoading: false });
      return false;
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
      return false;
    }
  }
}));

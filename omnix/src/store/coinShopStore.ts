import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useWalletStore } from './walletStore';
import { useSubscriptionStore } from './subscriptionStore';

export interface CoinPack {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus_coins: number;
  tag: string | null; // 'featured', 'popular', 'best_value'
  pack_type: 'standard' | 'festival' | 'limited' | 'creator';
  is_active: boolean;
  created_at: string;
}

export interface CoinOffer {
  id: string;
  pack_id: string;
  discount_percent: number;
  extra_bonus_percent: number;
  ends_at: string;
  is_active: boolean;
  description: string;
  created_at: string;
}

export interface CoinCoupon {
  code: string;
  discount_percent: number;
  is_active: boolean;
  ends_at: string | null;
  created_at: string;
}

export interface CoinPurchase {
  id: string;
  user_id: string;
  pack_id: string | null;
  pack_name: string;
  coins_purchased: number;
  bonus_coins: number;
  price_paid: number;
  payment_method: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe';
  payment_status: 'completed' | 'refunded' | 'failed';
  gateway_transaction_id: string;
  created_at: string;
  username?: string;
  email?: string;
}

export interface PaymentGatewayConfig {
  id: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe';
  name: string;
  is_enabled: boolean;
  test_mode: boolean;
}

interface CoinShopState {
  coinPacks: CoinPack[];
  activeOffers: CoinOffer[];
  coupons: CoinCoupon[];
  purchases: CoinPurchase[];
  gateways: PaymentGatewayConfig[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchShopData: (userId: string) => Promise<void>;
  
  // Public/Purchase flows
  validateCoupon: (code: string) => Promise<CoinCoupon | null>;
  simulatePurchase: (
    userId: string,
    packId: string,
    gatewayId: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe',
    couponCode?: string
  ) => Promise<{ success: boolean; coinsAdded: number; finalPrice: number; txId: string; error?: string }>;

  // Admin Actions
  createCoinPack: (pack: Omit<CoinPack, 'id' | 'created_at'>) => Promise<void>;
  updateCoinPack: (id: string, updates: Partial<CoinPack>) => Promise<void>;
  deleteCoinPack: (id: string) => Promise<void>;
  createOffer: (offer: Omit<CoinOffer, 'id' | 'created_at'>) => Promise<void>;
  deleteOffer: (id: string) => Promise<void>;
  createCoupon: (coupon: CoinCoupon) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;
  refundPurchase: (purchaseId: string) => Promise<boolean>;
  updateGatewayConfig: (gatewayId: 'razorpay' | 'google_play' | 'apple_pay' | 'stripe', updates: Partial<PaymentGatewayConfig>) => void;
  exportReport: (format: 'csv' | 'json') => string;
}

// Default standard packs
const DEFAULT_COIN_PACKS: CoinPack[] = [
  { id: 'pack-100', name: 'Starter Pack', coins: 100, price: 0.99, bonus_coins: 0, tag: null, pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-250', name: 'Value Pack', coins: 250, price: 1.99, bonus_coins: 10, tag: 'popular', pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-500', name: 'Bronze Chest', coins: 500, price: 3.99, bonus_coins: 50, tag: null, pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-1000', name: 'Silver Vault', coins: 1000, price: 7.99, bonus_coins: 150, tag: null, pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-2500', name: 'Gold Trove', coins: 2500, price: 18.99, bonus_coins: 500, tag: 'best_value', pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-5000', name: 'Platinum Crown', coins: 5000, price: 34.99, bonus_coins: 1500, tag: null, pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
  { id: 'pack-10000', name: 'Legendary Hoard', coins: 10000, price: 59.99, bonus_coins: 4000, tag: null, pack_type: 'standard', is_active: true, created_at: new Date().toISOString() },
];

const DEFAULT_COUPONS: CoinCoupon[] = [
  { code: 'OMNIX10', discount_percent: 10, is_active: true, ends_at: null, created_at: new Date().toISOString() },
  { code: 'OMNIX20', discount_percent: 20, is_active: true, ends_at: null, created_at: new Date().toISOString() },
  { code: 'FESTIVAL30', discount_percent: 30, is_active: true, ends_at: null, created_at: new Date().toISOString() },
];

const DEFAULT_GATEWAYS: PaymentGatewayConfig[] = [
  { id: 'razorpay', name: 'Razorpay Secure Checkout', is_enabled: true, test_mode: true },
  { id: 'google_play', name: 'Google Play Billing', is_enabled: true, test_mode: true },
  { id: 'apple_pay', name: 'Apple App Store In-App', is_enabled: true, test_mode: true },
  { id: 'stripe', name: 'Stripe Payment Elements (Future)', is_enabled: false, test_mode: true },
];

// LocalStorage helpers for sandbox/preview fallback
const getLocalPacks = (): CoinPack[] => {
  const data = localStorage.getItem('coin_shop_packs');
  if (data) return JSON.parse(data);
  localStorage.setItem('coin_shop_packs', JSON.stringify(DEFAULT_COIN_PACKS));
  return DEFAULT_COIN_PACKS;
};

const getLocalOffers = (): CoinOffer[] => {
  const data = localStorage.getItem('coin_shop_offers');
  if (data) {
    // Filter expired offers
    const offers: CoinOffer[] = JSON.parse(data);
    return offers.filter(o => new Date(o.ends_at).getTime() > Date.now() && o.is_active);
  }
  const defaultOffers: CoinOffer[] = [
    {
      id: 'offer-1',
      pack_id: 'pack-5000',
      discount_percent: 15,
      extra_bonus_percent: 10, // extra 10% bonus coins
      ends_at: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(), // 48 hours
      is_active: true,
      description: 'Weekend Super Discount Campaign!',
      created_at: new Date().toISOString()
    }
  ];
  localStorage.setItem('coin_shop_offers', JSON.stringify(defaultOffers));
  return defaultOffers;
};

const getLocalCoupons = (): CoinCoupon[] => {
  const data = localStorage.getItem('coin_shop_coupons');
  if (data) return JSON.parse(data);
  localStorage.setItem('coin_shop_coupons', JSON.stringify(DEFAULT_COUPONS));
  return DEFAULT_COUPONS;
};

const getLocalPurchases = (userId?: string): CoinPurchase[] => {
  const data = localStorage.getItem('coin_shop_purchases');
  const all: CoinPurchase[] = data ? JSON.parse(data) : [];
  if (userId) {
    return all.filter(p => p.user_id === userId);
  }
  return all;
};

const saveLocalPurchases = (purchases: CoinPurchase[]) => {
  localStorage.setItem('coin_shop_purchases', JSON.stringify(purchases));
};

export const useCoinShopStore = create<CoinShopState>((set, get) => ({
  coinPacks: DEFAULT_COIN_PACKS,
  activeOffers: [],
  coupons: DEFAULT_COUPONS,
  purchases: [],
  gateways: DEFAULT_GATEWAYS,
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchShopData: async (userId) => {
    set({ isLoading: true });

    // Check if we already fallback
    if (get().useLocalFallback) {
      set({
        coinPacks: getLocalPacks(),
        activeOffers: getLocalOffers(),
        coupons: getLocalCoupons(),
        purchases: getLocalPurchases(userId),
        isLoading: false
      });
      return;
    }

    try {
      // 1. Fetch coin packs
      const { data: packs, error: packsError } = await supabase
        .from('coin_packs')
        .select('*')
        .order('price', { ascending: true });

      if (packsError) throw packsError;

      // 2. Fetch active offers
      const { data: offers, error: offersError } = await supabase
        .from('coin_offers')
        .select('*')
        .eq('is_active', true)
        .gt('ends_at', new Date().toISOString());

      // 3. Fetch coupons
      const { data: cpns, error: cpnsError } = await supabase
        .from('coin_coupons')
        .select('*')
        .eq('is_active', true);

      // 4. Fetch purchase history
      const { data: buys, error: buysError } = await supabase
        .from('coin_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      set({
        coinPacks: (packs && packs.length > 0) ? (packs as CoinPack[]) : DEFAULT_COIN_PACKS,
        activeOffers: (offers || []) as CoinOffer[],
        coupons: (cpns && cpns.length > 0) ? (cpns as CoinCoupon[]) : DEFAULT_COUPONS,
        purchases: (buys || []) as CoinPurchase[],
        useLocalFallback: false,
        isLoading: false
      });

    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        console.warn('Supabase coin shop tables not found. Seamlessly switching to local storage sandbox.');
        set({
          coinPacks: getLocalPacks(),
          activeOffers: getLocalOffers(),
          coupons: getLocalCoupons(),
          purchases: getLocalPurchases(userId),
          useLocalFallback: true,
          isLoading: false
        });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  validateCoupon: async (code) => {
    const cleanCode = code.trim().toUpperCase();
    if (get().useLocalFallback) {
      const all = getLocalCoupons();
      const match = all.find(c => c.code === cleanCode && c.is_active);
      if (match) {
        if (match.ends_at && new Date(match.ends_at).getTime() < Date.now()) return null;
        return match;
      }
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('coin_coupons')
        .select('*')
        .eq('code', cleanCode)
        .eq('is_active', true)
        .maybeSingle();

      if (error) return null;
      if (data) {
        if (data.ends_at && new Date(data.ends_at).getTime() < Date.now()) return null;
        return data as CoinCoupon;
      }
      return null;
    } catch {
      return null;
    }
  },

  simulatePurchase: async (userId, packId, gatewayId, couponCode) => {
    set({ isLoading: true });
    
    // Find the coin pack
    const pack = get().coinPacks.find(p => p.id === packId);
    if (!pack) {
      set({ isLoading: false });
      return { success: false, coinsAdded: 0, finalPrice: 0, txId: '', error: 'Pack not found.' };
    }

    // Determine Premium Subscription Discount (10% off for Premium Members)
    const userSubscription = useSubscriptionStore.getState().userSubscription;
    const isPremium = userSubscription && userSubscription.plan_id !== 'free' && userSubscription.status === 'active';
    const premiumDiscountPercent = isPremium ? 10 : 0;

    // Check Coupon discount
    let couponDiscountPercent = 0;
    if (couponCode) {
      const coupon = await get().validateCoupon(couponCode);
      if (coupon) {
        couponDiscountPercent = Number(coupon.discount_percent);
      }
    }

    // Check Offer/Campaign updates
    const activeOffer = get().activeOffers.find(o => o.pack_id === packId);
    const offerDiscountPercent = activeOffer ? Number(activeOffer.discount_percent) : 0;
    const extraBonusPercent = activeOffer ? Number(activeOffer.extra_bonus_percent) : 0;

    // Calculate Final Pricing
    const basePrice = pack.price;
    const totalDiscountPercent = Math.min(90, premiumDiscountPercent + couponDiscountPercent + offerDiscountPercent);
    const finalPrice = Math.max(0.49, parseFloat((basePrice * (1 - totalDiscountPercent / 100)).toFixed(2)));

    // Calculate Final Coins Added (base + standard bonus + extra offer bonus)
    const baseCoins = pack.coins;
    const standardBonus = pack.bonus_coins;
    const extraOfferBonus = Math.round(baseCoins * (extraBonusPercent / 100));
    const totalCoinsAdded = baseCoins + standardBonus + extraOfferBonus;

    // Simulate payment transaction hash
    const gatewayTxId = 'gwy_' + gatewayId.slice(0, 3) + '_' + Math.random().toString(36).substring(2, 12);

    // Call Wallet Store to trigger ledger synchronisation
    const description = `Purchased ${pack.name} (${totalCoinsAdded.toLocaleString()} Coins Bundle) via ${gatewayId.toUpperCase()}`;
    const ledgerSuccess = await useWalletStore.getState().executeTransaction(
      userId,
      totalCoinsAdded,
      'coin_purchase',
      description,
      'purchase_gateway',
      gatewayTxId
    );

    if (!ledgerSuccess) {
      set({ isLoading: false });
      return { success: false, coinsAdded: 0, finalPrice: 0, txId: '', error: 'Ledger update failed.' };
    }

    // Save Purchase record
    const newPurchase: CoinPurchase = {
      id: 'pur_' + Math.random().toString(36).substring(2, 10),
      user_id: userId,
      pack_id: pack.id,
      pack_name: pack.name,
      coins_purchased: baseCoins,
      bonus_coins: standardBonus + extraOfferBonus,
      price_paid: finalPrice,
      payment_method: gatewayId,
      payment_status: 'completed',
      gateway_transaction_id: gatewayTxId,
      created_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const allPurchases = getLocalPurchases();
      allPurchases.unshift(newPurchase);
      saveLocalPurchases(allPurchases);

      set({
        purchases: getLocalPurchases(userId),
        isLoading: false
      });
    } else {
      try {
        await supabase.from('coin_purchases').insert({
          user_id: userId,
          pack_id: pack.id,
          pack_name: pack.name,
          coins_purchased: baseCoins,
          bonus_coins: standardBonus + extraOfferBonus,
          price_paid: finalPrice,
          payment_method: gatewayId,
          payment_status: 'completed',
          gateway_transaction_id: gatewayTxId
        });

        // Refresh purchases
        const { data: buys } = await supabase
          .from('coin_purchases')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        set({ purchases: (buys || []) as CoinPurchase[], isLoading: false });
      } catch (e: any) {
        console.error('Failed to save purchase to Supabase:', e.message);
        // Fallback save to local storage
        const allPurchases = getLocalPurchases();
        allPurchases.unshift(newPurchase);
        saveLocalPurchases(allPurchases);
        set({ purchases: getLocalPurchases(userId), isLoading: false });
      }
    }

    return {
      success: true,
      coinsAdded: totalCoinsAdded,
      finalPrice: finalPrice,
      txId: gatewayTxId
    };
  },

  // Admin Actions
  createCoinPack: async (pack) => {
    set({ isLoading: true });
    const newPack: CoinPack = {
      ...pack,
      id: 'pack-' + Math.random().toString(36).substring(7),
      created_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const packs = getLocalPacks();
      packs.push(newPack);
      localStorage.setItem('coin_shop_packs', JSON.stringify(packs));
      set({ coinPacks: packs, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_packs').insert(pack);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || ''); // Refresh
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updateCoinPack: async (id, updates) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const packs = getLocalPacks().map(p => p.id === id ? { ...p, ...updates } : p);
      localStorage.setItem('coin_shop_packs', JSON.stringify(packs));
      set({ coinPacks: packs, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_packs').update(updates).eq('id', id);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteCoinPack: async (id) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const packs = getLocalPacks().filter(p => p.id !== id);
      localStorage.setItem('coin_shop_packs', JSON.stringify(packs));
      set({ coinPacks: packs, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_packs').delete().eq('id', id);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  createOffer: async (offer) => {
    set({ isLoading: true });
    const newOffer: CoinOffer = {
      ...offer,
      id: 'offer-' + Math.random().toString(36).substring(7),
      created_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const offers = getLocalOffers();
      offers.push(newOffer);
      localStorage.setItem('coin_shop_offers', JSON.stringify(offers));
      set({ activeOffers: offers, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_offers').insert(offer);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteOffer: async (id) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const offers = getLocalOffers().filter(o => o.id !== id);
      localStorage.setItem('coin_shop_offers', JSON.stringify(offers));
      set({ activeOffers: offers, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_offers').delete().eq('id', id);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  createCoupon: async (coupon) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const coupons = getLocalCoupons();
      coupons.push(coupon);
      localStorage.setItem('coin_shop_coupons', JSON.stringify(coupons));
      set({ coupons, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_coupons').insert(coupon);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  deleteCoupon: async (code) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const coupons = getLocalCoupons().filter(c => c.code !== code);
      localStorage.setItem('coin_shop_coupons', JSON.stringify(coupons));
      set({ coupons, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase.from('coin_coupons').delete().eq('code', code);
      if (error) throw error;
      await get().fetchShopData(useWalletStore.getState().wallet?.updated_at || '');
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  refundPurchase: async (purchaseId) => {
    set({ isLoading: true });
    const purchase = get().purchases.find(p => p.id === purchaseId);
    if (!purchase) {
      set({ isLoading: false });
      return false;
    }

    // Reverse payment transaction (deduct base coins + bonus coins)
    const totalCoinsRefunded = purchase.coins_purchased + purchase.bonus_coins;
    const ledgerSuccess = await useWalletStore.getState().executeTransaction(
      purchase.user_id,
      -totalCoinsRefunded,
      'coin_purchase_refund',
      `Refund for ${purchase.pack_name} purchase. Deducted ${totalCoinsRefunded} Coins.`,
      'admin_adjustment',
      'ref_' + purchase.gateway_transaction_id
    );

    if (!ledgerSuccess) {
      set({ isLoading: false });
      return false;
    }

    // Update purchase status
    if (get().useLocalFallback) {
      const purchases = getLocalPurchases().map(p => p.id === purchaseId ? { ...p, payment_status: 'refunded' as const } : p);
      saveLocalPurchases(purchases);
      set({ purchases: getLocalPurchases(purchase.user_id), isLoading: false });
    } else {
      try {
        await supabase
          .from('coin_purchases')
          .update({ payment_status: 'refunded' })
          .eq('id', purchaseId);

        // Refresh purchases
        const { data: buys } = await supabase
          .from('coin_purchases')
          .select('*')
          .eq('user_id', purchase.user_id)
          .order('created_at', { ascending: false });

        set({ purchases: (buys || []) as CoinPurchase[], isLoading: false });
      } catch (e: any) {
        console.error('Failed to update status on Supabase:', e.message);
        const purchases = getLocalPurchases().map(p => p.id === purchaseId ? { ...p, payment_status: 'refunded' as const } : p);
        saveLocalPurchases(purchases);
        set({ purchases: getLocalPurchases(purchase.user_id), isLoading: false });
      }
    }

    return true;
  },

  updateGatewayConfig: (gatewayId, updates) => {
    set(state => ({
      gateways: state.gateways.map(g => g.id === gatewayId ? { ...g, ...updates } : g)
    }));
  },

  exportReport: (format) => {
    const list = get().purchases;
    if (format === 'json') {
      return JSON.stringify(list, null, 2);
    }
    const headers = ['Purchase ID', 'User ID', 'Pack Name', 'Base Coins', 'Bonus Coins', 'Price Paid', 'Payment Method', 'Status', 'Tx ID', 'Timestamp'];
    const rows = list.map(p => [
      p.id,
      p.user_id,
      p.pack_name,
      p.coins_purchased,
      p.bonus_coins,
      p.price_paid,
      p.payment_method,
      p.payment_status,
      p.gateway_transaction_id,
      p.created_at
    ]);
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}));

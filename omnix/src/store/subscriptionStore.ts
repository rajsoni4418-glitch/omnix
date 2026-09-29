import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Plan {
  id: string;
  name: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  billing_period: 'monthly' | 'yearly' | 'free';
  start_date: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

export interface SubscriptionHistory {
  id: string;
  user_id: string;
  plan_id: string;
  action: string;
  amount: number;
  billing_period: string;
  created_at: string;
  username?: string;
  email?: string;
}

export interface SubscriptionLog {
  id: string;
  user_id: string;
  event_type: string;
  details: string;
  created_at: string;
}

export interface SubscriberDetail {
  subscription_id: string;
  user_id: string;
  username: string;
  email: string;
  full_name: string;
  plan_id: string;
  plan_name: string;
  status: string;
  billing_period: string;
  start_date: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

interface SubscriptionState {
  plans: Plan[];
  userSubscription: UserSubscription | null;
  history: SubscriptionHistory[];
  logs: SubscriptionLog[];
  subscribers: SubscriberDetail[];
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchPlans: () => Promise<void>;
  fetchUserSubscription: (userId: string) => Promise<void>;
  subscribe: (userId: string, planId: string, billingPeriod: 'monthly' | 'yearly') => Promise<void>;
  cancelSubscription: (userId: string) => Promise<void>;
  renewSubscription: (userId: string) => Promise<void>;
  fetchHistory: (userId: string) => Promise<void>;
  fetchLogs: (userId: string) => Promise<void>;
  
  // Admin functions
  fetchAdminData: () => Promise<void>;
  grantManualPremium: (userId: string, planId: string, durationDays: number) => Promise<void>;
  removePremium: (userId: string) => Promise<void>;
  updatePlanPricing: (planId: string, priceMonthly: number, priceYearly: number) => Promise<void>;
  setPlanActiveState: (planId: string, isActive: boolean) => Promise<void>;
}

// Default static plans matching specification
const DEFAULT_PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    features: ['Limited Chat', 'Standard Profile', 'Basic Story Fonts'],
    is_active: true
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price_monthly: 9.99,
    price_yearly: 0,
    features: [
      'Ad-Free Experience',
      'Premium Themes',
      'Premium Chat Themes',
      'Premium Profile Frames',
      'Premium Badges',
      'Username Colors',
      'Premium Story Effects',
      'Premium Story Fonts',
      'Premium Stickers',
      'Premium Emojis',
      'Higher Upload Limits',
      'Extra Cloud Storage',
      'AI Credits (100/mo)',
      'Early Access Features',
      'Priority Support'
    ],
    is_active: true
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price_monthly: 0,
    price_yearly: 89.99,
    features: [
      'Ad-Free Experience',
      'Premium Themes',
      'Premium Chat Themes',
      'Premium Profile Frames',
      'Animated Frames',
      'Premium Badges',
      'Username Colors',
      'Premium Story Effects',
      'Premium Story Fonts',
      'Premium Stickers',
      'Premium Emojis',
      'Higher Upload Limits',
      'Extra Cloud Storage',
      'AI Credits (150/mo)',
      'Early Access Features',
      'Priority Support',
      'Save 25% Annually'
    ],
    is_active: true
  },
  {
    id: 'creator_pro',
    name: 'Creator Pro',
    price_monthly: 29.99,
    price_yearly: 269.99,
    features: [
      'All Premium Features',
      'Creator Dashboard',
      'Analytics Suite',
      'Custom Profile Frames',
      'Animated Profiles',
      'Exclusive Story Stickers',
      'Unlimited Story Fonts',
      'AI Credits (500/mo)',
      'Premium Monetization Tools',
      'Direct Fans Support'
    ],
    is_active: true
  },
  {
    id: 'business',
    name: 'Business',
    price_monthly: 79.99,
    price_yearly: 719.99,
    features: [
      'All Creator Pro Features',
      'Commercial License',
      'Team Accounts (up to 5)',
      'Verified Business Badge',
      'Interactive Polls & Q&As',
      'Featured Community Listing',
      'Custom Stickers Packs',
      'AI Credits (Unlimited)',
      'Dedicated Account Manager',
      '24/7 Phone Support'
    ],
    is_active: true
  }
];

// LocalStorage helpers for preview sandbox
const getLocalSubscription = (userId: string): UserSubscription => {
  const data = localStorage.getItem(`sub_${userId}`);
  if (data) return JSON.parse(data);
  const newSub: UserSubscription = {
    id: 'sub_free_' + Math.random().toString(36).substring(7),
    user_id: userId,
    plan_id: 'free',
    status: 'active',
    billing_period: 'free',
    start_date: new Date().toISOString(),
    current_period_end: null,
    cancel_at_period_end: false
  };
  localStorage.setItem(`sub_${userId}`, JSON.stringify(newSub));
  return newSub;
};

const saveLocalSubscription = (userId: string, sub: UserSubscription) => {
  localStorage.setItem(`sub_${userId}`, JSON.stringify(sub));
};

const getLocalHistory = (userId: string): SubscriptionHistory[] => {
  const data = localStorage.getItem(`sub_hist_${userId}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalHistory = (userId: string, item: SubscriptionHistory) => {
  const history = getLocalHistory(userId);
  history.unshift(item);
  localStorage.setItem(`sub_hist_${userId}`, JSON.stringify(history));
};

const getLocalLogs = (userId: string): SubscriptionLog[] => {
  const data = localStorage.getItem(`sub_logs_${userId}`);
  return data ? JSON.parse(data) : [];
};

const saveLocalLog = (userId: string, item: SubscriptionLog) => {
  const logs = getLocalLogs(userId);
  logs.unshift(item);
  localStorage.setItem(`sub_logs_${userId}`, JSON.stringify(logs));
};

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plans: DEFAULT_PLANS,
  userSubscription: null,
  history: [],
  logs: [],
  subscribers: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchPlans: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.from('premium_plans').select('*');
      if (error) throw error;
      if (data && data.length > 0) {
        set({ plans: data as Plan[], useLocalFallback: false, isLoading: false });
      } else {
        set({ plans: DEFAULT_PLANS, isLoading: false });
      }
    } catch (e: any) {
      // In case of relation error (PGRST205 / Table missing in cache)
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        set({ useLocalFallback: true, plans: DEFAULT_PLANS, isLoading: false });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  fetchUserSubscription: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const localSub = getLocalSubscription(userId);
      set({ userSubscription: localSub, isLoading: false });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({ userSubscription: data as UserSubscription, isLoading: false });
      } else {
        // No subscription record yet, create standard Free subscription
        const freeSub: Partial<UserSubscription> = {
          user_id: userId,
          plan_id: 'free',
          status: 'active',
          billing_period: 'free',
          cancel_at_period_end: false
        };
        const { data: inserted, error: insertError } = await supabase
          .from('user_subscriptions')
          .insert(freeSub)
          .select()
          .single();

        if (insertError) throw insertError;
        set({ userSubscription: inserted as UserSubscription, isLoading: false });
      }
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        const localSub = getLocalSubscription(userId);
        set({ useLocalFallback: true, userSubscription: localSub, isLoading: false });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  subscribe: async (userId, planId, billingPeriod) => {
    set({ isLoading: true });
    const currentPrice = get().plans.find(p => p.id === planId)?.[billingPeriod === 'monthly' ? 'price_monthly' : 'price_yearly'] || 0;
    const durationMonths = billingPeriod === 'monthly' ? 1 : 12;
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + durationMonths);

    if (get().useLocalFallback) {
      const sub: UserSubscription = {
        id: 'sub_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_period: billingPeriod as any,
        start_date: new Date().toISOString(),
        current_period_end: expiry.toISOString(),
        cancel_at_period_end: false
      };
      saveLocalSubscription(userId, sub);

      const actionItem: SubscriptionHistory = {
        id: 'hist_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: planId,
        action: 'upgrade',
        amount: currentPrice,
        billing_period: billingPeriod,
        created_at: new Date().toISOString()
      };
      saveLocalHistory(userId, actionItem);

      const logItem: SubscriptionLog = {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: userId,
        event_type: 'subscription_created',
        details: `Subscribed to ${planId} plan (${billingPeriod})`,
        created_at: new Date().toISOString()
      };
      saveLocalLog(userId, logItem);

      set({ 
        userSubscription: sub, 
        history: getLocalHistory(userId), 
        logs: getLocalLogs(userId),
        isLoading: false 
      });
      return;
    }

    try {
      const updates = {
        plan_id: planId,
        status: 'active',
        billing_period: billingPeriod,
        current_period_end: expiry.toISOString(),
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_subscriptions')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      // Log subscription history
      await supabase.from('subscription_history').insert({
        user_id: userId,
        plan_id: planId,
        action: 'upgrade',
        amount: currentPrice,
        billing_period: billingPeriod
      });

      // Log audit trail
      await supabase.from('subscription_logs').insert({
        user_id: userId,
        event_type: 'subscription_created',
        details: `Subscribed to ${planId} plan (${billingPeriod})`
      });

      set({ userSubscription: data as UserSubscription, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  cancelSubscription: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const current = getLocalSubscription(userId);
      const updated: UserSubscription = {
        ...current,
        cancel_at_period_end: true,
        status: 'canceled'
      };
      saveLocalSubscription(userId, updated);

      saveLocalHistory(userId, {
        id: 'hist_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: current.plan_id,
        action: 'cancel',
        amount: 0,
        billing_period: current.billing_period,
        created_at: new Date().toISOString()
      });

      saveLocalLog(userId, {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: userId,
        event_type: 'subscription_canceled',
        details: `Cancelled automatic renewals for ${current.plan_id} plan`,
        created_at: new Date().toISOString()
      });

      set({ 
        userSubscription: updated, 
        history: getLocalHistory(userId), 
        logs: getLocalLogs(userId),
        isLoading: false 
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: true,
          status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('subscription_history').insert({
        user_id: userId,
        plan_id: data.plan_id,
        action: 'cancel',
        amount: 0,
        billing_period: data.billing_period
      });

      await supabase.from('subscription_logs').insert({
        user_id: userId,
        event_type: 'subscription_canceled',
        details: `Cancelled automatic renewals for ${data.plan_id} plan`
      });

      set({ userSubscription: data as UserSubscription, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  renewSubscription: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const current = getLocalSubscription(userId);
      const updated: UserSubscription = {
        ...current,
        cancel_at_period_end: false,
        status: 'active'
      };
      saveLocalSubscription(userId, updated);

      saveLocalHistory(userId, {
        id: 'hist_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: current.plan_id,
        action: 'renew',
        amount: 0,
        billing_period: current.billing_period,
        created_at: new Date().toISOString()
      });

      saveLocalLog(userId, {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: userId,
        event_type: 'subscription_renewed',
        details: `Renewed automatic renewals for ${current.plan_id} plan`,
        created_at: new Date().toISOString()
      });

      set({ 
        userSubscription: updated, 
        history: getLocalHistory(userId), 
        logs: getLocalLogs(userId),
        isLoading: false 
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .update({
          cancel_at_period_end: false,
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('subscription_history').insert({
        user_id: userId,
        plan_id: data.plan_id,
        action: 'renew',
        amount: 0,
        billing_period: data.billing_period
      });

      await supabase.from('subscription_logs').insert({
        user_id: userId,
        event_type: 'subscription_renewed',
        details: `Renewed automatic renewals for ${data.plan_id} plan`
      });

      set({ userSubscription: data as UserSubscription, isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  fetchHistory: async (userId) => {
    if (get().useLocalFallback) {
      set({ history: getLocalHistory(userId) });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ history: data as SubscriptionHistory[] });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        set({ history: getLocalHistory(userId) });
      }
    }
  },

  fetchLogs: async (userId) => {
    if (get().useLocalFallback) {
      set({ logs: getLocalLogs(userId) });
      return;
    }
    try {
      const { data, error } = await supabase
        .from('subscription_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ logs: data as SubscriptionLog[] });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        set({ logs: getLocalLogs(userId) });
      }
    }
  },

  fetchAdminData: async () => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      // Create interesting mock subscribers list in sandbox
      const sampleSubscribers: SubscriberDetail[] = [
        {
          subscription_id: 'sub_1',
          user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
          username: 'emma_w',
          email: 'emma_w@example.com',
          full_name: 'Emma Wilson',
          plan_id: 'premium_monthly',
          plan_name: 'Premium Monthly',
          status: 'active',
          billing_period: 'monthly',
          start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
          current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
          cancel_at_period_end: false
        },
        {
          subscription_id: 'sub_2',
          user_id: '84ad35bc-5be1-42b1-947a-e073538fd82d',
          username: 'jcarter',
          email: 'jcarter@example.com',
          full_name: 'James Carter',
          plan_id: 'creator_pro',
          plan_name: 'Creator Pro',
          status: 'active',
          billing_period: 'yearly',
          start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
          current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 325).toISOString(),
          cancel_at_period_end: false
        },
        {
          subscription_id: 'sub_3',
          user_id: '29209b5b-6a45-4650-aac7-50d6e2566c5e',
          username: 'sophia_l',
          email: 'sophia_l@example.com',
          full_name: 'Sophia Lee',
          plan_id: 'business',
          plan_name: 'Business',
          status: 'active',
          billing_period: 'monthly',
          start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
          cancel_at_period_end: false
        }
      ];
      set({ subscribers: sampleSubscribers, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('active_subscribers_view')
        .select('*');

      if (error) throw error;
      set({ subscribers: data as SubscriberDetail[], isLoading: false });
    } catch (e: any) {
      if (e.code === 'PGRST205' || e.message?.includes('relation') || e.message?.includes('schema cache')) {
        // Safe mock fallback for administrative dashboard
        const sampleSubscribers: SubscriberDetail[] = [
          {
            subscription_id: 'sub_1',
            user_id: '8fb7f5ae-b1d5-4ee7-8652-b757393173a5',
            username: 'emma_w',
            email: 'emma_w@example.com',
            full_name: 'Emma Wilson',
            plan_id: 'premium_monthly',
            plan_name: 'Premium Monthly',
            status: 'active',
            billing_period: 'monthly',
            start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
            current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20).toISOString(),
            cancel_at_period_end: false
          },
          {
            subscription_id: 'sub_2',
            user_id: '84ad35bc-5be1-42b1-947a-e073538fd82d',
            username: 'jcarter',
            email: 'jcarter@example.com',
            full_name: 'James Carter',
            plan_id: 'creator_pro',
            plan_name: 'Creator Pro',
            status: 'active',
            billing_period: 'yearly',
            start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
            current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 325).toISOString(),
            cancel_at_period_end: false
          },
          {
            subscription_id: 'sub_3',
            user_id: '29209b5b-6a45-4650-aac7-50d6e2566c5e',
            username: 'sophia_l',
            email: 'sophia_l@example.com',
            full_name: 'Sophia Lee',
            plan_id: 'business',
            plan_name: 'Business',
            status: 'active',
            billing_period: 'monthly',
            start_date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
            current_period_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 25).toISOString(),
            cancel_at_period_end: false
          }
        ];
        set({ subscribers: sampleSubscribers, useLocalFallback: true, isLoading: false });
      } else {
        set({ error: e.message, isLoading: false });
      }
    }
  },

  grantManualPremium: async (userId, planId, durationDays) => {
    set({ isLoading: true });
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + durationDays);

    if (get().useLocalFallback) {
      const sub: UserSubscription = {
        id: 'sub_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: planId,
        status: 'active',
        billing_period: 'monthly',
        start_date: new Date().toISOString(),
        current_period_end: expiry.toISOString(),
        cancel_at_period_end: false
      };
      saveLocalSubscription(userId, sub);

      const actionItem: SubscriptionHistory = {
        id: 'hist_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: planId,
        action: 'manual_grant',
        amount: 0,
        billing_period: 'monthly',
        created_at: new Date().toISOString()
      };
      saveLocalHistory(userId, actionItem);

      const logItem: SubscriptionLog = {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: userId,
        event_type: 'plan_modified',
        details: `Manual grant of ${planId} for ${durationDays} days`,
        created_at: new Date().toISOString()
      };
      saveLocalLog(userId, logItem);

      // Also update local list of subscribers
      const currentSubscribers = get().subscribers;
      const existingIdx = currentSubscribers.findIndex(s => s.user_id === userId);
      const planName = get().plans.find(p => p.id === planId)?.name || planId;
      
      const newSubscriberDetail: SubscriberDetail = {
        subscription_id: sub.id,
        user_id: userId,
        username: 'User_' + userId.slice(0, 4),
        email: 'user_' + userId.slice(0, 4) + '@example.com',
        full_name: 'Granted User',
        plan_id: planId,
        plan_name: planName,
        status: 'active',
        billing_period: 'monthly',
        start_date: sub.start_date,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: false
      };

      let updatedSubscribers = [...currentSubscribers];
      if (existingIdx >= 0) {
        updatedSubscribers[existingIdx] = {
          ...updatedSubscribers[existingIdx],
          plan_id: planId,
          plan_name: planName,
          status: 'active',
          current_period_end: sub.current_period_end
        };
      } else {
        updatedSubscribers.push(newSubscriberDetail);
      }

      set({ 
        subscribers: updatedSubscribers,
        isLoading: false 
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('grant_manual_premium', {
        target_user_id: userId,
        target_plan_id: planId,
        duration_days: durationDays
      });

      if (error) throw error;
      
      // Refresh admin dataset
      const { data: refreshedSubscribers } = await supabase
        .from('active_subscribers_view')
        .select('*');

      set({ subscribers: refreshedSubscribers as SubscriberDetail[], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  removePremium: async (userId) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const sub = getLocalSubscription(userId);
      const updated: UserSubscription = {
        ...sub,
        plan_id: 'free',
        status: 'active',
        current_period_end: null,
        cancel_at_period_end: false
      };
      saveLocalSubscription(userId, updated);

      saveLocalHistory(userId, {
        id: 'hist_' + Math.random().toString(36).substring(7),
        user_id: userId,
        plan_id: 'free',
        action: 'manual_remove',
        amount: 0,
        billing_period: 'free',
        created_at: new Date().toISOString()
      });

      saveLocalLog(userId, {
        id: 'log_' + Math.random().toString(36).substring(7),
        user_id: userId,
        event_type: 'plan_modified',
        details: 'Manual premium removal back to Free plan',
        created_at: new Date().toISOString()
      });

      const updatedSubscribers = get().subscribers.map(s => {
        if (s.user_id === userId) {
          return {
            ...s,
            plan_id: 'free',
            plan_name: 'Free',
            status: 'active',
            current_period_end: null
          };
        }
        return s;
      });

      set({ 
        userSubscription: updated, 
        subscribers: updatedSubscribers,
        isLoading: false 
      });
      return;
    }

    try {
      const { error } = await supabase.rpc('remove_user_premium', {
        target_user_id: userId
      });

      if (error) throw error;

      // Refresh admin dataset
      const { data: refreshedSubscribers } = await supabase
        .from('active_subscribers_view')
        .select('*');

      set({ subscribers: refreshedSubscribers as SubscriberDetail[], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  updatePlanPricing: async (planId, priceMonthly, priceYearly) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const updatedPlans = get().plans.map(p => {
        if (p.id === planId) {
          return { ...p, price_monthly: priceMonthly, price_yearly: priceYearly };
        }
        return p;
      });
      set({ plans: updatedPlans, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase
        .from('premium_plans')
        .update({
          price_monthly: priceMonthly,
          price_yearly: priceYearly,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      
      const { data: refreshedPlans } = await supabase.from('premium_plans').select('*');
      set({ plans: refreshedPlans as Plan[], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  },

  setPlanActiveState: async (planId, isActive) => {
    set({ isLoading: true });
    if (get().useLocalFallback) {
      const updatedPlans = get().plans.map(p => {
        if (p.id === planId) {
          return { ...p, is_active: isActive };
        }
        return p;
      });
      set({ plans: updatedPlans, isLoading: false });
      return;
    }

    try {
      const { error } = await supabase
        .from('premium_plans')
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      
      const { data: refreshedPlans } = await supabase.from('premium_plans').select('*');
      set({ plans: refreshedPlans as Plan[], isLoading: false });
    } catch (e: any) {
      set({ error: e.message, isLoading: false });
    }
  }
}));

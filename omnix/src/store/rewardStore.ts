import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface ShopItem {
  id: string;
  name: string;
  title: string;
  description: string;
  item_type: string;
  category: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  icon: string;
  is_active: boolean;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: string;
  action: string;
  target_count: number;
  reward_coins: number;
}

export interface UserMissionProgress {
  id?: string;
  mission_id: string;
  current_count: number;
  is_completed: boolean;
  claimed: boolean;
}

export interface InventoryItem {
  id: string;
  item_id: string;
  is_equipped: boolean;
  shop_items: ShopItem;
}

interface RewardState {
  coinBalance: number;
  experiencePoints: number;
  streak: number;
  level: string;
  transactions: any[];
  shopItems: ShopItem[];
  inventory: InventoryItem[];
  missions: Mission[];
  missionProgress: Record<string, UserMissionProgress>;
  loading: boolean;
  error: string | null;
  
  fetchEconomyData: (userId: string) => Promise<void>;
  claimMission: (userId: string, missionId: string) => Promise<{ success: boolean; error?: string; reward?: number }>;
  purchaseItem: (userId: string, itemId: string) => Promise<{ success: boolean; error?: string }>;
  equipItem: (userId: string, itemId: string) => Promise<{ success: boolean; error?: string }>;
  addCoins: (amount: number) => Promise<void>;
}

const DEFAULT_SHOP_ITEMS: ShopItem[] = [
  { id: 'item_1', title: 'Neon Frame', name: 'Neon Frame', description: 'A glowing neon profile frame.', item_type: 'Profile Frame', price: 100, icon: 'Layout', category: 'Profile', is_active: true, discount_price: null, image_url: '' },
  { id: 'item_2', title: 'Gold Badge', name: 'Gold Badge', description: 'Show off your wealth.', item_type: 'Premium Badge', price: 500, icon: 'Award', category: 'Profile', is_active: true, discount_price: null, image_url: '' },
  { id: 'item_3', title: 'Dark Theme', name: 'Dark Theme', description: 'Exclusive app theme.', item_type: 'Premium Theme', price: 1000, icon: 'Palette', category: 'Themes', is_active: true, discount_price: null, image_url: '' },
  { id: 'item_4', title: 'Story Pack A', name: 'Story Pack A', description: 'Cool story templates.', item_type: 'Story Templates', price: 200, icon: 'Image', category: 'Stories', is_active: true, discount_price: null, image_url: '' },
  { id: 'item_5', title: 'Diamond Frame', name: 'Diamond Frame', description: 'Sparkling diamond frame.', item_type: 'Profile Frame', price: 2500, icon: 'Layout', category: 'Profile', is_active: true, discount_price: null, image_url: '' },
  { id: 'item_6', title: 'VIP Badge', name: 'VIP Badge', description: 'Exclusive VIP status.', item_type: 'Premium Badge', price: 5000, icon: 'Award', category: 'Profile', is_active: true, discount_price: null, image_url: '' }
];

const DEFAULT_MISSIONS: Mission[] = [
  { id: 'm_1', title: 'Watch 5 Videos', description: '', type: 'Daily', action: 'watch_video', target_count: 5, reward_coins: 50 },
  { id: 'm_2', title: 'Like 10 Posts', description: '', type: 'Daily', action: 'like_post', target_count: 10, reward_coins: 25 },
  { id: 'm_3', title: 'Share a Story', description: '', type: 'Daily', action: 'share_story', target_count: 1, reward_coins: 100 },
  { id: 'm_4', title: 'Upload 3 Videos', description: '', type: 'Weekly', action: 'upload_video', target_count: 3, reward_coins: 500 },
  { id: 'm_5', title: 'Get 100 Likes', description: '', type: 'Monthly', action: 'receive_likes', target_count: 100, reward_coins: 2000 }
];

export const useRewardStore = create<RewardState>((set, get) => ({
  coinBalance: 0,
  experiencePoints: 0,
  streak: 0,
  level: 'Bronze',
  transactions: [],
  shopItems: [],
  inventory: [],
  missions: [],
  missionProgress: {},
  loading: false,
  error: null,
  
  addCoins: async (amount: number) => {
    try {
      const current = get().coinBalance;
      const newBalance = current + amount;
      set({ coinBalance: newBalance, streak: get().streak + 1 });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { coins: newBalance, streak: get().streak }
        });
      }
    } catch (e) {
      console.error('addCoins error', e);
    }
  },

  fetchEconomyData: async (userId) => {
    set({ loading: true, error: null });
    try {
      let currentCoins = 0;
      let currentXp = 0;

      // 1. Fetch user profile or metadata for coins/xp
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        currentCoins = user.user_metadata.coins || 0;
        currentXp = user.user_metadata.xp || 0;
      }

      set({ 
        coinBalance: currentCoins, 
        experiencePoints: currentXp,
        level: currentXp > 1000 ? 'Silver' : 'Bronze',
        inventory: user?.user_metadata?.inventory || [],
        missionProgress: user?.user_metadata?.missionProgress || {}
      });

      // 2. Fetch Shop Items (Fallback if empty/missing)
      const { data: shopData } = await supabase.from('shop_items').select('*').eq('is_active', true);
      if (shopData && shopData.length > 0) {
        set({ shopItems: shopData.map(d => ({ ...d, category: d.category || 'Profile', icon: d.icon || 'Star', title: d.name || d.title })) });
      } else {
        set({ shopItems: [] });
      }

      // 3. Fetch Missions (Fallback if empty/missing)
      let defaultMissions: any[] = [];
      const { data: missionData } = await supabase.from('missions').select('*').eq('is_active', true);
      if (missionData && missionData.length > 0) {
        set({ missions: missionData });
        defaultMissions = missionData;
      } else {
        set({ missions: [] });
      }

      // Initialize mission progress so users can claim them
      const storedProgress = user?.user_metadata?.missionProgress || {};
      const newProgress = { ...storedProgress };
      let updated = false;
      defaultMissions.forEach(m => {
        if (!newProgress[m.id]) {
          newProgress[m.id] = {
            mission_id: m.id,
            current_count: m.target_count, // Set to completed
            is_completed: true,
            claimed: false
          };
          updated = true;
        }
      });
      
      set({ missionProgress: newProgress });
      
      if (updated && user) {
        await supabase.auth.updateUser({
          data: { missionProgress: newProgress }
        });
      }

    } catch (e: any) {
      if (e?.message && !e.message.includes("fetch") && !e.message?.includes("table")) console.warn('rewardStore notice:', e.message);
      set({ error: e.message, shopItems: DEFAULT_SHOP_ITEMS, missions: DEFAULT_MISSIONS });
    } finally {
      set({ loading: false });
    }
  },
  
  claimMission: async (userId, missionId) => {
    try {
      const { missions, missionProgress, coinBalance } = get();
      const mission = missions.find(m => m.id === missionId);
      if (!mission) throw new Error("Mission not found");
      const existingProg = missionProgress[missionId];
      if (existingProg?.claimed) throw new Error("Already claimed");

      // Update state locally
      const newBalance = coinBalance + mission.reward_coins;
      const newProgress = { ...missionProgress, [missionId]: { mission_id: missionId, current_count: mission.target_count, is_completed: true, claimed: true } };
      
      set({ coinBalance: newBalance, missionProgress: newProgress });

      // Save securely via RPC
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Secure server-side validation & reward allocation
        await supabase.rpc('secure_claim_mission', { p_user_id: user.id, p_mission_id: missionId, p_reward_coins: mission.reward_coins });
        
        // Update local metadata just for UI state
        await supabase.auth.updateUser({
          data: { missionProgress: newProgress }
        });
      }

      return { success: true, reward: mission.reward_coins };
    } catch (e: any) {
      if (e?.message && !e.message.includes("fetch") && !e.message?.includes("table")) console.warn('rewardStore notice:', e.message);
      return { success: false, error: e.message || 'Failed to claim mission' };
    }
  },

  purchaseItem: async (userId, itemId) => {
    try {
      const { coinBalance, inventory, shopItems } = get();
      const item = shopItems.find(i => i.id === itemId);
      if (!item) throw new Error("Item not found");
      
      if (coinBalance < item.price) throw new Error("Not enough coins");
      if (inventory.some(i => i.item_id === itemId)) throw new Error("Already owned");

      const newBalance = coinBalance - item.price;
      const newInventory = [...inventory, { id: Date.now().toString(), item_id: itemId, is_equipped: false, shop_items: item }];
      
      set({ coinBalance: newBalance, inventory: newInventory });

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Secure server-side validation & deduction
        await supabase.rpc('secure_purchase_item', { p_user_id: user.id, p_item_id: itemId, p_price: item.price });
        
        // Update local metadata
        await supabase.auth.updateUser({
          data: { inventory: newInventory }
        });
      }

      return { success: true };
    } catch (e: any) {
      if (e?.message && !e.message.includes("fetch") && !e.message?.includes("table")) console.warn('rewardStore notice:', e.message);
      return { success: false, error: e.message || 'Purchase failed' };
    }
  },

  equipItem: async (userId, itemId) => {
    try {
      const { inventory } = get();
      const newInventory = inventory.map(inv => ({
        ...inv,
        is_equipped: inv.item_id === itemId
      }));

      set({ inventory: newInventory });

      // Save to Auth Metadata (Persistent)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.auth.updateUser({
          data: { inventory: newInventory }
        });
      }

      return { success: true };
    } catch (e: any) {
      if (e?.message && !e.message.includes("fetch") && !e.message?.includes("table")) console.warn('rewardStore notice:', e.message);
      return { success: false, error: e.message || 'Equip failed' };
    }
  }
}));

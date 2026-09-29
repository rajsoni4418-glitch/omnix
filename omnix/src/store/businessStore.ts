import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface BusinessProfile {
  id: string;
  business_name: string;
  category: string;
  website: string;
  email: string;
  phone_number: string;
  address: string;
  business_hours: any;
  is_verified: boolean;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface AdCampaign {
  id: string;
  business_id: string;
  name: string;
  budget: number;
  spent: number;
  start_date: string;
  end_date: string;
  target_audience: any;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface Advertisement {
  id: string;
  campaign_id: string;
  business_id: string;
  type: 'post' | 'story' | 'omniclip' | 'community';
  content_id?: string;
  title: string;
  media_url?: string;
  call_to_action?: string;
  destination_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  ad_id: string;
  date: string;
  reach: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cost: number;
}

export interface BrandCollaboration {
  id: string;
  business_id: string;
  creator_id: string;
  title: string;
  description: string;
  budget: number;
  deliverables: any;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  creator_name?: string;
  business_name?: string;
}

export interface BusinessAnalytics {
  id: string;
  business_id: string;
  date: string;
  profile_visits: number;
  website_clicks: number;
  calls: number;
  messages: number;
  sales_leads: number;
  revenue: number;
}

interface BusinessState {
  profile: BusinessProfile | null;
  campaigns: AdCampaign[];
  advertisements: Advertisement[];
  campaignAnalytics: CampaignAnalytics[];
  businessAnalytics: BusinessAnalytics[];
  collaborations: BrandCollaboration[];
  allProfiles: BusinessProfile[]; // For admin
  useLocalFallback: boolean;
  isLoading: boolean;
  error: string | null;

  fetchBusinessProfile: (userId: string) => Promise<void>;
  createBusinessProfile: (userId: string, data: Partial<BusinessProfile>) => Promise<BusinessProfile | null>;
  updateBusinessProfile: (userId: string, data: Partial<BusinessProfile>) => Promise<void>;
  
  fetchCampaigns: (businessId: string) => Promise<void>;
  createCampaign: (businessId: string, data: Partial<AdCampaign>) => Promise<AdCampaign | null>;
  updateCampaignStatus: (campaignId: string, status: AdCampaign['status']) => Promise<void>;

  createAdvertisement: (campaignId: string, businessId: string, data: Partial<Advertisement>) => Promise<Advertisement | null>;
  
  fetchCollaborations: (businessId: string, asCreator?: boolean) => Promise<void>;
  createCollaboration: (businessId: string, creatorId: string, data: Partial<BrandCollaboration>) => Promise<BrandCollaboration | null>;
  updateCollaborationStatus: (collabId: string, status: BrandCollaboration['status']) => Promise<void>;

  fetchAllBusinessProfiles: () => Promise<void>; // Admin
  approveBusinessProfile: (userId: string) => Promise<void>; // Admin
}

const getLocalItem = <T>(key: string, defaultVal: T): T => {
  const d = localStorage.getItem(key);
  return d ? JSON.parse(d) : defaultVal;
};

const setLocalItem = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export const useBusinessStore = create<BusinessState>((set, get) => ({
  profile: null,
  campaigns: [],
  advertisements: [],
  campaignAnalytics: [],
  businessAnalytics: [],
  collaborations: [],
  allProfiles: [],
  useLocalFallback: false,
  isLoading: false,
  error: null,

  fetchBusinessProfile: async (userId) => {
    set({ isLoading: true });
    
    if (get().useLocalFallback) {
      const all: BusinessProfile[] = getLocalItem('omnix_business_profiles', []);
      const profile = all.find(p => p.id === userId) || null;
      
      const bs_analytics = profile ? getLocalItem<BusinessAnalytics[]>('omnix_business_analytics', []).filter(a => a.business_id === userId) : [];
      
      set({ profile, businessAnalytics: bs_analytics, isLoading: false });
      return;
    }

    try {
      const { data, error } = await supabase.from('business_profiles').select('*').eq('id', userId).single();
      if (error && error.code !== 'PGRST116') throw error; // Not found is okay

      if (data) {
        const { data: analyticsData } = await supabase.from('business_analytics').select('*').eq('business_id', userId);
        set({ profile: data, businessAnalytics: analyticsData || [], isLoading: false });
      } else {
        set({ profile: null, businessAnalytics: [], isLoading: false });
      }
    } catch (e: any) {
      console.warn('DB error for business profile, falling back:', e.message);
      set({ useLocalFallback: true, isLoading: false });
      await get().fetchBusinessProfile(userId);
    }
  },

  createBusinessProfile: async (userId, data) => {
    set({ isLoading: true });
    const newProfile: BusinessProfile = {
      id: userId,
      business_name: data.business_name || '',
      category: data.category || '',
      website: data.website || '',
      email: data.email || '',
      phone_number: data.phone_number || '',
      address: data.address || '',
      business_hours: data.business_hours || {},
      is_verified: false,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const all: BusinessProfile[] = getLocalItem('omnix_business_profiles', []);
      all.push(newProfile);
      setLocalItem('omnix_business_profiles', all);
      
      // Mock some initial analytics
      const analytics: BusinessAnalytics = {
        id: 'ba_' + Math.random().toString(36).substring(2,10),
        business_id: userId,
        date: new Date().toISOString().split('T')[0],
        profile_visits: 12,
        website_clicks: 0,
        calls: 0,
        messages: 0,
        sales_leads: 0,
        revenue: 0
      };
      const allAnalytics = getLocalItem('omnix_business_analytics', []);
      allAnalytics.push(analytics);
      setLocalItem('omnix_business_analytics', allAnalytics);

      set({ profile: newProfile, businessAnalytics: [analytics], isLoading: false });
      return newProfile;
    }

    try {
      const { data: result, error } = await supabase.from('business_profiles').insert(newProfile).select().single();
      if (error) throw error;
      set({ profile: result, isLoading: false });
      return result;
    } catch (e: any) {
      console.warn('DB error, using fallback:', e.message);
      set({ useLocalFallback: true, isLoading: false });
      return await get().createBusinessProfile(userId, data);
    }
  },

  updateBusinessProfile: async (userId, data) => {
    const updated = { ...get().profile, ...data, updated_at: new Date().toISOString() } as BusinessProfile;
    
    if (get().useLocalFallback) {
      const all: BusinessProfile[] = getLocalItem('omnix_business_profiles', []);
      const newList = all.map(p => p.id === userId ? updated : p);
      setLocalItem('omnix_business_profiles', newList);
      set({ profile: updated });
      return;
    }

    try {
      await supabase.from('business_profiles').update({ ...data, updated_at: new Date().toISOString() }).eq('id', userId);
      set({ profile: updated });
    } catch (e) {
      const all: BusinessProfile[] = getLocalItem('omnix_business_profiles', []);
      const newList = all.map(p => p.id === userId ? updated : p);
      setLocalItem('omnix_business_profiles', newList);
      set({ profile: updated });
    }
  },

  fetchCampaigns: async (businessId) => {
    set({ isLoading: true });
    
    if (get().useLocalFallback) {
      const camps = getLocalItem<AdCampaign[]>('omnix_ad_campaigns', []).filter(c => c.business_id === businessId);
      const ads = getLocalItem<Advertisement[]>('omnix_advertisements', []).filter(a => a.business_id === businessId);
      const analytics = getLocalItem<CampaignAnalytics[]>('omnix_campaign_analytics', []);
      
      const filteredAnalytics = analytics.filter(a => camps.some(c => c.id === a.campaign_id));
      set({ campaigns: camps, advertisements: ads, campaignAnalytics: filteredAnalytics, isLoading: false });
      return;
    }

    try {
      const { data: cData } = await supabase.from('ad_campaigns').select('*').eq('business_id', businessId);
      const { data: aData } = await supabase.from('advertisements').select('*').eq('business_id', businessId);
      
      let filteredAnalytics: CampaignAnalytics[] = [];
      if (cData && cData.length > 0) {
        const campaignIds = cData.map(c => c.id);
        const { data: anData } = await supabase.from('campaign_analytics').select('*').in('campaign_id', campaignIds);
        filteredAnalytics = anData || [];
      }

      set({ campaigns: cData || [], advertisements: aData || [], campaignAnalytics: filteredAnalytics, isLoading: false });
    } catch (e: any) {
      set({ useLocalFallback: true, isLoading: false });
      await get().fetchCampaigns(businessId);
    }
  },

  createCampaign: async (businessId, data) => {
    const newCamp: AdCampaign = {
      id: 'camp_' + Math.random().toString(36).substring(2,10),
      business_id: businessId,
      name: data.name || 'New Campaign',
      budget: data.budget || 0,
      spent: 0,
      start_date: data.start_date || new Date().toISOString(),
      end_date: data.end_date || new Date().toISOString(),
      target_audience: data.target_audience || {},
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const camps = getLocalItem<AdCampaign[]>('omnix_ad_campaigns', []);
      camps.unshift(newCamp);
      setLocalItem('omnix_ad_campaigns', camps);
      
      // Initial analytics
      const an: CampaignAnalytics = {
        id: 'can_' + Math.random().toString(36).substring(2,10),
        campaign_id: newCamp.id,
        ad_id: '',
        date: new Date().toISOString().split('T')[0],
        reach: 0, impressions: 0, clicks: 0, conversions: 0, cost: 0
      };
      const anList = getLocalItem<CampaignAnalytics[]>('omnix_campaign_analytics', []);
      anList.push(an);
      setLocalItem('omnix_campaign_analytics', anList);

      set(state => ({ campaigns: [newCamp, ...state.campaigns], campaignAnalytics: [...state.campaignAnalytics, an] }));
      return newCamp;
    }

    try {
      const { data: res, error } = await supabase.from('ad_campaigns').insert({
        ...newCamp, id: crypto.randomUUID()
      }).select().single();
      if (error) throw error;
      set(state => ({ campaigns: [res, ...state.campaigns] }));
      return res;
    } catch (e) {
      set({ useLocalFallback: true });
      return await get().createCampaign(businessId, data);
    }
  },

  updateCampaignStatus: async (campaignId, status) => {
    set(state => ({
      campaigns: state.campaigns.map(c => c.id === campaignId ? { ...c, status } : c)
    }));

    if (get().useLocalFallback) {
      const camps = getLocalItem<AdCampaign[]>('omnix_ad_campaigns', []).map(c => c.id === campaignId ? { ...c, status } : c);
      setLocalItem('omnix_ad_campaigns', camps);
      return;
    }

    try {
      await supabase.from('ad_campaigns').update({ status }).eq('id', campaignId);
    } catch (e) {}
  },

  createAdvertisement: async (campaignId, businessId, data) => {
    const newAd: Advertisement = {
      id: 'ad_' + Math.random().toString(36).substring(2,10),
      campaign_id: campaignId,
      business_id: businessId,
      type: data.type || 'post',
      title: data.title || 'New Ad',
      content_id: data.content_id,
      media_url: data.media_url,
      call_to_action: data.call_to_action,
      destination_url: data.destination_url,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (get().useLocalFallback) {
      const ads = getLocalItem<Advertisement[]>('omnix_advertisements', []);
      ads.unshift(newAd);
      setLocalItem('omnix_advertisements', ads);
      set(state => ({ advertisements: [newAd, ...state.advertisements] }));
      return newAd;
    }

    try {
      const { data: res, error } = await supabase.from('advertisements').insert({
        ...newAd, id: crypto.randomUUID()
      }).select().single();
      if (error) throw error;
      set(state => ({ advertisements: [res, ...state.advertisements] }));
      return res;
    } catch (e) {
      set({ useLocalFallback: true });
      return await get().createAdvertisement(campaignId, businessId, data);
    }
  },

  fetchCollaborations: async (businessId, asCreator = false) => {
    set({ isLoading: true });

    if (get().useLocalFallback) {
      const allCollabs = getLocalItem<BrandCollaboration[]>('omnix_brand_collaborations', []);
      const filtered = asCreator 
        ? allCollabs.filter(c => c.creator_id === businessId)
        : allCollabs.filter(c => c.business_id === businessId);
      
      set({ collaborations: filtered, isLoading: false });
      return;
    }

    try {
      const column = asCreator ? 'creator_id' : 'business_id';
      const { data } = await supabase.from('brand_collaborations').select('*').eq(column, businessId);
      set({ collaborations: data || [], isLoading: false });
    } catch (e) {
      set({ useLocalFallback: true, isLoading: false });
      await get().fetchCollaborations(businessId, asCreator);
    }
  },

  createCollaboration: async (businessId, creatorId, data) => {
    const newCollab: BrandCollaboration = {
      id: 'collab_' + Math.random().toString(36).substring(2,10),
      business_id: businessId,
      creator_id: creatorId,
      title: data.title || 'Collaboration Request',
      description: data.description || '',
      budget: data.budget || 0,
      deliverables: data.deliverables || {},
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      creator_name: data.creator_name,
      business_name: data.business_name
    };

    if (get().useLocalFallback) {
      const all = getLocalItem<BrandCollaboration[]>('omnix_brand_collaborations', []);
      all.unshift(newCollab);
      setLocalItem('omnix_brand_collaborations', all);
      set(state => ({ collaborations: [newCollab, ...state.collaborations] }));
      return newCollab;
    }

    try {
      const { data: res, error } = await supabase.from('brand_collaborations').insert({
        ...newCollab, id: crypto.randomUUID()
      }).select().single();
      if (error) throw error;
      set(state => ({ collaborations: [res, ...state.collaborations] }));
      return res;
    } catch (e) {
      set({ useLocalFallback: true });
      return await get().createCollaboration(businessId, creatorId, data);
    }
  },

  updateCollaborationStatus: async (collabId, status) => {
    set(state => ({
      collaborations: state.collaborations.map(c => c.id === collabId ? { ...c, status } : c)
    }));

    if (get().useLocalFallback) {
      const all = getLocalItem<BrandCollaboration[]>('omnix_brand_collaborations', []).map(c => c.id === collabId ? { ...c, status } : c);
      setLocalItem('omnix_brand_collaborations', all);
      return;
    }

    try {
      await supabase.from('brand_collaborations').update({ status }).eq('id', collabId);
    } catch (e) {}
  },

  fetchAllBusinessProfiles: async () => {
    if (get().useLocalFallback) {
      set({ allProfiles: getLocalItem('omnix_business_profiles', []) });
      return;
    }

    try {
      const { data } = await supabase.from('business_profiles').select('*');
      set({ allProfiles: data || [] });
    } catch (e) {
      set({ useLocalFallback: true });
      await get().fetchAllBusinessProfiles();
    }
  },

  approveBusinessProfile: async (userId) => {
    set(state => ({
      allProfiles: state.allProfiles.map(p => p.id === userId ? { ...p, status: 'approved', is_verified: true } : p),
      profile: state.profile?.id === userId ? { ...state.profile, status: 'approved', is_verified: true } : state.profile
    }));

    if (get().useLocalFallback) {
      const all = getLocalItem<BusinessProfile[]>('omnix_business_profiles', []).map(p => p.id === userId ? { ...p, status: 'approved', is_verified: true } : p);
      setLocalItem('omnix_business_profiles', all);
      return;
    }

    try {
      await supabase.from('business_profiles').update({ status: 'approved', is_verified: true }).eq('id', userId);
    } catch (e) {}
  }
}));

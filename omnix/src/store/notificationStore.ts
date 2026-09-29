import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  category: 'account' | 'engagement' | 'messages' | 'communities' | 'rewards' | 'system';
  title: string;
  is_read: boolean;
  created_at: string;
  actor?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  } | null;
  metadata?: {
    post_id?: string;
    comment_id?: string;
    message_id?: string;
    community_id?: string;
    story_id?: string;
    request_id?: string;
    text?: string;
    badge_type?: string;
    reward_amount?: number;
    action_completed?: boolean;
    action_type?: 'approved' | 'declined' | 'joined' | 'none';
  } | null;
}

export interface NotificationPreference {
  account_activities: boolean;
  content_engagements: boolean;
  messages: boolean;
  communities_events: boolean;
  rewards_milestones: boolean;
  system_notifications: boolean;
}

export interface NotificationLog {
  id: string;
  type: string;
  title: string;
  message: string;
  delivery_channel: string;
  status: string;
  created_at: string;
}

interface NotificationState {
  notifications: Notification[];
  preferences: NotificationPreference;
  pushTokens: string[];
  logs: NotificationLog[];
  unreadCount: number;
  loading: boolean;
  activeFilter: string;
  activeRealtimeChannel: any | null;
  activeToasts: Array<{ id: string; notification: Notification }>;
  
  // Actions
  fetchNotifications: (userId: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  subscribeToRealtime: (userId: string) => void;
  unsubscribeFromRealtime: () => void;
  
  // Preference Actions
  fetchPreferences: (userId: string) => Promise<void>;
  updatePreference: (userId: string, category: keyof NotificationPreference, value: boolean) => Promise<void>;
  
  // Push Actions
  registerPushToken: (userId: string, token: string, deviceType: string) => Promise<void>;
  
  // Log Actions
  fetchLogs: (userId: string) => Promise<void>;
  addLog: (userId: string, log: Omit<NotificationLog, 'id' | 'created_at'>) => Promise<void>;
  clearLogs: () => void;
  
  // Simulation / Interactive Actions
  simulateNotification: (userId: string, type: string, customText?: string) => Promise<void>;
  handleNotificationAction: (notificationId: string, action: 'accept' | 'decline' | 'reply' | 'join') => Promise<void>;
  removeToast: (toastId: string) => void;
  setFilter: (filter: string) => void;
}

const DEFAULT_PREFERENCES: NotificationPreference = {
  account_activities: true,
  content_engagements: true,
  messages: true,
  communities_events: true,
  rewards_milestones: true,
  system_notifications: true
};

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  preferences: DEFAULT_PREFERENCES,
  pushTokens: [],
  logs: [],
  unreadCount: 0,
  loading: false,
  activeFilter: 'all',
  activeRealtimeChannel: null,
  activeToasts: [],

  setFilter: (activeFilter) => set({ activeFilter }),

  fetchNotifications: async (userId) => {
    if (!userId) return;
    set({ loading: true });
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formatted = (data || []).map((n: any) => {
        // Safe parsings
        let actor = null;
        let metadata = null;
        try {
          actor = typeof n.actor === 'string' ? JSON.parse(n.actor) : n.actor;
        } catch { actor = n.actor; }
        try {
          metadata = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
        } catch { metadata = n.metadata; }

        return {
          id: n.id,
          user_id: n.user_id,
          type: n.type,
          category: n.category || getCategoryFromType(n.type),
          title: n.title,
          is_read: n.is_read || false,
          created_at: n.created_at,
          actor: actor,
          metadata: metadata
        };
      });

      const unread = formatted.filter(n => !n.is_read).length;
      set({ notifications: formatted, unreadCount: unread, loading: false });
    } catch (err) {
      console.warn("Could not fetch notifications from Supabase, using localStorage:", err);
      // Fallback
      const local = localStorage.getItem(`omnix_notifications_${userId}`);
      if (local) {
        const parsed = JSON.parse(local);
        const unread = parsed.filter((n: any) => !n.is_read).length;
        set({ notifications: parsed, unreadCount: unread, loading: false });
      } else {
        set({ notifications: [], unreadCount: 0, loading: false });
      }
    }
  },

  markAllAsRead: async (userId) => {
    if (!userId) return;
    try {
      // Optimistic Update
      const updated = get().notifications.map(n => ({ ...n, is_read: true }));
      set({ notifications: updated, unreadCount: 0 });

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) throw error;
      localStorage.setItem(`omnix_notifications_${userId}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Offline markAllAsRead:", err);
      const updated = get().notifications.map(n => ({ ...n, is_read: true }));
      localStorage.setItem(`omnix_notifications_${userId}`, JSON.stringify(updated));
      set({ notifications: updated, unreadCount: 0 });
    }
  },

  markAsRead: async (notificationId) => {
    const notifications = get().notifications;
    const item = notifications.find(n => n.id === notificationId);
    if (!item || item.is_read) return;

    try {
      const updated = notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      set({ notifications: updated, unreadCount: Math.max(0, get().unreadCount - 1) });

      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      localStorage.setItem(`omnix_notifications_${item.user_id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Offline markAsRead:", err);
      const updated = notifications.map(n => n.id === notificationId ? { ...n, is_read: true } : n);
      localStorage.setItem(`omnix_notifications_${item.user_id}`, JSON.stringify(updated));
      set({ notifications: updated, unreadCount: Math.max(0, get().unreadCount - 1) });
    }
  },

  deleteNotification: async (notificationId) => {
    const notifications = get().notifications;
    const item = notifications.find(n => n.id === notificationId);
    if (!item) return;

    try {
      const updated = notifications.filter(n => n.id !== notificationId);
      const wasUnread = !item.is_read;
      set({ 
        notifications: updated, 
        unreadCount: wasUnread ? Math.max(0, get().unreadCount - 1) : get().unreadCount 
      });

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
      localStorage.setItem(`omnix_notifications_${item.user_id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("Offline deleteNotification:", err);
      const updated = notifications.filter(n => n.id !== notificationId);
      localStorage.setItem(`omnix_notifications_${item.user_id}`, JSON.stringify(updated));
      set({ 
        notifications: updated, 
        unreadCount: !item.is_read ? Math.max(0, get().unreadCount - 1) : get().unreadCount 
      });
    }
  },

  subscribeToRealtime: (userId) => {
    if (!userId) return;
    get().unsubscribeFromRealtime();

    try {
      const channel = supabase
        .channel(`public:notifications:user_id=eq.${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload: any) => {
            const newN = payload.new;
            let actor = null;
            let metadata = null;
            try { actor = typeof newN.actor === 'string' ? JSON.parse(newN.actor) : newN.actor; } catch { actor = newN.actor; }
            try { metadata = typeof newN.metadata === 'string' ? JSON.parse(newN.metadata) : newN.metadata; } catch { metadata = newN.metadata; }

            const notification: Notification = {
              id: newN.id,
              user_id: newN.user_id,
              type: newN.type,
              category: newN.category || getCategoryFromType(newN.type),
              title: newN.title,
              is_read: newN.is_read || false,
              created_at: newN.created_at || new Date().toISOString(),
              actor,
              metadata
            };

            // Check if user allows this category in preferences
            const categoryEnabled = getCategoryPreference(get().preferences, notification.category);
            if (!categoryEnabled) return;

            // Prepend new notification
            const existing = get().notifications;
            if (existing.some(n => n.id === notification.id)) return; // ID check for idempotency

            const updated = [notification, ...existing];
            set({ 
              notifications: updated, 
              unreadCount: get().unreadCount + 1,
              activeToasts: [...get().activeToasts, { id: notification.id, notification }]
            });

            // Sync with local fallback
            localStorage.setItem(`omnix_notifications_${userId}`, JSON.stringify(updated));
          }
        )
        .subscribe();

      set({ activeRealtimeChannel: channel });
    } catch (err) {
      console.error("Realtime subscription failed:", err);
    }
  },

  unsubscribeFromRealtime: () => {
    const channel = get().activeRealtimeChannel;
    if (channel) {
      try {
        supabase.removeChannel(channel);
      } catch (err) {
        console.error("Unsubscribe error:", err);
      }
      set({ activeRealtimeChannel: null });
    }
  },

  fetchPreferences: async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        set({ preferences: {
          account_activities: data.account_activities ?? true,
          content_engagements: data.content_engagements ?? true,
          messages: data.messages ?? true,
          communities_events: data.communities_events ?? true,
          rewards_milestones: data.rewards_milestones ?? true,
          system_notifications: data.system_notifications ?? true
        }});
      } else {
        // Create default row in background
        const defaultPrefs = {
          user_id: userId,
          account_activities: true,
          content_engagements: true,
          messages: true,
          communities_events: true,
          rewards_milestones: true,
          system_notifications: true
        };
        await supabase.from('notification_preferences').insert([defaultPrefs]);
        set({ preferences: DEFAULT_PREFERENCES });
      }
    } catch (err) {
      console.warn("Could not fetch notification preferences, using local cache:", err);
      const local = localStorage.getItem(`omnix_notification_preferences_${userId}`);
      if (local) {
        set({ preferences: JSON.parse(local) });
      } else {
        set({ preferences: DEFAULT_PREFERENCES });
      }
    }
  },

  updatePreference: async (userId, category, value) => {
    if (!userId) return;
    const updated = { ...get().preferences, [category]: value };
    set({ preferences: updated });
    localStorage.setItem(`omnix_notification_preferences_${userId}`, JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('notification_preferences')
        .upsert({
          user_id: userId,
          [category]: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (err) {
      console.warn("Offline preferences update:", err);
    }
  },

  registerPushToken: async (userId, token, deviceType) => {
    if (!userId || !token) return;
    const tokens = Array.from(new Set([...get().pushTokens, token]));
    set({ pushTokens: tokens });
    localStorage.setItem(`omnix_push_tokens_${userId}`, JSON.stringify(tokens));

    try {
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: userId,
          token,
          device_type: deviceType,
          created_at: new Date().toISOString()
        }, { onConflict: 'token' });

      if (error) throw error;
    } catch (err) {
      console.warn("Offline push token registration:", err);
    }
  },

  fetchLogs: async (userId) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      set({ logs: data || [] });
    } catch (err) {
      console.warn("Could not fetch logs, using local cache:", err);
      const local = localStorage.getItem(`omnix_notification_logs_${userId}`);
      set({ logs: local ? JSON.parse(local) : [] });
    }
  },

  addLog: async (userId, logData) => {
    if (!userId) return;
    const newLog: NotificationLog = {
      id: Date.now().toString() + '_' + Math.random().toString().slice(-4),
      type: logData.type,
      title: logData.title,
      message: logData.message,
      delivery_channel: logData.delivery_channel,
      status: logData.status,
      created_at: new Date().toISOString()
    };

    const updated = [newLog, ...get().logs];
    set({ logs: updated });
    localStorage.setItem(`omnix_notification_logs_${userId}`, JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('notification_logs')
        .insert([{
          user_id: userId,
          type: logData.type,
          title: logData.title,
          message: logData.message,
          delivery_channel: logData.delivery_channel,
          status: logData.status
        }]);

      if (error) throw error;
    } catch (err) {
      console.warn("Offline log insert:", err);
    }
  },

  clearLogs: () => {
    set({ logs: [] });
    const user = supabase.auth.getUser().then(({ data }) => {
      if (data?.user?.id) {
        localStorage.removeItem(`omnix_notification_logs_${data.user.id}`);
        supabase.from('notification_logs').delete().eq('user_id', data.user.id).then();
      }
    });
  },

  removeToast: (toastId) => {
    set({ activeToasts: get().activeToasts.filter(t => t.id !== toastId) });
  },

  handleNotificationAction: async (notificationId, action) => {
    const notifications = get().notifications;
    const item = notifications.find(n => n.id === notificationId);
    if (!item) return;

    let updatedMetadata = { ...(item.metadata || {}), action_completed: true };
    if (action === 'accept') updatedMetadata.action_type = 'approved';
    else if (action === 'decline') updatedMetadata.action_type = 'declined';
    else if (action === 'join') updatedMetadata.action_type = 'joined';

    const textFeedback = action === 'accept' ? 'Request Accepted' : action === 'decline' ? 'Request Declined' : action === 'join' ? 'Joined Community' : 'Replied';
    
    // Modify item and save
    const updated = notifications.map(n => 
      n.id === notificationId 
        ? { ...n, is_read: true, title: `${n.title} (${textFeedback})`, metadata: updatedMetadata } 
        : n
    );
    set({ notifications: updated, unreadCount: Math.max(0, get().unreadCount - (item.is_read ? 0 : 1)) });
    localStorage.setItem(`omnix_notifications_${item.user_id}`, JSON.stringify(updated));

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          title: `${item.title} (${textFeedback})`, 
          metadata: updatedMetadata 
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Add audit log
      get().addLog(item.user_id, {
        type: 'action_completed',
        title: `Action: ${action}`,
        message: `Notification action performed: ${action} for notification ${notificationId}`,
        delivery_channel: 'in_app',
        status: 'completed'
      });
    } catch (err) {
      console.warn("Offline action update:", err);
    }
  },

  simulateNotification: async (userId, type, customText) => {
    if (!userId) return;

    // Standard list of trigger mock actors
    const mockActors = [
      { username: 'sophias', display_name: 'Sophia Lee', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150' },
      { username: 'james_c', display_name: 'James Carter', avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
      { username: 'liamp', display_name: 'Liam Patel', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
      { username: 'olivia_g', display_name: 'Olivia Garcia', avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
      { username: 'noah_s', display_name: 'Noah Smith', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
      { username: 'ava_j', display_name: 'Ava Johnson', avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150' },
      { username: 'will_brown', display_name: 'William Brown', avatar_url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
      { username: 'isabella_d', display_name: 'Isabella Davis', avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150' },
      { username: 'lucasm', display_name: 'Lucas Miller', avatar_url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150' },
      { username: 'mia_w', display_name: 'Mia Wilson', avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
      { username: 'ethan_t', display_name: 'Ethan Taylor', avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150' },
      { username: 'emma_w', display_name: 'Emma Wilson', avatar_url: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=150' }
    ];

    const actor = mockActors[Math.floor(Math.random() * mockActors.length)];
    const category = getCategoryFromType(type);
    
    // Generate text based on notification type
    let title = '';
    let metadata: any = {};

    switch (type) {
      case 'follow':
        title = `${actor.display_name} started following you`;
        break;
      case 'follow_request':
        title = `${actor.display_name} requested to follow you`;
        metadata = { request_id: 'req_' + Math.random().toString().slice(-4), action_completed: false };
        break;
      case 'like':
        title = `${actor.display_name} liked your post`;
        metadata = { post_id: 'post_1' };
        break;
      case 'comment':
        title = `${actor.display_name} commented: "${customText || 'Outstanding shot!'}"`;
        metadata = { post_id: 'post_1', text: customText || 'Outstanding shot!' };
        break;
      case 'comment_reply':
        title = `${actor.display_name} replied to your comment: "${customText || 'Thanks for the support!'}"`;
        metadata = { post_id: 'post_1', text: customText || 'Thanks for the support!' };
        break;
      case 'mention':
        title = `${actor.display_name} mentioned you in a comment: "${customText || '@user check this out!'}"`;
        metadata = { post_id: 'post_1', text: customText || '@user check this out!' };
        break;
      case 'tag':
        title = `${actor.display_name} tagged you in a post`;
        metadata = { post_id: 'post_2' };
        break;
      case 'story_view':
        title = `${actor.display_name} viewed your story`;
        metadata = { story_id: 'story_1' };
        break;
      case 'story_reply':
        title = `${actor.display_name} replied to your story: "${customText || 'This looks amazing!'}"`;
        metadata = { story_id: 'story_1', text: customText || 'This looks amazing!' };
        break;
      case 'story_reaction':
        title = `${actor.display_name} reacted with ❤️ to your story`;
        metadata = { story_id: 'story_1' };
        break;
      case 'story_mention':
        title = `${actor.display_name} mentioned you in their story`;
        metadata = { story_id: 'story_2' };
        break;
      case 'post_share':
        title = `${actor.display_name} shared your post`;
        metadata = { post_id: 'post_1' };
        break;
      case 'save':
        title = `${actor.display_name} saved your post`;
        metadata = { post_id: 'post_1' };
        break;
      case 'clip_like':
        title = `${actor.display_name} liked your OmniClip`;
        metadata = { post_id: 'clip_1' };
        break;
      case 'clip_comment':
        title = `${actor.display_name} commented on your OmniClip: "${customText || 'Incredible video loop!'}"`;
        metadata = { post_id: 'clip_1', text: customText || 'Incredible video loop!' };
        break;
      case 'clip_share':
        title = `${actor.display_name} shared your OmniClip`;
        metadata = { post_id: 'clip_1' };
        break;
      case 'message':
        title = `${actor.display_name} sent you a message: "${customText || 'Hey! Let\'s hook up for the stream.'}"`;
        metadata = { message_id: 'msg_1', text: customText || 'Hey! Let\'s hook up for the stream.' };
        break;
      case 'message_request':
        title = `${actor.display_name} sent you a message request`;
        metadata = { request_id: 'msg_req_1', text: customText || 'I have a sponsorship offer for you.', action_completed: false };
        break;
      case 'community':
        title = `Created a new community 'Tech Innovators'`;
        metadata = { community_id: 'comm_1' };
        break;
      case 'community_invitation':
        title = `${actor.display_name} invited you to join 'Pixel Art Guild'`;
        metadata = { community_id: 'comm_2', action_completed: false };
        break;
      case 'community_announcement':
        title = `'Tech Innovators' posted an announcement: "${customText || 'Weekly live stream starts in 30 minutes!'}"`;
        metadata = { community_id: 'comm_1', text: customText || 'Weekly live stream starts in 30 minutes!' };
        break;
      case 'event':
        title = `'Pixel Art Guild' scheduled a new event 'Golden Hour Speed Run'`;
        metadata = { community_id: 'comm_2' };
        break;
      case 'poll_results':
        title = `The poll 'Favorite Video Editor' has closed. Result: CapCut won!`;
        break;
      case 'reward_claim':
        title = `Successfully claimed 100 bonus Creator Coins`;
        metadata = { reward_amount: 100 };
        break;
      case 'daily_reward':
        title = `Claimed Day 3 Daily Reward of 250 Creator Coins!`;
        metadata = { reward_amount: 250 };
        break;
      case 'mission_completion':
        title = `Mission 'Comment on 3 clips' completed! Earned 500 XP`;
        break;
      case 'coin_earnings':
        title = `Earned 50 coins from ${actor.display_name}'s super-like`;
        metadata = { reward_amount: 50 };
        break;
      case 'purchase':
        title = `Purchased 'Neon Purple Profile Frame' for 2500 Creator Coins`;
        break;
      case 'verification':
        title = `Your account verification has been approved! Pro Blue Badge equipped.`;
        metadata = { badge_type: 'blue' };
        break;
      case 'creator_milestone':
        title = `Milestone Reached: 10,000 views! Unlocked Creator Level 2.`;
        break;
      default:
        title = customText || `New notification of type ${type}`;
    }

    const payload = {
      id: genUuid(),
      user_id: userId,
      type,
      category,
      title,
      is_read: false,
      created_at: new Date().toISOString(),
      actor,
      metadata
    };

    // 1. Direct Insertion to database
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert([{
          id: payload.id,
          user_id: payload.user_id,
          type: payload.type,
          category: payload.category,
          title: payload.title,
          is_read: payload.is_read,
          created_at: payload.created_at,
          actor: payload.actor,
          metadata: payload.metadata
        }]);
      
      // If there's an active realtime channel, it will catch this and display a toast.
      // But let's also optimistically add it locally in case realtime delay or if offline.
      if (error) throw error;
    } catch (err) {
      console.warn("Offline/Fail to insert notification row in Supabase, using local triggers:", err);
      // Simulating the trigger locally
      const existing = get().notifications;
      const updated = [payload, ...existing];
      set({ 
        notifications: updated, 
        unreadCount: get().unreadCount + 1,
        activeToasts: [...get().activeToasts, { id: payload.id, notification: payload }]
      });
      localStorage.setItem(`omnix_notifications_${userId}`, JSON.stringify(updated));
    }

    // 2. Insert to Notification Logs (Audit Trail)
    get().addLog(userId, {
      type,
      title,
      message: `Dispatched system event ${type} to user ${userId}`,
      delivery_channel: 'in_app, push',
      status: 'delivered'
    });
  }
}));

// Helpers
function genUuid() {
  return 'notif_' + Date.now() + '_' + Math.random().toString().slice(-4);
}

function getCategoryPreference(prefs: NotificationPreference, category: string): boolean {
  switch (category) {
    case 'account': return prefs.account_activities;
    case 'engagement': return prefs.content_engagements;
    case 'messages': return prefs.messages;
    case 'communities': return prefs.communities_events;
    case 'rewards': return prefs.rewards_milestones;
    case 'system': return prefs.system_notifications;
    default: return true;
  }
}

export function getCategoryFromType(type: string): 'account' | 'engagement' | 'messages' | 'communities' | 'rewards' | 'system' {
  if (type === 'follow' || type === 'follow_request') return 'account';
  if (['like', 'comment', 'comment_reply', 'mention', 'tag', 'story_view', 'story_reply', 'story_reaction', 'story_mention', 'post_share', 'save', 'clip_like', 'clip_comment', 'clip_share'].includes(type)) return 'engagement';
  if (type === 'message' || type === 'message_request') return 'messages';
  if (['community', 'community_invitation', 'community_announcement', 'event', 'poll_results'].includes(type)) return 'communities';
  if (['reward_claim', 'daily_reward', 'mission_completion', 'coin_earnings', 'purchase'].includes(type)) return 'rewards';
  return 'system';
}

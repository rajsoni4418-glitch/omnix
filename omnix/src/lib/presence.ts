import { supabase } from './supabase';
import { useChatStore } from '../store/chatStore';

export const setupPresence = (userId: string) => {
  const channel = supabase.channel('online-users', {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const onlineUsers: Record<string, boolean> = {};
      Object.keys(state).forEach(key => {
        onlineUsers[key] = true;
      });
      useChatStore.getState().setOnlineUsers(onlineUsers);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
          user_id: userId
        });
      }
    });

  return channel;
};

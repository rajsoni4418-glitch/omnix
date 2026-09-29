import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore, Notification } from '../store/notificationStore';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Bell, 
  Award, 
  Coins, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Users, 
  Smartphone, 
  Sparkles, 
  Shield, 
  Zap, 
  Calendar,
  X
} from 'lucide-react';

export default function GlobalRealtime() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { 
    subscribeToRealtime, 
    unsubscribeFromRealtime, 
    activeToasts, 
    removeToast,
    markAsRead
  } = useNotificationStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    // 1. Existing global database sync
    const channel = supabase.channel(`global-${user.id}-${Date.now()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'posts' }, () => {
        queryClient.invalidateQueries({ queryKey: ['posts'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, () => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      })
      .subscribe();

    // 2. Initialize real-time notification listener
    subscribeToRealtime(user.id);

    return () => {
      supabase.removeChannel(channel);
      unsubscribeFromRealtime();
    };
  }, [queryClient, user, subscribeToRealtime, unsubscribeFromRealtime]);

  const getToastIcon = (type: string) => {
    const iconSize = "w-5 h-5";
    switch (type) {
      case 'like':
      case 'clip_like':
      case 'story_reaction':
        return <Heart className={`${iconSize} text-pink-500 fill-pink-500`} />;
      case 'comment':
      case 'comment_reply':
      case 'clip_comment':
      case 'story_reply':
        return <MessageCircle className={`${iconSize} text-blue-400 fill-blue-500/20`} />;
      case 'follow':
      case 'follow_request':
        return <UserPlus className={`${iconSize} text-purple-400`} />;
      case 'message':
      case 'message_request':
        return <MessageSquare className={`${iconSize} text-green-400`} />;
      case 'community':
      case 'community_invitation':
      case 'community_announcement':
      case 'event':
        return <Users className={`${iconSize} text-indigo-400`} />;
      case 'reward_claim':
      case 'daily_reward':
      case 'coin_earnings':
      case 'purchase':
      case 'mission_completion':
        return <Coins className={`${iconSize} text-yellow-400`} />;
      case 'verification':
        return <CheckCircle2 className={`${iconSize} text-teal-400`} />;
      case 'creator_milestone':
        return <Sparkles className={`${iconSize} text-teal-400`} />;
      default:
        return <Bell className={`${iconSize} text-zinc-400`} />;
    }
  };

  // Toast item auto-dismiss wrapper
  const ToastItem = ({ toastId, notification }: { toastId: string, notification: Notification }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        removeToast(toastId);
      }, 5000);
      return () => clearTimeout(timer);
    }, [toastId]);

    const handleToastClick = () => {
      markAsRead(toastId);
      removeToast(toastId);
      navigate('/notifications');
    };

    const actorAvatar = notification.actor?.avatar_url;
    const actorDisplayName = notification.actor?.display_name || 'System';

    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: 50, y: 10, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        exit={{ opacity: 0, x: 50, scale: 0.9 }}
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
        className="w-full max-w-sm bg-zinc-950/95 backdrop-blur-md border border-purple-500/30 hover:border-purple-500/50 text-white rounded-xl shadow-xl shadow-purple-500/5 p-4 flex gap-3 cursor-pointer relative overflow-hidden group select-none"
        onClick={handleToastClick}
      >
        {/* Glow Line decoration */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 to-indigo-500 opacity-60" />

        {/* Actor Avatar */}
        <div className="relative flex-shrink-0">
          {actorAvatar ? (
            <img 
              src={actorAvatar} 
              alt={actorDisplayName} 
              className="w-10 h-10 rounded-full object-cover border border-zinc-800"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/30 to-indigo-600/30 border border-zinc-800 flex items-center justify-center font-bold text-sm text-purple-300">
              {actorDisplayName.slice(0, 1)}
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-zinc-950 p-1 rounded-full border border-zinc-800">
            {getToastIcon(notification.type)}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 pr-4 min-w-0">
          <p className="text-xs text-zinc-400 font-semibold mb-0.5 tracking-wide">
            {notification.category.toUpperCase()}
          </p>
          <p className="text-sm text-zinc-100 font-medium leading-relaxed truncate group-hover:text-purple-300 transition-colors">
            {notification.title}
          </p>
          <span className="text-[10px] text-zinc-500">
            Just now • Click to inspect
          </span>
        </div>

        {/* Close Button */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            removeToast(toastId);
          }}
          className="absolute top-2 right-2 p-1 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800/40 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 max-w-sm w-full px-4 sm:px-0">
      <AnimatePresence mode="popLayout">
        {activeToasts.map((toast) => (
          <ToastItem key={toast.id} toastId={toast.id} notification={toast.notification} />
        ))}
      </AnimatePresence>
    </div>
  );
}


import React, { useEffect, useState, useRef } from 'react';
import { useAuthStore } from '../store/authStore';
import { useNotificationStore, Notification, getCategoryFromType } from '../store/notificationStore';
import { timeAgo } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Bell, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  UserCheck, 
  Users, 
  Award, 
  Coins, 
  CheckCircle2, 
  TrendingUp, 
  MessageSquare, 
  Smartphone, 
  History, 
  Sparkles, 
  Shield, 
  Zap, 
  Calendar,
  X,
  Settings,
  Trash2,
  Terminal,
  ArrowRight,
  Eye,
  Smile,
  Send,
  MoreHorizontal,
  Loader2,
  Check
} from 'lucide-react';

const SIMULATED_EVENTS = [
  { value: 'follow', label: 'New Follower', category: 'account' },
  { value: 'follow_request', label: 'Follow Request', category: 'account' },
  { value: 'like', label: 'Post Like', category: 'engagement' },
  { value: 'comment', label: 'Post Comment', category: 'engagement' },
  { value: 'comment_reply', label: 'Comment Reply', category: 'engagement' },
  { value: 'mention', label: 'Mention in Comment', category: 'engagement' },
  { value: 'tag', label: 'Tagged in Post', category: 'engagement' },
  { value: 'story_view', label: 'Story View', category: 'engagement' },
  { value: 'story_reply', label: 'Story Reply', category: 'engagement' },
  { value: 'story_reaction', label: 'Story Reaction', category: 'engagement' },
  { value: 'story_mention', label: 'Story Mention', category: 'engagement' },
  { value: 'post_share', label: 'Post Share', category: 'engagement' },
  { value: 'save', label: 'Save Post', category: 'engagement' },
  { value: 'clip_like', label: 'OmniClip Like', category: 'engagement' },
  { value: 'clip_comment', label: 'OmniClip Comment', category: 'engagement' },
  { value: 'clip_share', label: 'OmniClip Share', category: 'engagement' },
  { value: 'message', label: 'Direct Message', category: 'messages' },
  { value: 'message_request', label: 'Message Request', category: 'messages' },
  { value: 'community', label: 'Community Created', category: 'communities' },
  { value: 'community_invitation', label: 'Community Invitation', category: 'communities' },
  { value: 'community_announcement', label: 'Community Announcement', category: 'communities' },
  { value: 'event', label: 'Community Event', category: 'communities' },
  { value: 'poll_results', label: 'Poll Closed', category: 'communities' },
  { value: 'reward_claim', label: 'Claim Bonus Coins', category: 'rewards' },
  { value: 'daily_reward', label: 'Claim Daily Reward', category: 'rewards' },
  { value: 'mission_completion', label: 'Mission Completed', category: 'rewards' },
  { value: 'coin_earnings', label: 'Coin Earnings (Gift)', category: 'rewards' },
  { value: 'purchase', label: 'Shop Purchase', category: 'rewards' },
  { value: 'verification', label: 'Verification Approved', category: 'system' },
  { value: 'creator_milestone', label: 'Creator Milestone Reached', category: 'system' }
];

export default function Notifications() {
  const { user } = useAuthStore();
  const {
    notifications,
    preferences,
    logs,
    unreadCount,
    loading,
    activeFilter,
    setFilter,
    fetchNotifications,
    markAllAsRead,
    markAsRead,
    deleteNotification,
    fetchPreferences,
    updatePreference,
    registerPushToken,
    fetchLogs,
    clearLogs,
    simulateNotification,
    handleNotificationAction
  } = useNotificationStore();

  const [showSimulator, setShowSimulator] = useState(false);
  const [selectedSimEvent, setSelectedSimEvent] = useState('follow');
  const [customSimText, setCustomSimText] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pushStatus, setPushStatus] = useState<'idle' | 'registering' | 'subscribed'>('idle');
  const [generatedToken, setGeneratedToken] = useState('');
  const [replyInputs, setReplyInputs] = useState<{ [key: string]: string }>({});
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications(user.id);
      fetchPreferences(user.id);
      fetchLogs(user.id);
    }
  }, [user, fetchNotifications, fetchPreferences, fetchLogs]);

  // Auto Scroll logs terminal to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Group notifications by date range
  const groupNotificationsByDate = (items: Notification[]) => {
    const grouped: { [key: string]: Notification[] } = {
      'Today': [],
      'Yesterday': [],
      'This Week': [],
      'Older': []
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const oneWeekAgo = new Date(today);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    items.forEach(item => {
      const d = new Date(item.created_at);
      if (d >= today) {
        grouped['Today'].push(item);
      } else if (d >= yesterday) {
        grouped['Yesterday'].push(item);
      } else if (d >= oneWeekAgo) {
        grouped['This Week'].push(item);
      } else {
        grouped['Older'].push(item);
      }
    });

    return grouped;
  };

  // Filter notifications by active subcategory tab
  const filteredNotifications = notifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'mentions') {
      return n.type === 'mention' || n.type === 'story_mention';
    }
    if (activeFilter === 'likes') {
      return n.type === 'like' || n.type === 'clip_like' || n.type === 'story_reaction';
    }
    if (activeFilter === 'comments') {
      return n.type === 'comment' || n.type === 'clip_comment' || n.type === 'comment_reply' || n.type === 'story_reply';
    }
    if (activeFilter === 'followers') {
      return n.type === 'follow' || n.type === 'follow_request';
    }
    if (activeFilter === 'system') {
      return n.category === 'system' || n.category === 'rewards';
    }
    return n.category === activeFilter;
  });

  const grouped = groupNotificationsByDate(filteredNotifications);

  // Map categories/types to Lucide icons
  const getNotificationIcon = (type: string) => {
    const iconSize = "w-4 h-4";
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

  // Run simulation trigger
  const handleTriggerSimulation = async () => {
    if (!user?.id) return;
    setIsSimulating(true);
    try {
      await simulateNotification(user.id, selectedSimEvent, customSimText);
      setCustomSimText('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  // Register push notifications mock
  const handleSubscribePush = async () => {
    if (!user?.id) return;
    setPushStatus('registering');
    setTimeout(async () => {
      const generated = 'push_token_omnix_' + Math.random().toString(36).substring(2, 12);
      await registerPushToken(user.id, generated, 'web');
      setGeneratedToken(generated);
      setPushStatus('subscribed');
    }, 1500);
  };

  // Inline comment reply simulations
  const handleSendInlineReply = async (notificationId: string) => {
    const inputVal = replyInputs[notificationId];
    if (!inputVal || !inputVal.trim() || !user?.id) return;

    // Simulate sending comment reply and archiving
    await handleNotificationAction(notificationId, 'reply');
    setReplyInputs(prev => ({ ...prev, [notificationId]: '' }));
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-zinc-100">
      {/* Upper Navigation Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-purple-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-purple-600 text-[10px] font-bold text-white px-1.5 py-0.5 rounded-full ring-2 ring-zinc-950 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">Notification Center</h1>
              <p className="text-xs text-zinc-500">Manage real-time alerts, preferences, and events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                showSimulator 
                  ? 'bg-purple-600 border-purple-500 text-white' 
                  : 'bg-zinc-900 border-zinc-800 text-purple-400 hover:border-purple-500/50 hover:bg-zinc-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Simulator Admin
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 text-zinc-400 hover:text-white transition-colors rounded-lg border ${
                showSettings ? 'bg-zinc-800 border-zinc-700 text-white' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800/50'
              }`}
              title="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Admin Canvas Drawer */}
      <AnimatePresence>
        {showSimulator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="bg-zinc-950 border-b border-zinc-800 overflow-hidden shadow-inner shadow-purple-500/5"
          >
            <div className="p-5 max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Dispatch Controls */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300">
                    Live Notification Simulation Console
                  </h3>
                </div>
                <p className="text-xs text-zinc-400">
                  Select any of the 30+ requested notification types below to test the real-time Supabase push alerts, floating toast cards, unread increments, and historical logs.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Notification Event</label>
                    <select
                      value={selectedSimEvent}
                      onChange={(e) => setSelectedSimEvent(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-purple-500"
                    >
                      {SIMULATED_EVENTS.map(ev => (
                        <option key={ev.value} value={ev.value}>
                          [{ev.category.toUpperCase()}] {ev.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 mb-1.5">Custom Payload Text (Optional)</label>
                    <input
                      type="text"
                      placeholder="Comment text, message, alert..."
                      value={customSimText}
                      onChange={(e) => setCustomSimText(e.target.value)}
                      className="w-full text-xs bg-zinc-900 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleTriggerSimulation}
                  disabled={isSimulating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-bold text-white rounded-lg shadow-lg hover:shadow-purple-500/20 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Dispatching to DB...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white" />
                      Fire Real-time Notification Alert
                    </>
                  )}
                </button>
              </div>

              {/* Developer Logs & Trace */}
              <div className="bg-zinc-900/40 rounded-xl border border-zinc-800 p-4 flex flex-col h-[180px] overflow-hidden">
                <div className="flex justify-between items-center mb-2 border-b border-zinc-800 pb-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <Terminal className="w-3.5 h-3.5 text-teal-400" />
                    <span>delivery_tracer.log</span>
                  </div>
                  <button 
                    onClick={clearLogs}
                    className="text-[10px] text-zinc-500 hover:text-red-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Audit Logs
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto font-mono text-[10px] space-y-1.5 text-zinc-400 pr-1 select-text">
                  {logs.length === 0 ? (
                    <div className="text-zinc-600 italic flex h-full items-center justify-center">
                      Ready to trace websocket socket payloads and delivery logs...
                    </div>
                  ) : (
                    logs.slice().reverse().map((lg) => (
                      <div key={lg.id} className="border-l-2 border-zinc-700 pl-2 py-0.5">
                        <span className="text-purple-400">[{new Date(lg.created_at).toLocaleTimeString()}]</span>{" "}
                        <span className="text-teal-400 font-semibold">{lg.type.toUpperCase()}</span>{" "}
                        <span className="text-zinc-500 font-medium">{lg.title}</span>
                        <div className="text-zinc-600 text-[9px] mt-0.5 leading-tight">{lg.message}</div>
                      </div>
                    ))
                  )}
                  <div ref={logsEndRef} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Core Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: List Filters & Notification Feed */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Categorized Filter Subsections Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none border-b border-zinc-800/60">
            {[
              { id: 'all', label: 'All', icon: Bell },
              { id: 'account', label: 'Account', icon: UserPlus },
              { id: 'engagement', label: 'Engagement', icon: Heart },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
              { id: 'communities', label: 'Communities', icon: Users },
              { id: 'system', label: 'System', icon: Shield },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-t-lg transition-all ${
                    isActive 
                      ? 'border-b-2 border-purple-500 text-purple-400 bg-purple-500/5' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                  }`}
                >
                  <TabIcon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Quick Stats & Mark Read */}
          <div className="flex justify-between items-center text-xs text-zinc-500">
            <span>Showing {filteredNotifications.length} alerts</span>
            {unreadCount > 0 && (
              <button
                onClick={() => user?.id && markAllAsRead(user.id)}
                className="text-purple-400 hover:text-purple-300 font-medium transition-colors"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications Feed */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
              <p className="text-xs text-zinc-500">Refreshing notification queue...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10">
              <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-zinc-700" />
              </div>
              <p className="font-semibold text-zinc-400">Quiet for now</p>
              <p className="text-xs text-zinc-600 mt-1 max-w-xs text-center">
                There are no {activeFilter !== 'all' ? `"${activeFilter}"` : ''} notifications here. Simulate an event using the console!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.keys(grouped).map((groupName) => {
                const groupItems = grouped[groupName];
                if (groupItems.length === 0) return null;

                return (
                  <div key={groupName} className="space-y-2">
                    {/* Header Group Date */}
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider pl-1">
                      {groupName}
                    </h3>

                    {/* Feed Rows */}
                    <div className="space-y-1">
                      {groupItems.map((notif) => {
                        const isUnread = !notif.is_read;
                        const actorAvatar = notif.actor?.avatar_url;
                        const actorDisplayName = notif.actor?.display_name || 'System';
                        const actorUsername = notif.actor?.username || 'system';

                        return (
                          <motion.div
                            key={notif.id}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-4 rounded-xl border flex gap-4 transition-all hover:bg-zinc-900/40 relative group ${
                              isUnread 
                                ? 'bg-purple-900/5 border-purple-500/20' 
                                : 'bg-zinc-900/10 border-zinc-850'
                            }`}
                          >
                            {/* Unread Highlight Dot */}
                            {isUnread && (
                              <span className="absolute top-4 left-2 w-1.5 h-1.5 rounded-full bg-purple-500" />
                            )}

                            {/* Avatar Display */}
                            <div className="relative flex-shrink-0">
                              {actorAvatar ? (
                                <img
                                  src={actorAvatar}
                                  alt={actorDisplayName}
                                  className="w-10 h-10 rounded-full object-cover border border-zinc-800"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-850 flex items-center justify-center font-bold text-sm text-zinc-400">
                                  {actorDisplayName.slice(0, 1)}
                                </div>
                              )}
                              <div className="absolute -bottom-1.5 -right-1.5 bg-zinc-950 p-1 rounded-full border border-zinc-800">
                                {getNotificationIcon(notif.type)}
                              </div>
                            </div>

                            {/* Center Body & Interactive Items */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-4">
                                <div className="text-sm text-zinc-100 leading-relaxed">
                                  {notif.actor ? (
                                    <span className="font-bold text-white hover:text-purple-400 cursor-pointer transition-colors mr-1">
                                      @{actorUsername}
                                    </span>
                                  ) : null}
                                  <span>{notif.title}</span>
                                </div>
                                <span className="text-[10px] text-zinc-500 flex-shrink-0">
                                  {timeAgo(notif.created_at)}
                                </span>
                              </div>

                              {/* Interactive comments, answers, content previews */}
                              {notif.metadata?.text && (
                                <div className="mt-2 text-xs bg-zinc-900/60 text-zinc-400 rounded-lg p-2.5 border border-zinc-850 italic">
                                  "{notif.metadata.text}"
                                </div>
                              )}

                              {/* Interactive Follow Request Action Buttons */}
                              {notif.type === 'follow_request' && !notif.metadata?.action_completed && (
                                <div className="flex items-center gap-2 mt-3">
                                  <button
                                    onClick={() => handleNotificationAction(notif.id, 'accept')}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-all active:scale-95"
                                  >
                                    Accept Request
                                  </button>
                                  <button
                                    onClick={() => handleNotificationAction(notif.id, 'decline')}
                                    className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg transition-all border border-zinc-750"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}

                              {/* Interactive Community Invitation Action Buttons */}
                              {notif.type === 'community_invitation' && !notif.metadata?.action_completed && (
                                <div className="flex items-center gap-2 mt-3">
                                  <button
                                    onClick={() => handleNotificationAction(notif.id, 'join')}
                                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-all active:scale-95"
                                  >
                                    Join Community
                                  </button>
                                  <button
                                    onClick={() => handleNotificationAction(notif.id, 'decline')}
                                    className="px-3 py-1.5 bg-zinc-850 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 rounded-lg transition-all border border-zinc-750"
                                  >
                                    Ignore
                                  </button>
                                </div>
                              )}

                              {/* Interactive Inline comment reply box */}
                              {['comment', 'comment_reply', 'story_reply'].includes(notif.type) && !notif.metadata?.action_completed && (
                                <div className="mt-3 flex gap-2 items-center">
                                  <input
                                    type="text"
                                    placeholder="Simulate a reply back..."
                                    value={replyInputs[notif.id] || ''}
                                    onChange={(e) => {
                                      const textVal = e.target.value;
                                      setReplyInputs(prev => ({ ...prev, [notif.id]: textVal }));
                                    }}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSendInlineReply(notif.id);
                                    }}
                                    className="flex-1 bg-zinc-900 border border-zinc-800 text-xs rounded-lg px-3 py-1.5 text-zinc-200 focus:outline-none focus:border-purple-500"
                                  />
                                  <button
                                    onClick={() => handleSendInlineReply(notif.id)}
                                    className="p-1.5 text-purple-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-lg hover:border-purple-500/40 transition-all"
                                  >
                                    <Send className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}

                              {/* Completed Action indicator */}
                              {notif.metadata?.action_completed && (
                                <div className="flex items-center gap-1.5 text-xs text-purple-400/80 font-semibold mt-2.5">
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Action Completed</span>
                                </div>
                              )}
                            </div>

                            {/* Mark read / Delete Row controls on Hover */}
                            <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 rounded-lg p-1 transition-all shadow-md">
                              {isUnread && (
                                <button
                                  onClick={() => markAsRead(notif.id)}
                                  className="p-1.5 text-zinc-400 hover:text-purple-400 transition-colors"
                                  title="Mark as read"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notif.id)}
                                className="p-1.5 text-zinc-400 hover:text-red-400 transition-colors"
                                title="Delete notification"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Preferences Settings, Push Register, Stats Sidebar */}
        <div className="space-y-6">
          
          {/* Notification Preferences Panels */}
          {(showSettings || true) && (
            <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <Settings className="w-4.5 h-4.5 text-purple-400" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">Preferences</h2>
                </div>
              </div>
              <p className="text-xs text-zinc-500">
                Select which app categories generate real-time push alerts and toast popups.
              </p>

              <div className="space-y-3.5 pt-1">
                {[
                  { key: 'account_activities', label: 'Account Activities', desc: 'New followers, follow requests' },
                  { key: 'content_engagements', label: 'Engagements', desc: 'Likes, comments, clips, saves' },
                  { key: 'messages', label: 'Messages', desc: 'Direct chats, message requests' },
                  { key: 'communities_events', label: 'Communities & Events', desc: 'Invites, announcements, events' },
                  { key: 'rewards_milestones', label: 'Rewards & Milestones', desc: 'Claims, completions, purchases' },
                  { key: 'system_notifications', label: 'System', desc: 'Security, milestones, updates' },
                ].map((pref) => (
                  <div key={pref.key} className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-100">{pref.label}</p>
                      <p className="text-[10px] text-zinc-500 truncate">{pref.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={preferences[pref.key as keyof typeof preferences] ?? true}
                        onChange={(e) => user?.id && updatePreference(user.id, pref.key as any, e.target.checked)}
                      />
                      <div className="w-10 h-5.5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-purple-600" />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Web Push Registration Simulator */}
          <div className="bg-zinc-950 rounded-2xl border border-zinc-800 p-5 space-y-4">
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
              <Smartphone className="w-4.5 h-4.5 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Web Push Setup</h2>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Enable native push notifications to receive background notifications on this device.
            </p>

            {pushStatus === 'idle' && (
              <button
                onClick={handleSubscribePush}
                className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white rounded-lg transition-colors active:scale-[0.98]"
              >
                Subscribe to Push Alerts
              </button>
            )}

            {pushStatus === 'registering' && (
              <div className="flex items-center justify-center py-2 gap-2 text-xs text-zinc-400">
                <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                <span>Contacting service worker...</span>
              </div>
            )}

            {pushStatus === 'subscribed' && (
              <div className="space-y-3">
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] text-teal-400 font-semibold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                      Subscribed (Mock Mode)
                    </span>
                    <span className="text-[9px] text-zinc-500">Device: Chrome (Linux)</span>
                  </div>
                  <p className="font-mono text-[9px] text-zinc-500 truncate mt-1">
                    Token: {generatedToken}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPushStatus('idle');
                    setGeneratedToken('');
                  }}
                  className="w-full py-1.5 bg-zinc-900 border border-zinc-800 hover:border-red-500/30 hover:bg-red-500/5 text-[10px] text-zinc-400 hover:text-red-400 rounded-md transition-all"
                >
                  Unsubscribe Push
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Summary Card */}
          <div className="bg-gradient-to-br from-purple-950/25 to-zinc-950/10 rounded-2xl border border-purple-500/10 p-5 space-y-3">
            <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider">
              Alert Insights
            </h3>
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-850">
                <p className="text-[10px] text-zinc-500">Unread Alert Count</p>
                <p className="text-xl font-black text-purple-400 mt-1">{unreadCount}</p>
              </div>
              <div className="bg-zinc-900/40 rounded-xl p-3 border border-zinc-850">
                <p className="text-[10px] text-zinc-500">Total Logs Registered</p>
                <p className="text-xl font-black text-zinc-300 mt-1">{logs.length}</p>
              </div>
            </div>
            <p className="text-[10px] text-zinc-600 italic leading-relaxed text-center mt-2">
              Sync: Supabase Realtime WebSocket ● Active
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

import OptimizedImage from './performance/OptimizedImage';
import OptimizedVideo from './performance/OptimizedVideo';
import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Link2, Flag, EyeOff, UserX, Trash2, Edit2, Pin, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { timeAgo } from '../lib/utils';
import { Link } from 'react-router-dom';
import { renderMentions } from '../lib/username';
import { motion, AnimatePresence } from 'motion/react';
import CommentsSheet from './engagement/CommentsSheet';
import ShareSheet from './engagement/ShareSheet';
import HeartBurst from './engagement/HeartBurst';
import ImageViewer from './ImageViewer';
import ReportModal from './ReportModal';
import ReactionsRow from './engagement/ReactionsRow';
import SaveSheet from './engagement/SaveSheet';

const PostCard = React.memo(function PostCard({ post, onDelete }: { post: any, key?: React.Key, onDelete?: () => void }) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(post.likes?.some((l: any) => l.user_id === user?.id) || false);
  const [likeCount, setLikeCount] = useState(post.likes?.length || post.likes_count || 0);
  const [commentCount, setCommentCount] = useState(post.comments?.length || post.comments_count || 0);
  const [shareCount, setShareCount] = useState(post.shares_count || 0);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  
  const [viewerMedia, setViewerMedia] = useState<{url: string, type: string} | null>(null);

  const profile = Array.isArray(post.users) ? post.users[0] : post.users;
  const isOwnPost = user?.id === post.user_id;

  let mediaList: string[] = [];
  if (post.media_urls && Array.isArray(post.media_urls) && post.media_urls.length > 0) {
    mediaList = post.media_urls;
  } else if (post.image_url) {
    mediaList = [post.image_url];
  } else if (post.video_url) {
    mediaList = [post.video_url];
  }
  

  const handleLike = async () => {
    if (!user || isLiking) return;
    setIsLiking(true);
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikeCount((prev: number) => wasLiked ? prev - 1 : prev + 1);
    try {
      if (wasLiked) {
        await supabase.from('likes').delete().eq('post_id', post.id).eq('user_id', user.id);
      } else {
        await supabase.from('likes').insert({ post_id: post.id, user_id: user.id });
        if (post.user_id !== user.id) {
          await supabase.from('notifications').insert({ user_id: post.user_id, type: 'like', title: `${user.user_metadata?.username || 'Someone'} liked your post` });
        }
      }
    } catch (error) {
      setIsLiked(wasLiked);
      setLikeCount((prev: number) => wasLiked ? prev + 1 : prev - 1);
      console.error('Error toggling like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  
  const handleSave = async () => {
    if (!user) return;
    const wasSaved = isSaved;
    setIsSaved(!wasSaved);
    try {
      if (wasSaved) {
        await supabase.from('saved_posts').delete().eq('post_id', post.id).eq('user_id', user.id);
      } else {
        await supabase.from('saved_posts').insert({ post_id: post.id, user_id: user.id });
      }
    } catch (err) {
      console.error(err);
      setIsSaved(wasSaved);
    }
  };

  const handleDoubleTap = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLiked) handleLike();
    setShowHeartAnimation(true);
    setTimeout(() => setShowHeartAnimation(false), 1000);
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this post?')) {
      await supabase.from('posts').delete().eq('id', post.id);
      if (onDelete) onDelete();
      setShowMenu(false);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    alert('Link copied to clipboard!');
    setShowMenu(false);
  };

  return (
    <>
      <div className="border-b border-zinc-800 p-4 transition-all hover:bg-zinc-900/30 relative">
        <div className="flex items-center justify-between mb-3">
          <Link to={`/@${profile?.username}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
              {profile?.avatar_url ? (
                <OptimizedImage src={profile.avatar_url} alt={profile.username || 'user'} className="w-full h-full" objectFit="cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800">
                  {profile?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-[15px] text-white hover:underline">{profile?.display_name || profile?.username || 'User'}</h3>
                {post.created_at && (
                  <span className="text-zinc-500 text-xs font-normal">· {timeAgo(post.created_at)}</span>
                )}
              </div>
              <p className="text-zinc-500 text-sm">@{profile?.username}</p>
            </div>
          </Link>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                    className="absolute right-0 top-12 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl z-50 overflow-hidden py-1"
                  >
                    {isOwnPost ? (
                      <>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors">
                          <Edit2 className="w-4 h-4" /> Edit post
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors">
                          <Pin className="w-4 h-4" /> Pin to profile
                        </button>
                        <button onClick={handleDelete} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </>
                    ) : (
                      <>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors">
                          <UserX className="w-4 h-4" /> Unfollow @{profile?.username}
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors">
                          <EyeOff className="w-4 h-4" /> Mute @{profile?.username}
                        </button>
                        <button className="w-full px-4 py-3 flex items-center gap-3 text-sm text-red-500 hover:bg-red-500/10 transition-colors">
                          <Flag className="w-4 h-4" /> Report post
                        </button>
                      </>
                    )}
                    <div className="h-px bg-zinc-800 my-1" />
                    <button onClick={copyLink} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-white hover:bg-zinc-800 transition-colors">
                      <Link2 className="w-4 h-4" /> Copy link
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-zinc-200 mb-3 whitespace-pre-wrap text-[15px] leading-relaxed">
          {renderMentions(post.content || post.caption || '')}
          
          {post.hashtags && Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
            <div className="mt-2 text-purple-400">
              {post.hashtags.map((tag: string, i: number) => (
                <span key={tag + i} className="mr-2 hover:underline cursor-pointer">#{tag.replace('#', '')}</span>
              ))}
            </div>
          )}
          
          
        </div>

        {mediaList.length > 0 && (
          <div 
            className="relative rounded-2xl overflow-hidden mb-3 border border-zinc-800 bg-black group"
          >
            <div 
              className="relative w-full cursor-pointer flex items-center justify-center bg-black min-h-[300px]"
              onDoubleClick={handleDoubleTap}
              onClick={() => {
                const current = mediaList[currentMediaIndex];
                setViewerMedia({ url: current, type: current.includes('.mp4') || current.includes('.webm') ? 'video' : 'image' });
              }}
            >
              {mediaList[currentMediaIndex].includes('.mp4') || mediaList[currentMediaIndex].includes('.webm') ? (
                <OptimizedVideo src={mediaList[currentMediaIndex]} controls playsInline className="w-full h-full max-h-[600px]" />
              ) : (
                <OptimizedImage src={mediaList[currentMediaIndex]} alt="Post media" className="w-full max-h-[600px] select-none pointer-events-none" objectFit="contain" />
              )}
            </div>

            {/* Carousel Controls */}
            {mediaList.length > 1 && (
              <>
                {currentMediaIndex > 0 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(c => c - 1); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">←</div>
                  </button>
                )}
                {currentMediaIndex < mediaList.length - 1 && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setCurrentMediaIndex(c => c + 1); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full backdrop-blur hover:bg-black/80 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <div className="w-4 h-4 flex items-center justify-center">→</div>
                  </button>
                )}
                
                {/* Dots */}
                <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 pointer-events-none">
                  {mediaList.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${i === currentMediaIndex ? 'w-4 bg-purple-500' : 'w-1.5 bg-white/50'}`} />
                  ))}
                </div>
              </>
            )}

            <HeartBurst show={showHeartAnimation} />
          </div>
        )}
        <ReactionsRow post={post} />

        <div className="flex items-center justify-between text-zinc-500 mt-2">
          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              disabled={isLiking}
              className={`flex items-center gap-1.5 group transition-colors ${isLiked ? 'text-red-500' : 'hover:text-red-400'}`}
            >
              <div className={`p-2 -ml-2 rounded-full group-hover:bg-red-500/10 transition-colors ${isLiked ? 'bg-red-500/10' : ''}`}>
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              </div>
              <span className="text-sm font-medium">{likeCount > 0 ? likeCount : ''}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(true)}
              className="flex items-center gap-1.5 group hover:text-blue-400 transition-colors"
            >
              <div className="p-2 -ml-2 rounded-full group-hover:bg-blue-500/10 transition-colors">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{commentCount > 0 ? commentCount : ''}</span>
            </button>
            
            <button onClick={() => setShowShare(true)} className="flex items-center gap-1.5 group hover:text-green-400 transition-colors">
              <div className="p-2 -ml-2 rounded-full group-hover:bg-green-500/10 transition-colors">
                <Share2 className="w-5 h-5" />
              </div>
              <span className="text-sm font-medium">{shareCount > 0 ? shareCount : ''}</span>
            </button>
          </div>
          
          <button 
            onClick={() => setShowSaveSheet(true)}
            className={`flex items-center gap-1.5 group transition-colors ${isSaved ? 'text-yellow-500' : 'hover:text-yellow-400'}`}
          >
            <div className={`p-2 -mr-2 rounded-full group-hover:bg-yellow-500/10 transition-colors ${isSaved ? 'bg-yellow-500/10' : ''}`}>
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </div>
          </button>
        </div>
        
        <div className="text-xs text-zinc-600 mt-2 ml-1">
          {post.views_count ? `${post.views_count} views` : '1 view'}
        </div>
      </div>

      <AnimatePresence>
        {showComments && <CommentsSheet post={post} onClose={() => setShowComments(false)} />}
        {showShare && <ShareSheet post={post} onClose={() => setShowShare(false)} />}
        {showSaveSheet && <SaveSheet post={post} onClose={() => setShowSaveSheet(false)} isCurrentlySaved={isSaved} onSaveToggle={setIsSaved} />}
        
      </AnimatePresence>

      {viewerMedia && viewerMedia.type === 'image' && (
        <ImageViewer 
          src={viewerMedia.url} 
          onClose={() => setViewerMedia(null)} 
        />
      )}
      
      {viewerMedia && viewerMedia.type === 'video' && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-200">
          <button 
            onClick={() => setViewerMedia(null)}
            className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors backdrop-blur-sm"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex-1 w-full h-full flex items-center justify-center p-4">
            <video src={viewerMedia.url} controls autoPlay className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  return prevProps.post.id === nextProps.post.id && 
         prevProps.post.likes?.length === nextProps.post.likes?.length && 
         prevProps.post.comments?.length === nextProps.post.comments?.length;
});

export default PostCard;

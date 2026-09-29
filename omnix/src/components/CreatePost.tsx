import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { uploadMedia } from '../lib/storage';
import { useQueryClient } from '@tanstack/react-query';
import { Image as ImageIcon, Smile, Loader2, Video, BarChart2, MapPin, Hash, Users, Globe, Lock, Clock, X, Edit2, Settings } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { motion, AnimatePresence } from 'motion/react';
import PostEditorModal from './PostEditorModal';

export default function CreatePost() {
  const { user } = useAuthStore();
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [mediaFiles, setMediaFiles] = useState<{file: File, url: string}[]>([]);
  const [visibility, setVisibility] = useState('public');
  const [location, setLocation] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [editingMediaIndex, setEditingMediaIndex] = useState<number | null>(null);

  useEffect(() => {
    const savedDraft = localStorage.getItem('post_draft_content');
    const savedLocation = localStorage.getItem('post_draft_location');
    if (savedDraft) setContent(savedDraft);
    if (savedLocation) setLocation(savedLocation);
  }, []);

  useEffect(() => {
    const saveTimer = setTimeout(() => {
      if (content.trim() || location.trim()) {
        localStorage.setItem('post_draft_content', content);
        localStorage.setItem('post_draft_location', location);
      } else {
        localStorage.removeItem('post_draft_content');
        localStorage.removeItem('post_draft_location');
      }
    }, 1000);
    return () => clearTimeout(saveTimer);
  }, [content, location]);

  const extractHashtags = (text: string) => {
    const regex = /#[\w]+/g;
    return text.match(regex) || [];
  };

  const extractMentions = (text: string) => {
    const regex = /@[\w]+/g;
    return text.match(regex) || [];
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (mediaFiles.length + files.length > 4) {
      alert('You can only upload up to 4 media files per post.');
      return;
    }

    const newMedia = await Promise.all(files.map(async (file) => {
      if (file.type.startsWith('image/')) {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true };
        try {
          const compressedFile = await imageCompression(file, options);
          return { file: compressedFile, url: URL.createObjectURL(compressedFile) };
        } catch (error) {
          console.error('Compression error:', error);
          return { file, url: URL.createObjectURL(file) };
        }
      }
      return { file, url: URL.createObjectURL(file) };
    }));

    setMediaFiles(prev => [...prev, ...newMedia]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].url);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleSaveEdit = async (editedBlob: Blob) => {
    if (editingMediaIndex === null) return;
    
    const file = new File([editedBlob], `edited_image_${Date.now()}.jpg`, { type: 'image/jpeg' });
    const url = URL.createObjectURL(file);
    
    setMediaFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[editingMediaIndex].url);
      newFiles[editingMediaIndex] = { file, url };
      return newFiles;
    });
    setEditingMediaIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) return;
    if (!user) return alert("You must be logged in to post.");
    setIsSubmitting(true);

    try {
      let isVideo = false;
      const uploadedUrls: string[] = [];

      for (const media of mediaFiles) {
        if (media.file.type.startsWith('video/')) isVideo = true;
        const fileExt = media.file.name.split('.').pop();
        const fileName = `${user.id}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `posts/${fileName}`;
        
        const publicUrl = await uploadMedia('media', filePath, media.file);
        uploadedUrls.push(publicUrl);
      }

      const hashtags = extractHashtags(content);
      const mentions = extractMentions(content);
      const mediaType = mediaFiles.length === 0 ? 'text' : isVideo ? 'video' : 'image';
      
      const postData = {
        user_id: user.id,
        caption: content.trim(),
        media_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
        image_url: uploadedUrls[0] || null,
        video_url: isVideo ? uploadedUrls[0] : null,
        media_type: mediaType,
        visibility: visibility,
        location: location || null,
        hashtags: hashtags,
        mentions: mentions
      };

      // Ensure user profile exists (to prevent foreign key errors)
      try {
        const { data: profileExists } = await supabase.from('profiles').select('id').eq('id', user.id).single();
        if (!profileExists) {
          console.log("Profile not found, creating a default one...");
          const username = user.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + '_' + Date.now().toString().slice(-4) : 'user_' + Date.now();
          await supabase.from('profiles').insert({
            id: user.id,
            username: username,
            display_name: username,
            avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username
          });
        }
      } catch (e) {
        console.warn("Failed to check/create profile:", e);
      }
      


      const { error } = await supabase.from('posts').insert(postData);
      
      if (error) {
        const fallbackData = {
          user_id: user.id,
          caption: content.trim(),
          image_url: !isVideo ? uploadedUrls[0] || null : null,
          video_url: isVideo ? uploadedUrls[0] || null : null,
          visibility: visibility,
          location: location || null
        };
        const { error: fallbackError } = await supabase.from('posts').insert(fallbackData);
        if (fallbackError) throw fallbackError;
      }
      
      setContent('');
      setMediaFiles([]);
      setLocation('');
      setShowAdvanced(false);
      localStorage.removeItem('post_draft_content');
      localStorage.removeItem('post_draft_location');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-b border-zinc-800 p-4 transition-all focus-within:bg-zinc-900/20">
      <form onSubmit={handleSubmit}>
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden flex-shrink-0">
            {user?.user_metadata?.avatar_url ? (
              <img src={user.user_metadata.avatar_url} alt="You" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500 font-bold bg-zinc-800">
                {user?.email?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-transparent text-white text-lg resize-none outline-none min-h-[80px] placeholder:text-zinc-500"
              maxLength={2000}
            />
            
            {mediaFiles.length > 0 && (
              <div className={`grid gap-2 mb-3 mt-2 ${mediaFiles.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                {mediaFiles.map((media, index) => (
                  <div key={index} className="relative group rounded-xl overflow-hidden bg-black aspect-video border border-zinc-800">
                    {media.file.type.startsWith('video/') ? (
                      <video src={media.url} className="w-full h-full object-cover" />
                    ) : (
                      <img src={media.url} alt={`Upload ${index}`} className="w-full h-full object-cover" />
                    )}
                    
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); setEditingMediaIndex(index); }}
                        className="p-2 bg-zinc-900/80 hover:bg-zinc-800 rounded-full text-white backdrop-blur-sm transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => { e.preventDefault(); removeMedia(index); }}
                        className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <AnimatePresence>
              {showAdvanced && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-3 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-2 bg-zinc-900 rounded-lg p-2 border border-zinc-800">
                    <MapPin className="w-4 h-4 text-zinc-400" />
                    <input 
                      type="text" 
                      placeholder="Add location" 
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="bg-transparent text-sm text-white outline-none w-full placeholder:text-zinc-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setVisibility('public')} className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === 'public' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                      <Globe className="w-3 h-3" /> Public
                    </button>
                    <button type="button" onClick={() => setVisibility('followers')} className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === 'followers' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                      <Users className="w-3 h-3" /> Followers
                    </button>
                    <button type="button" onClick={() => setVisibility('private')} className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${visibility === 'private' ? 'bg-purple-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                      <Lock className="w-3 h-3" /> Private
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/50 mt-2">
              <div className="flex items-center gap-1 text-purple-500">
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 hover:bg-purple-500/10 rounded-full transition-colors"
                  title="Media"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  className="p-2 hover:bg-purple-500/10 rounded-full transition-colors hidden sm:block"
                  title="Emoji"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <button type="button" className="p-2 hover:bg-purple-500/10 rounded-full transition-colors" title="Poll">
                  <BarChart2 className="w-5 h-5" />
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className={`p-2 rounded-full transition-colors ${showAdvanced ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-purple-500/10'}`}
                  title="Advanced"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`text-xs ${content.length > 1800 ? 'text-red-500' : 'text-zinc-500'}`}>
                  {content.length}/2000
                </span>
                <button
                  type="submit"
                  disabled={isSubmitting || (!content.trim() && mediaFiles.length === 0)}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-1.5 px-5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden" 
          accept="image/*,video/*"
          multiple 
        />
      </form>
      
      {editingMediaIndex !== null && mediaFiles[editingMediaIndex] && (
        <PostEditorModal 
          mediaFile={mediaFiles[editingMediaIndex].file} 
          previewUrl={mediaFiles[editingMediaIndex].url}
          onClose={() => setEditingMediaIndex(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Folder, Check, Bookmark } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';

export default function SaveSheet({ post, onClose, isCurrentlySaved, onSaveToggle }: { post: any, onClose: () => void, isCurrentlySaved: boolean, onSaveToggle: (saved: boolean) => void }) {
  const { user } = useAuthStore();
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const defaultCategories = ['Favorites', 'Watch Later', 'Funny', 'Travel', 'Food', 'Gaming'];

  useEffect(() => {
    fetchCollections();
  }, []);

  const fetchCollections = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('collections')
        .select(`
          *,
          post_collections(post_id)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error && !error.message.includes('find the table')) throw error;
      setCollections(data || []);
    } catch (err) {
      console.error('Error fetching collections', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async (name: string) => {
    if (!name.trim() || !user) return;
    
    try {
      const { data, error } = await supabase.from('collections').insert({
        user_id: user.id,
        name: name.trim()
      }).select().single();
      
      if (error) {
        if (error.message.includes('find the table')) {
            alert('Database not initialized for collections. Run the engagement.sql migration.');
            return;
        }
        throw error;
      }
      
      // Auto-save to this new collection
      await handleToggleSave(data.id, false);
      setCreating(false);
      setNewCollectionName('');
      fetchCollections();
    } catch (err) {
      console.error('Error creating collection', err);
    }
  };

  const handleToggleSave = async (collectionId: string, isSavedInCollection: boolean) => {
    if (!user) return;
    try {
      if (isSavedInCollection) {
        await supabase.from('post_collections').delete().eq('collection_id', collectionId).eq('post_id', post.id);
      } else {
        await supabase.from('post_collections').insert({ collection_id: collectionId, post_id: post.id });
      }
      
      // Notify parent about general save state change
      onSaveToggle(true);
      fetchCollections();
    } catch (err) {
      console.error('Error toggling save', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative bg-zinc-950 border-t border-zinc-800 rounded-t-3xl flex flex-col max-h-[70vh]"
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-800/50">
          <h2 className="text-white font-bold text-lg">Save to Collection</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {!creating ? (
            <button 
              onClick={() => setCreating(true)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-left hover:bg-zinc-800 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-zinc-800 group-hover:bg-zinc-700 flex items-center justify-center text-white transition-colors">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold text-white">New Collection</span>
            </button>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); handleCreateCollection(newCollectionName); }} className="flex gap-2 mb-4 bg-zinc-900 p-3 rounded-xl border border-zinc-800">
              <input 
                autoFocus
                type="text" 
                placeholder="Collection name..."
                value={newCollectionName}
                onChange={e => setNewCollectionName(e.target.value)}
                className="flex-1 bg-transparent text-white outline-none px-2 font-medium"
              />
              <button 
                type="button" 
                onClick={() => setCreating(false)}
                className="px-3 text-zinc-400 hover:text-white font-medium text-sm transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={!newCollectionName.trim()}
                className="px-4 bg-white text-black font-bold rounded-lg text-sm disabled:opacity-50"
              >
                Create
              </button>
            </form>
          )}

          {loading ? (
             <div className="space-y-2 mt-4">
               {[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}
             </div>
          ) : (
            <div className="mt-4 space-y-2">
              {collections.map(collection => {
                const isSavedInCollection = collection.post_collections?.some((pc: any) => pc.post_id === post.id);
                
                return (
                  <button 
                    key={collection.id}
                    onClick={() => handleToggleSave(collection.id, isSavedInCollection)}
                    className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 transition-colors border border-transparent hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-white text-sm">{collection.name}</p>
                        <p className="text-xs text-zinc-500 font-medium">{collection.post_collections?.length || 0} posts</p>
                      </div>
                    </div>
                    {isSavedInCollection && (
                      <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-black">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                );
              })}

              {collections.length === 0 && (
                <div className="pt-4 border-t border-zinc-800">
                  <p className="text-xs font-bold text-zinc-500 mb-3 uppercase tracking-wider pl-2">Suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultCategories.map(cat => (
                      <button
                        key={cat}
                        onClick={() => handleCreateCollection(cat)}
                        className="px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

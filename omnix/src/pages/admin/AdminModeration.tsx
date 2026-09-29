import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Shield, EyeOff, Trash2, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react';

export default function AdminModeration() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('posts');

  useEffect(() => {
    fetchContent();
  }, [filter]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      if (filter === 'posts' || filter === 'stories') {
        const { data } = await supabase.from(filter).select('*').order('created_at', { ascending: false }).limit(50);
        if (data && data.length > 0) {
          const userIds = [...new Set(data.map(p => p.user_id).filter(Boolean))];
          if (userIds.length > 0) {
             const { data: profiles } = await supabase.from('profiles').select('id, username').in('id', userIds);
             const mappedData = data.map(item => ({
               ...item,
               user: profiles?.find(p => p.id === item.user_id) || null
             }));
             setPosts(mappedData);
             return;
          }
        }
        if (data) setPosts(data);
      } else {
        setPosts([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-purple-500" />
          Content Moderation
        </h2>
        <div className="flex gap-2">
          {['posts', 'stories', 'clips', 'communities', 'comments'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`capitalize px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === type ? 'bg-purple-500 text-white' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="text-zinc-500 animate-pulse">Loading content...</div>
        ) : posts.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
            <p className="text-zinc-500">No content available for {filter}.</p>
          </div>
        ) : (
          posts.map(post => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4">
              {post.media_url ? (
                <img src={post.media_url} alt="Content" className="w-full md:w-48 h-32 object-cover rounded-xl bg-zinc-800" />
              ) : (
                <div className="w-full md:w-48 h-32 bg-zinc-800 rounded-xl flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-zinc-600" />
                </div>
              )}
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-zinc-400">@{post.user?.username}</span>
                    <span className="text-xs text-zinc-600">• {new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-white text-sm line-clamp-2">{post.content || post.caption || 'No text content'}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-4">
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-medium transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-zinc-800 text-zinc-300 hover:bg-zinc-700 rounded-lg text-xs font-medium transition-colors">
                    <EyeOff className="w-3.5 h-3.5" /> Hide
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 rounded-lg text-xs font-medium transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5" /> Mark NSFW
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 bg-green-500/10 text-green-500 hover:bg-green-500/20 rounded-lg text-xs font-medium transition-colors">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

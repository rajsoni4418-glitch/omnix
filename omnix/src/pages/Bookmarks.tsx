import React, { useState } from 'react';
import { Bookmark, Folder, Plus, Search, MoreVertical, LayoutGrid, List } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Bookmarks() {
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Dummy data for collections until Supabase table is created
  const collections = [
    { id: 1, name: 'Inspiration', count: 42, cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80' },
    { id: 2, name: 'Design Patterns', count: 18, cover: 'https://images.unsplash.com/photo-1558655146-d09347e92766?w=400&q=80' },
    { id: 3, name: 'Recipes', count: 7, cover: 'https://images.unsplash.com/photo-1556910103-1c02745a872f?w=400&q=80' },
    { id: 4, name: 'Read Later', count: 125, cover: 'https://images.unsplash.com/photo-1491841550275-ad7854e35ca6?w=400&q=80' },
  ];

  return (
    <div className="min-h-screen bg-black pb-20 md:pb-0">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-purple-500" />
            <h1 className="text-xl font-bold text-white">Saved</h1>
          </div>
          <button className="p-2 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex gap-2 mb-2">
          <button className="px-4 py-1.5 rounded-full bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 transition-colors">
            Collections
          </button>
          <button className="px-4 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
            All Posts
          </button>
          <button className="px-4 py-1.5 rounded-full bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors">
            Clips
          </button>
        </div>
        
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input 
            type="text"
            placeholder="Search your saved items..."
            className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-6 text-zinc-400">
          <span className="text-sm font-medium">{collections.length} Collections</span>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-zinc-800 text-white' : 'hover:bg-zinc-900 hover:text-white'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className={`grid ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-3 gap-4' : 'grid-cols-1 gap-3'}`}>
          {collections.map(collection => (
            <Link 
              to={`/bookmarks/${collection.id}`} 
              key={collection.id}
              className={`group bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all ${viewMode === 'list' ? 'flex items-center p-3 gap-4' : 'flex flex-col'}`}
            >
              <div className={`${viewMode === 'list' ? 'w-16 h-16 rounded-xl flex-shrink-0' : 'aspect-square w-full'} overflow-hidden relative bg-zinc-800`}>
                <img 
                  src={collection.cover} 
                  alt={collection.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </div>
              <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'p-4'}`}>
                <h3 className="text-white font-bold text-lg truncate group-hover:text-purple-400 transition-colors">{collection.name}</h3>
                <p className="text-zinc-500 text-sm">{collection.count} items</p>
              </div>
              {viewMode === 'list' && (
                <button className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-xl transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              )}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

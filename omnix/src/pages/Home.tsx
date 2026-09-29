import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import StoriesBar from '../components/StoriesBar';
import CreatePost from '../components/CreatePost';
import Feed from '../components/Feed';

export default function Home() {
  const navigate = useNavigate();
  // Force reload
  const location = useLocation();
  const isAiPage = location.pathname === '/ai';

  return (
    <>
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white">Home</h1>
      </div>
      <StoriesBar />
      <CreatePost />
      <Feed />

      {!isAiPage && (
        <button
          onClick={() => navigate('/ai')}
          className="fixed bottom-20 md:bottom-6 right-6 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-2xl transition-all hover:scale-105 z-40 shadow-purple-500/20 xl:hidden"
        >
          <Sparkles className="w-6 h-6" />
        </button>
      )}
    </>
  );
}
// cache bust Sat Jul 11 06:14:31 PM UTC 2026

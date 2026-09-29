import { useState } from 'react';

export default function Setup() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold text-purple-500 mb-4">Welcome to Omnix</h1>
        <p className="text-zinc-400 mb-6">
          To get started, you need to configure your Supabase credentials. Omnix uses Supabase for Authentication, PostgreSQL Database, and Storage.
        </p>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-white mb-2">1. Set Environment Variables</h3>
            <p className="text-sm text-zinc-400">
              Open the AI Studio Settings panel and add the following environment variables:
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-500 mt-2 space-y-1">
              <li><code className="text-purple-400 bg-purple-400/10 px-1 py-0.5 rounded">VITE_SUPABASE_URL</code></li>
              <li><code className="text-purple-400 bg-purple-400/10 px-1 py-0.5 rounded">VITE_SUPABASE_ANON_KEY</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-2">2. Ensure Schema Exists</h3>
            <p className="text-sm text-zinc-400">
              Ensure your existing Supabase project has the required tables (profiles, posts, etc.) for Omnix.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Megaphone } from 'lucide-react';

export default function AdminAds() {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-purple-400" /> Advertisement Manager
        </h2>
        <p className="text-sm text-zinc-400 mb-6">Review and approve global advertisement campaigns.</p>

        <div className="text-center py-12 border border-zinc-900 border-dashed rounded-2xl">
          <Megaphone className="w-12 h-12 text-zinc-800 mx-auto mb-3" />
          <h3 className="text-white font-bold mb-1">No pending ads to review</h3>
          <p className="text-xs text-zinc-500">All campaigns are currently active and compliant.</p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function PostSkeleton() {
  return (
    <div className="bg-black border-b border-zinc-900 pb-4 mb-4 animate-pulse">
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-zinc-800 rounded-full" />
          <div className="space-y-2">
            <div className="w-24 h-4 bg-zinc-800 rounded" />
            <div className="w-16 h-3 bg-zinc-900 rounded" />
          </div>
        </div>
      </div>
      <div className="w-full aspect-[4/5] bg-zinc-900" />
      <div className="p-4 space-y-3">
        <div className="flex gap-4">
          <div className="w-6 h-6 bg-zinc-800 rounded-full" />
          <div className="w-6 h-6 bg-zinc-800 rounded-full" />
          <div className="w-6 h-6 bg-zinc-800 rounded-full" />
        </div>
        <div className="w-1/2 h-4 bg-zinc-800 rounded" />
        <div className="w-3/4 h-3 bg-zinc-900 rounded" />
      </div>
    </div>
  );
}

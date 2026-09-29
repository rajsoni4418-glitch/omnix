import React, { useState, useEffect } from 'react';
import { Activity, X, Zap } from 'lucide-react';

export default function DevPerformancePanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fps, setFps] = useState(0);
  const [memory, setMemory] = useState<any>(null);
  const [isDev] = useState(import.meta.env.DEV);

  useEffect(() => {
    if (!isDev) return;

    let frameCount = 0;
    let lastTime = performance.now();
    let rafId: number;

    const measureFPS = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      rafId = requestAnimationFrame(measureFPS);
    };

    rafId = requestAnimationFrame(measureFPS);

    const memoryInterval = setInterval(() => {
      if ((performance as any).memory) {
        setMemory((performance as any).memory);
      }
    }, 1000);

    return () => {
      cancelAnimationFrame(rafId);
      clearInterval(memoryInterval);
    };
  }, [isDev]);

  if (!isDev) return null;

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-[9999] p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        title="Performance Dashboard"
      >
        <Zap className="w-5 h-5" />
      </button>
    );
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed bottom-4 left-4 z-[9999] w-64 bg-black/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl text-xs font-mono text-zinc-300 overflow-hidden flex flex-col">
      <div className="p-2 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-500" />
          <span className="font-bold text-white">Dev Perf Panel</span>
        </div>
        <button onClick={() => setIsOpen(false)} className="hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-3 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-zinc-500">FPS</span>
          <span className={`font-bold ${fps < 30 ? 'text-red-500' : fps < 50 ? 'text-yellow-500' : 'text-green-500'}`}>{fps}</span>
        </div>
        
        {memory && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">JS Heap</span>
              <span>{formatBytes(memory.usedJSHeapSize)} / {formatBytes(memory.totalJSHeapSize)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-500">Heap Limit</span>
              <span>{formatBytes(memory.jsHeapSizeLimit)}</span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden mt-1">
              <div 
                className="bg-purple-500 h-full" 
                style={{ width: `${(memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100}%` }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { ShieldAlert, Gift, Coins, Trophy, Plus, Settings, Target, Filter, Trash2, Edit2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminRewards() {
  const [activeTab, setActiveTab] = useState<'overview' | 'missions' | 'shop'>('overview');
  const [stats, setStats] = useState({ totalCoins: 0, totalSpends: 0, activeMissions: 0 });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Gift className="w-6 h-6 text-purple-500" />
            Reward Economy Center
          </h2>
          <p className="text-zinc-400 text-sm mt-1">Manage missions, shop items, and coin distributions</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Settings className="w-4 h-4" /> Economy Settings
          </button>
          <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Create New
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center mb-4">
              <Coins className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">4.2M</p>
            <p className="text-zinc-500 text-sm font-medium">Total Coins Circulated</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-green-500/20 text-green-500 rounded-xl flex items-center justify-center mb-4">
              <Gift className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">1.8M</p>
            <p className="text-zinc-500 text-sm font-medium">Total Coins Spent</p>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-500 rounded-xl flex items-center justify-center mb-4">
              <Target className="w-6 h-6" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-white">12</p>
            <p className="text-zinc-500 text-sm font-medium">Active Missions</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Overview
        </button>
        <button 
          onClick={() => setActiveTab('missions')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'missions' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Manage Missions
        </button>
        <button 
          onClick={() => setActiveTab('shop')}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'shop' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Manage Shop Items
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Issue Manual Reward</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">User ID or Username</label>
                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500" placeholder="@username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Coin Amount</label>
                <input type="number" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500" placeholder="1000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Reason</label>
                <input type="text" className="w-full bg-black border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500" placeholder="Bug bounty reward" />
              </div>
              <button className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl transition-colors">
                Send Coins
              </button>
            </div>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Fraud Detection</h3>
            <div className="space-y-3">
              {[
                { user: '@bot_account1', reason: 'Multiple daily claims', severity: 'High' },
                { user: '@spammer99', reason: 'Fake view generation', severity: 'Medium' },
                { user: '@exploiter', reason: 'Coin exploit attempt', severity: 'High' }
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-black rounded-xl border border-zinc-800">
                  <div>
                    <p className="text-white font-medium">{alert.user}</p>
                    <p className="text-sm text-zinc-500">{alert.reason}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded font-medium ${alert.severity === 'High' ? 'bg-red-500/20 text-red-500' : 'bg-orange-500/20 text-orange-500'}`}>
                      {alert.severity}
                    </span>
                    <button className="p-2 text-zinc-400 hover:text-white bg-zinc-800 rounded-lg">Review</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'missions' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Active Missions</h3>
            <button className="text-sm text-purple-400 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Create Mission
            </button>
          </div>
          <div className="divide-y divide-zinc-800">
            {[
              { title: 'Watch 5 OmniClips', type: 'Daily', reward: 100 },
              { title: 'Maintain 7-day Streak', type: 'Weekly', reward: 500 },
              { title: 'Upload a Story', type: 'Daily', reward: 200 }
            ].map((mission, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div>
                  <h4 className="text-white font-medium">{mission.title}</h4>
                  <span className="text-xs text-zinc-500">{mission.type} Mission</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Coins className="w-4 h-4" /> +{mission.reward}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white bg-black rounded-lg border border-zinc-800"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 text-red-400 hover:text-red-300 bg-black rounded-lg border border-zinc-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Shop Inventory</h3>
            <button className="text-sm text-purple-400 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          <div className="divide-y divide-zinc-800">
            {[
              { title: 'Neon Purple Frame', type: 'Profile Frame', price: 2500, active: true },
              { title: 'AI Avatar Generator', type: 'AI Tool', price: 5000, active: true },
              { title: 'Mystery Box', type: 'Exclusive', price: 1000, active: true }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div>
                  <h4 className="text-white font-medium">{item.title}</h4>
                  <span className="text-xs text-zinc-500">{item.type}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                    <Coins className="w-4 h-4" /> {item.price}
                  </span>
                  <div className="flex gap-2">
                    <button className="p-2 text-zinc-400 hover:text-white bg-black rounded-lg border border-zinc-800"><Edit2 className="w-4 h-4" /></button>
                    <button className="p-2 text-red-400 hover:text-red-300 bg-black rounded-lg border border-zinc-800"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

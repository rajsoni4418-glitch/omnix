import AccountSettings from "./settings/AccountSettings";
import SecurityDashboard from "./settings/SecurityDashboard";
import { supabase } from '../lib/supabase';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useSubscriptionStore } from '../store/subscriptionStore';
import PermissionsCenter from './settings/PermissionsCenter';
import { useWalletStore } from '../store/walletStore';
import { 
  Crown, 
  Check, 
  Sparkles, 
  Bot, 
  Fingerprint, 
  Database, 
  Trash2, 
  Settings as SettingsIcon, 
  Shield, 
  Smartphone, 
  Bell, 
  Eye, 
  Ban, 
  Key, 
  LogOut, 
  User, 
  Globe, 
  Moon, 
  Lock, 
  VolumeX, 
  History, 
  Download, 
  HardDrive, 
  Cpu, 
  Terminal, 
  Webhook,
  Calendar,
  Sparkle,
  Coins,
  ArrowRight,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck,
  Clock
} from 'lucide-react';

export default function Settings() {
  const { user, signOut } = useAuthStore();
  const { 
    userSubscription, 
    plans, 
    fetchUserSubscription, 
    cancelSubscription, 
    renewSubscription,
    isLoading 
  } = useSubscriptionStore();

  const { wallet, transactions, fetchWalletData, downloadStatement } = useWalletStore();
  
  const [activeTab, setActiveTab] = useState('account');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchUserSubscription(user.id);
      fetchWalletData(user.id);
    }
  }, [user?.id, fetchWalletData]);

  const handleCancelAutoRenew = async () => {
    if (!user?.id) return;
    if (window.confirm('Cancel auto-renewal? Your subscription benefits will remain active until the billing period ends.')) {
      await cancelSubscription(user.id);
    }
  };

  const handleResumeAutoRenew = async () => {
    if (!user?.id) return;
    await renewSubscription(user.id);
  };

  const currentPlan = plans.find(p => p.id === userSubscription?.plan_id) || plans.find(p => p.id === 'free');
  const isPremium = userSubscription && userSubscription.plan_id !== 'free';

  return (
    <div className="pb-8 min-h-screen bg-black">
      <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800 p-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-purple-500" />
          Settings
        </h1>
      </div>

      <div className="flex flex-col md:flex-row gap-6 p-4">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 space-y-2">
          <button
            onClick={() => setActiveTab('account')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'account' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <User className="w-5 h-5" />
            <span className="font-medium">Account</span>
          </button>
          
          {/* Omnix Premium Sidebar Option */}
          <button
            onClick={() => setActiveTab('premium')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'premium' ? 'bg-purple-900/30 text-purple-300 border border-purple-500/30' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <Crown className={`w-5 h-5 ${activeTab === 'premium' ? 'text-purple-400' : 'text-purple-500'}`} />
              <span className="font-medium">Omnix Premium</span>
            </div>
            {!isPremium && (
              <span className="text-[9px] font-extrabold bg-gradient-to-r from-purple-500 to-indigo-500 text-black px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                PRO
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'appearance' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Moon className="w-5 h-5" />
            <span className="font-medium">Appearance & Language</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'security' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="font-medium">Security</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'privacy' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Lock className="w-5 h-5" />
            <span className="font-medium">Permissions & Privacy</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'notifications' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="font-medium">Notifications</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'wallet' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
            id="settings-tab-wallet"
          >
            <div className="flex items-center gap-3">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-medium">Wallet & Coins</span>
            </div>
            {wallet && (
              <span className="text-xs bg-zinc-950 px-2 py-0.5 rounded-md font-mono font-bold text-zinc-300">
                {wallet.coin_balance}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setActiveTab('developer')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'developer' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Terminal className="w-5 h-5" />
            <span className="font-medium">Developer API</span>
          </button>
        </div>

        {/* Settings Content */}
        <div className="flex-1 space-y-6">
          {activeTab === 'account' && (
            <AccountSettings />
          )}

          {/* Premium Subscription Panel inside Settings */}
          {activeTab === 'premium' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Crown className="w-5 h-5 text-purple-400" />
                    Subscription Management
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Manage your billing cycle, auto-renewal settings, and premium benefits.
                  </p>
                </div>
                <Link 
                  to="/premium"
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold rounded-xl transition-colors text-white"
                >
                  Compare Plans
                </Link>
              </div>

              {isLoading ? (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  Loading your subscription data...
                </div>
              ) : userSubscription ? (
                <div className="space-y-6">
                  {/* Active plan status block */}
                  <div className="p-5 bg-gradient-to-r from-purple-950/20 via-zinc-900 to-zinc-900 border border-zinc-800 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-purple-400">Current Plan</span>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        {currentPlan?.name}
                        {isPremium && <Crown className="w-4 h-4 text-purple-400" />}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {isPremium 
                          ? `Billed ${userSubscription.billing_period === 'monthly' ? 'Monthly' : 'Annually'}` 
                          : 'No active payments'}
                      </p>
                    </div>
                    {isPremium && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        userSubscription.status === 'active' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}>
                        {userSubscription.status === 'active' ? 'Auto-Renew Active' : 'Pending Expiration'}
                      </span>
                    )}
                  </div>

                  {/* Date information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-zinc-800 pb-5">
                    <div className="p-4 bg-black/40 border border-zinc-800/60 rounded-xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">Start Date</span>
                        <span className="text-sm font-semibold text-zinc-200">
                          {new Date(userSubscription.start_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 bg-black/40 border border-zinc-800/60 rounded-xl flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                          {userSubscription.cancel_at_period_end ? 'Expiry Date' : 'Next Billing Date'}
                        </span>
                        <span className="text-sm font-semibold text-zinc-200">
                          {userSubscription.current_period_end 
                            ? new Date(userSubscription.current_period_end).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Teaser */}
                  <div className="space-y-4">
                    {isPremium ? (
                      <div className="flex items-center gap-3">
                        {userSubscription.cancel_at_period_end ? (
                          <button
                            onClick={handleResumeAutoRenew}
                            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow cursor-pointer"
                          >
                            Resume Auto-Renewal
                          </button>
                        ) : (
                          <button
                            onClick={handleCancelAutoRenew}
                            className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-red-400 text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            Cancel Auto-Renewal
                          </button>
                        )}
                        <Link
                          to="/premium"
                          className="px-5 py-2.5 bg-zinc-950 border border-zinc-800 hover:border-zinc-700 text-zinc-300 text-xs font-bold rounded-xl transition-all"
                        >
                          Change Tier
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-xl space-y-2">
                          <h5 className="text-sm font-bold text-purple-300 flex items-center gap-1.5">
                            <Sparkle className="w-4 h-4 text-purple-400" /> Unlock Creator Superpowers
                          </h5>
                          <p className="text-xs text-zinc-400 leading-relaxed">
                            Upgrade to Premium to remove all advertisements, gain exclusive animated frames and username colors, increase your upload limits, and unlock direct AI Studio priority credits.
                          </p>
                        </div>
                        <Link
                          to="/premium"
                          className="inline-flex items-center gap-1.5 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl transition-all shadow shadow-purple-600/25"
                        >
                          <Crown className="w-4 h-4" /> Upgrade to Omnix Premium
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  Failed to load subscription status.
                </div>
              )}
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-6">Appearance</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-3">Theme</label>
                  <div className="flex gap-4">
                    <button className="flex-1 py-3 bg-black border-2 border-purple-500 rounded-xl text-white font-medium">Dark Mode</button>
                    <button className="flex-1 py-3 bg-black border border-zinc-800 rounded-xl text-zinc-500 font-medium cursor-not-allowed">Light Mode (Coming Soon)</button>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-zinc-800">
                  <label className="block text-sm font-medium text-zinc-400 mb-3">Language</label>
                  <select className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors">
                    <option value="en">English (US)</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
                
                <div className="pt-6 border-t border-zinc-800">
                  <div className="flex items-center justify-between mb-2">
                     <div>
                       <h4 className="text-white font-medium flex items-center gap-2"><Cpu className="w-4 h-4"/> Low Data Mode</h4>
                       <p className="text-sm text-zinc-400 mt-1">Reduce image and video quality to save cellular data.</p>
                     </div>
                     <label className="relative inline-flex items-center cursor-pointer">
                       <input type="checkbox" className="sr-only peer" />
                       <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
                     </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <SecurityDashboard />
          )}

          {activeTab === 'privacy' && (
            <PermissionsCenter />
          )}
          {activeTab === 'notifications' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
               <h3 className="text-lg font-bold text-white mb-6">Email Notifications</h3>
               <div className="space-y-4">
                 <label className="flex items-center justify-between cursor-pointer">
                   <span className="text-zinc-300">Login Alerts</span>
                   <input type="checkbox" defaultChecked className="form-checkbox rounded text-purple-500 w-5 h-5 bg-zinc-800 border-zinc-700" />
                 </label>
                 <label className="flex items-center justify-between cursor-pointer">
                   <span className="text-zinc-300">New Messages</span>
                   <input type="checkbox" defaultChecked className="form-checkbox rounded text-purple-500 w-5 h-5 bg-zinc-800 border-zinc-700" />
                 </label>
                 <label className="flex items-center justify-between cursor-pointer">
                   <span className="text-zinc-300">Marketing Updates</span>
                   <input type="checkbox" className="form-checkbox rounded text-purple-500 w-5 h-5 bg-zinc-800 border-zinc-700" />
                 </label>
               </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6" id="settings-wallet-panel">
              <div className="flex items-start justify-between border-b border-zinc-800 pb-5">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    Wallet & Coin Management
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    Review coin counts, view recent statements, and audit security logs.
                  </p>
                </div>
                <Link 
                  to="/wallet" 
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition-colors text-white flex items-center gap-1.5 cursor-pointer"
                  id="settings-to-wallet-btn"
                >
                  Full Wallet <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {wallet ? (
                <div className="space-y-6">
                  {/* Ledger summary block */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Coin Balance</span>
                      <p className="text-xl font-extrabold text-white mt-1">{wallet.coin_balance.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Reward Pool</span>
                      <p className="text-xl font-extrabold text-yellow-500 mt-1">{wallet.reward_coins.toLocaleString()}</p>
                    </div>
                    <div className="p-4 bg-black/40 border border-zinc-850 rounded-xl">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">Gift Earnings</span>
                      <p className="text-xl font-extrabold text-pink-500 mt-1">{wallet.gift_coins.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Recent transactions list inside Settings */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Recent Ledger Actions
                      </h4>
                      {transactions.length > 0 && (
                        <button 
                          onClick={() => user && downloadStatement(user.id, 'csv')}
                          className="text-[11px] text-purple-400 hover:underline flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" /> Export Statement
                        </button>
                      )}
                    </div>

                    <div className="space-y-2">
                      {transactions.slice(0, 3).map(tx => {
                        const isCredit = tx.amount > 0;
                        return (
                          <div key={tx.id} className="flex justify-between items-center p-3.5 bg-black/30 border border-zinc-850 rounded-xl text-xs">
                            <div className="flex items-center gap-3">
                              <div className={`p-1.5 rounded-full ${isCredit ? 'bg-green-500/10 text-green-400' : 'bg-zinc-900 text-zinc-500'}`}>
                                {isCredit ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <p className="font-bold text-white">{tx.description}</p>
                                <p className="text-[10px] text-zinc-500 mt-0.5">{new Date(tx.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className={`font-extrabold ${isCredit ? 'text-green-400' : 'text-zinc-200'}`}>
                              {isCredit ? '+' : '-'}{Math.abs(tx.amount).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                      {transactions.length === 0 && (
                        <p className="text-zinc-500 text-xs py-2 text-center bg-black/20 border border-zinc-850 rounded-xl">No ledger activities yet.</p>
                      )}
                    </div>
                  </div>

                  {/* Ledger Security Parameters */}
                  <div className="pt-4 border-t border-zinc-850 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Security Safeguards
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-850 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <div>
                          <p className="text-xs font-bold text-white">Double-Spend Protection</p>
                          <p className="text-[10px] text-zinc-500">Atomic ledger level blocks active</p>
                        </div>
                      </div>
                      <div className="p-3 bg-zinc-950/50 rounded-xl border border-zinc-850 flex items-center gap-2.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <div>
                          <p className="text-xs font-bold text-white">Ledger Verification</p>
                          <p className="text-[10px] text-zinc-500">Every record is audited and cryptographically verified</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-zinc-500 text-sm">
                  Connecting to secure ledger network...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


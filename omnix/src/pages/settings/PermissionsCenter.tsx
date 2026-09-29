import React, { useState } from 'react';
import { usePermissionsStore, PERMISSION_ITEMS, PermissionItem } from '../../store/permissionsStore';
import { Camera, Mic, MapPin, Users, Bell, Shield, ShieldCheck, KeyRound, Lock, Fingerprint, ScanFace, RefreshCw, Radar, QrCode, MailPlus, Images, Download, Upload, Save, Clipboard, CloudUpload, CloudDownload, Radio, MonitorPlay, Volume2, BarChart2, Target, PieChart, Bug, ShieldAlert, Activity, HardDrive, History, Settings } from 'lucide-react';

const Icons = { Camera, Mic, MapPin, Users, Bell, Shield, ShieldCheck, KeyRound, Lock, Fingerprint, ScanFace, RefreshCw, Radar, QrCode, MailPlus, Images, Download, Upload, Save, Clipboard, CloudUpload, CloudDownload, Radio, MonitorPlay, Volume2, BarChart2, Target, PieChart, Bug, ShieldAlert, Activity, HardDrive, History, Settings };
import AccountPrivacy from './AccountPrivacy';
import { ExternalLink } from 'lucide-react';

export default function PermissionsCenter() {
  const [activeTab, setActiveTab] = useState<'manager' | 'dashboard'>('manager');

  return (
    <div className="space-y-6">
      <div className="flex bg-black border border-zinc-800 rounded-xl p-1 mb-6">
        <button
          onClick={() => setActiveTab('manager')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'manager' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Permission Manager
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${
            activeTab === 'dashboard' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Privacy Dashboard
        </button>
      </div>

      {activeTab === 'manager' ? <PermissionManager /> : <PrivacyDashboard />}
    </div>
  );
}

function PermissionManager() {
  const categories = ['core', 'security', 'social', 'content', 'creator', 'optional'];
  
  return (
    <div className="space-y-8">
      {categories.map(category => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider">{category}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {PERMISSION_ITEMS.filter(p => p.category === category).map(permission => (
              <PermissionCard key={permission.id} permission={permission} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function PermissionCard({ permission }: { permission: PermissionItem }) {
  const { getPermission, setPermission } = usePermissionsStore();
  const status = getPermission(permission.id);
  const Icon = (Icons as any)[permission.icon] || Icons.Shield;
  
  const [showLearnMore, setShowLearnMore] = useState(false);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl ${status === 'granted' ? 'bg-purple-500/10 text-purple-400' : status === 'denied' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-white font-bold">{permission.title}</h4>
              <p className="text-sm text-zinc-400 mt-1">{permission.description}</p>
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2">
            {status === 'granted' ? (
              <button onClick={() => setPermission(permission.id, 'denied')} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors">
                Revoke Access
              </button>
            ) : status === 'denied' ? (
              <div className="w-full space-y-2 mt-2">
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" /> Permission Denied
                </p>
                <p className="text-xs text-zinc-500">
                  You have denied this permission. To enable it, you may need to open your device's app settings and grant access manually.
                </p>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => setPermission(permission.id, 'granted')} className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">
                    Enable
                  </button>
                  <button className="flex-1 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1">
                    <Settings className="w-3 h-3" /> App Settings
                  </button>
                </div>
              </div>
            ) : (
              <>
                <button onClick={() => setPermission(permission.id, 'granted')} className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg transition-colors">
                  Allow
                </button>
                <button onClick={() => setPermission(permission.id, 'denied')} className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-lg transition-colors">
                  Not Now
                </button>
              </>
            )}
            
            {status !== 'denied' && (
              <button 
                onClick={() => setShowLearnMore(!showLearnMore)}
                className="px-3 py-1.5 text-zinc-400 hover:text-white text-xs font-medium rounded-lg transition-colors"
              >
                Learn More
              </button>
            )}
          </div>
          
          {showLearnMore && (
            <div className="mt-3 p-3 bg-black rounded-lg border border-zinc-800">
              <p className="text-xs text-zinc-300"><span className="font-bold text-white">Why Omnix needs this:</span> {permission.reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PrivacyDashboard() {
  const { permissions, setPermission } = usePermissionsStore();
  
  const metrics = [
    { id: 'camera', title: 'Camera Access', icon: Icons.Camera },
    { id: 'microphone', title: 'Microphone Access', icon: Icons.Mic },
    { id: 'location', title: 'Location Access', icon: Icons.MapPin },
    { id: 'contacts', title: 'Contacts Access', icon: Icons.Users },
    { id: 'notifications', title: 'Notification Status', icon: Icons.Bell },
  ];

  return (
    <div className="space-y-6">
      <AccountPrivacy />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-medium">Privacy Score</span>
          </div>
          <h3 className="text-2xl font-bold text-white">98/100</h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium">Active Grants</span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {Object.values(permissions).filter(s => s === 'granted').length}
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <ShieldAlert className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium">Denied</span>
          </div>
          <h3 className="text-2xl font-bold text-white">
            {Object.values(permissions).filter(s => s === 'denied').length}
          </h3>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
          <div className="flex items-center gap-2 text-zinc-400 mb-2">
            <HardDrive className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-medium">Storage Usage</span>
          </div>
          <h3 className="text-2xl font-bold text-white">124 MB</h3>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50">
          <h3 className="text-lg font-bold text-white">Core Privacy Metrics</h3>
        </div>
        <div className="divide-y divide-zinc-800">
          {metrics.map(metric => {
            const status = permissions[metric.id] || 'prompt';
            return (
              <div key={metric.id} className="flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${status === 'granted' ? 'bg-purple-500/10 text-purple-400' : 'bg-zinc-800 text-zinc-400'}`}>
                    <metric.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">{metric.title}</h4>
                    <p className="text-xs text-zinc-400 capitalize">{status === 'prompt' ? 'Not Requested' : status}</p>
                  </div>
                </div>
                {status === 'granted' ? (
                  <button onClick={() => setPermission(metric.id, 'denied')} className="text-xs font-bold px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors">
                    Disable
                  </button>
                ) : (
                  <button onClick={() => setPermission(metric.id, 'granted')} className="text-xs font-bold px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                    Enable
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5" /> Permission History
          </h3>
        </div>
        <div className="p-6 text-center">
          <p className="text-zinc-500 text-sm">No recent permission changes.</p>
        </div>
      </div>
    </div>
  );
}

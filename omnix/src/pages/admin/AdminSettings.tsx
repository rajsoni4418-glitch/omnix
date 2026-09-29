import React, { useState } from 'react';
import { Settings, Save, AlertTriangle, ToggleLeft } from 'lucide-react';

export default function AdminSettings() {
  const [saving, setSaving] = useState(false);
  
  // Dummy state since we don't have a real settings table setup yet
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    registrationEnabled: true,
    requireEmailVerification: true,
    maxUploadSizeMB: 50,
    aiFeaturesEnabled: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-500" />
          App Configuration
        </h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800">
            <h3 className="font-bold text-white">Global Settings</h3>
          </div>
          <div className="p-6 space-y-6">
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Maintenance Mode</h4>
                <p className="text-sm text-zinc-400">Lock the app for all users except super admins.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.maintenanceMode ? 'bg-red-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">Allow New Registrations</h4>
                <p className="text-sm text-zinc-400">Enable or disable new user signups.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, registrationEnabled: !s.registrationEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.registrationEnabled ? 'bg-green-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.registrationEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium">AI Features Enabled</h4>
                <p className="text-sm text-zinc-400">Master toggle for all Gemini AI integrations.</p>
              </div>
              <button
                type="button"
                onClick={() => setSettings(s => ({ ...s, aiFeaturesEnabled: !s.aiFeaturesEnabled }))}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.aiFeaturesEnabled ? 'bg-purple-500' : 'bg-zinc-700'
                }`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.aiFeaturesEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div>
              <label className="block text-white font-medium mb-1">Max Upload Size (MB)</label>
              <input
                type="number"
                value={settings.maxUploadSizeMB}
                onChange={(e) => setSettings(s => ({ ...s, maxUploadSizeMB: parseInt(e.target.value) || 0 }))}
                className="w-full md:w-64 bg-black border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-purple-500"
              />
            </div>

          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-xl font-bold transition-colors"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}

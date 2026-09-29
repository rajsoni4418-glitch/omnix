import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

export interface PermissionItem {
  id: string;
  category: string;
  icon: string;
  title: string;
  description: string;
  reason: string;
}

export const PERMISSION_ITEMS: PermissionItem[] = [
  // CORE
  { id: 'camera', category: 'core', icon: 'Camera', title: 'Camera', description: 'Take photos and record videos.', reason: 'Required to capture posts and stories.' },
  { id: 'microphone', category: 'core', icon: 'Mic', title: 'Microphone', description: 'Record audio.', reason: 'Required for videos and voice messages.' },
  { id: 'photos', category: 'core', icon: 'Image', title: 'Photos & Videos', description: 'Access your gallery.', reason: 'Needed to upload existing media.' },
  { id: 'notifications', category: 'core', icon: 'Bell', title: 'Notifications', description: 'Receive alerts.', reason: 'Stay updated on messages and interactions.' },
  { id: 'contacts', category: 'core', icon: 'Users', title: 'Contacts', description: 'Access contact list.', reason: 'Find friends easily on Omnix.' },
  { id: 'location', category: 'core', icon: 'MapPin', title: 'Location', description: 'Access device location.', reason: 'Tag places and find nearby friends.' },
  { id: 'internet', category: 'core', icon: 'Wifi', title: 'Internet', description: 'Connect to the network.', reason: 'Core app functionality.' },
  { id: 'network_state', category: 'core', icon: 'Activity', title: 'Network State', description: 'Check connection status.', reason: 'Optimize media loading.' },
  // SECURITY
  { id: 'fingerprint', category: 'security', icon: 'Fingerprint', title: 'Fingerprint Unlock', description: 'Biometric authentication.', reason: 'Secure your app with fingerprint.' },
  { id: 'face', category: 'security', icon: 'ScanFace', title: 'Face Unlock', description: 'Facial recognition.', reason: 'Secure your app with face scan.' },
  { id: 'pin', category: 'security', icon: 'KeyRound', title: 'Device PIN', description: 'Device passcode auth.', reason: 'Fallback security authentication.' },
  { id: 'session_lock', category: 'security', icon: 'Lock', title: 'Secure Session Lock', description: 'Lock active sessions.', reason: 'Prevent unauthorized access.' },
  { id: 'two_factor', category: 'security', icon: 'ShieldCheck', title: 'Two Factor Auth', description: '2FA authentication.', reason: 'Extra layer of account security.' },
  // SOCIAL
  { id: 'contacts_sync', category: 'social', icon: 'RefreshCw', title: 'Contacts Sync', description: 'Keep contacts updated.', reason: 'Discover new friends who join.' },
  { id: 'nearby', category: 'social', icon: 'Radar', title: 'Nearby Friends', description: 'Find friends close to you.', reason: 'Discover local Omnix users.' },
  { id: 'qr', category: 'social', icon: 'QrCode', title: 'QR Scanner', description: 'Scan QR codes.', reason: 'Quickly add friends via code.' },
  { id: 'invite', category: 'social', icon: 'MailPlus', title: 'Invite Friends', description: 'Send invitations.', reason: 'Grow your network.' },
  // CONTENT
  { id: 'gallery', category: 'content', icon: 'Images', title: 'Gallery Access', description: 'Manage local media.', reason: 'Save and organize your uploads.' },
  { id: 'download', category: 'content', icon: 'Download', title: 'Download Media', description: 'Save to device.', reason: 'Download posts and clips.' },
  { id: 'upload', category: 'content', icon: 'Upload', title: 'Upload Media', description: 'Publish to Omnix.', reason: 'Share your content.' },
  { id: 'drafts', category: 'content', icon: 'Save', title: 'Save Drafts', description: 'Store unfinished posts.', reason: 'Resume editing later.' },
  { id: 'clipboard', category: 'content', icon: 'Clipboard', title: 'Clipboard', description: 'Access copied text.', reason: 'Paste links and captions easily.' },
  // CREATOR
  { id: 'bg_upload', category: 'creator', icon: 'CloudUpload', title: 'Background Upload', description: 'Upload while in background.', reason: 'Publish large videos seamlessly.' },
  { id: 'bg_download', category: 'creator', icon: 'CloudDownload', title: 'Background Download', description: 'Download in background.', reason: 'Save media without waiting.' },
  { id: 'live', category: 'creator', icon: 'Radio', title: 'Live Streaming', description: 'Broadcast in real-time.', reason: 'Connect with your audience live.' },
  { id: 'screen_record', category: 'creator', icon: 'MonitorPlay', title: 'Screen Recording', description: 'Record your screen.', reason: 'Share gameplay or tutorials.' },
  { id: 'audio_ducking', category: 'creator', icon: 'Volume2', title: 'Audio Ducking', description: 'Lower background audio.', reason: 'Ensure your voice is heard clearly over music.' },

  // OPTIONAL
  { id: 'usage_stats', category: 'optional', icon: 'BarChart2', title: 'Usage Statistics', description: 'Share usage data.', reason: 'Help us improve the app experience.' },
  { id: 'personalized_ads', category: 'optional', icon: 'Target', title: 'Personalized Ads', description: 'Tailored advertising.', reason: 'Show ads relevant to your interests.' },
  { id: 'analytics', category: 'optional', icon: 'PieChart', title: 'Analytics', description: 'App performance data.', reason: 'Help us monitor app health.' },
  { id: 'crash_reports', category: 'optional', icon: 'Bug', title: 'Crash Reports', description: 'Send error logs.', reason: 'Help us fix bugs faster.' },
];

interface PermissionsState {
  permissions: Record<string, PermissionStatus>;
  requestPermission: (id: string) => Promise<PermissionStatus>;
  setPermission: (id: string, status: PermissionStatus) => void;
  getPermission: (id: string) => PermissionStatus;
}

export const usePermissionsStore = create<PermissionsState>()(
  persist(
    (set, get) => ({
      permissions: {},
      requestPermission: async (id: string) => {
        const current = get().permissions[id] || 'prompt';
        if (current === 'granted') return 'granted';
        if (current === 'denied') return 'denied';
        
        // Simulating a prompt (in a real app this would trigger native APIs)
        // Here we'll return 'prompt' and let UI handle it
        return 'prompt';
      },
      setPermission: (id: string, status: PermissionStatus) => {
        set((state) => ({
          permissions: {
            ...state.permissions,
            [id]: status
          }
        }));
      },
      getPermission: (id: string) => {
        return get().permissions[id] || 'prompt';
      }
    }),
    {
      name: 'omnix-permissions'
    }
  )
);

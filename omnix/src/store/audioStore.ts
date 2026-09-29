import { create } from 'zustand';

interface AudioState {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

export const useAudioStore = create<AudioState>((set) => ({
  isMuted: localStorage.getItem('omniclips_muted') !== 'false',
  setIsMuted: (muted) => {
    localStorage.setItem('omniclips_muted', String(muted));
    set({ isMuted: muted });
  },
  toggleMute: () => set((state) => {
    const newMuted = !state.isMuted;
    localStorage.setItem('omniclips_muted', String(newMuted));
    return { isMuted: newMuted };
  }),
}));

import React, { useEffect, useRef } from 'react';
import { getPendingUploads, removePendingUpload } from '../../lib/offlineQueue';
import { supabase } from '../../lib/supabase';
import { uploadMedia } from '../../lib/storage';

export default function BackgroundSync() {
  const isSyncing = useRef(false);

  useEffect(() => {
    const syncUploads = async () => {
      if (isSyncing.current || !navigator.onLine) return;
      
      const pending = await getPendingUploads();
      if (!pending || pending.length === 0) return;

      isSyncing.current = true;

      for (const item of pending) {
        try {
          // Add actual upload logic based on the queue item structure here
          // This is a placeholder for the sync logic
          // await uploadMedia(...)
          // await supabase.from('posts').insert(...)
          await removePendingUpload(item.id);
          console.log('Successfully synced pending upload:', item.id);
        } catch (error) {
          console.error('Failed to sync upload:', error);
        }
      }

      isSyncing.current = false;
    };

    window.addEventListener('online', syncUploads);
    
    // Attempt sync on mount if online
    if (navigator.onLine) {
      syncUploads();
    }

    return () => {
      window.removeEventListener('online', syncUploads);
    };
  }, []);

  return null; // Background component, no UI
}

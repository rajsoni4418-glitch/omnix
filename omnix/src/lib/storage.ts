import { supabase } from './supabase';
import { logger } from './logger';

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

const ALLOWED_MIME_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/webm', 'video/quicktime'
];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

export const uploadMedia = async (bucket: string, path: string, file: File): Promise<string> => {
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new Error('Unsupported file type: ' + file.type);
  }

  const isVideo = file.type.startsWith('video/');
  if (isVideo && file.size > MAX_VIDEO_SIZE) {
    throw new Error('Video file size exceeds the 50MB limit.');
  } else if (!isVideo && file.size > MAX_IMAGE_SIZE) {
    throw new Error('Image file size exceeds the 10MB limit.');
  }

  try {
    const uploadRes = await supabase.storage.from(bucket).upload(path, file, { upsert: true });

    if (uploadRes.error) {
      if (uploadRes.error.message.includes('not found') || uploadRes.error.message.includes('bucket')) {
        // Typically, client-side cannot create buckets due to RLS, but we try anyway just in case the key has elevated privileges in some environment.
        try {
          await supabase.storage.createBucket(bucket, { public: true });
          const retryRes = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
          if (retryRes.error) {
            throw new Error(`Upload failed after bucket creation: ${retryRes.error.message}`);
          }
        } catch (createErr: any) {
          throw new Error(`Storage bucket '${bucket}' is missing and could not be created. Error: ${createErr.message || 'Unknown'}`);
        }
      } else {
        throw new Error(`Storage error: ${uploadRes.error.message}`);
      }
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  } catch (error: any) {
    logger.error(`Supabase upload failed for ${bucket}/${path}`, { error: error.message, bucket, path });
    try {
      return await fileToDataUrl(file);
    } catch (fallbackError: any) {
      logger.error("Failed to generate fallback data URL", { error: fallbackError.message });
      try {
        return URL.createObjectURL(file);
      } catch (objUrlErr) {
        return '';
      }
    }
  }
};


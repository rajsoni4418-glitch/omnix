import { openDB } from 'idb';

const DB_NAME = 'omnix-offline-db';
const STORE_NAME = 'pending-uploads';

export const initOfflineDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const addPendingUpload = async (uploadData: any) => {
  const db = await initOfflineDB();
  await db.add(STORE_NAME, uploadData);
};

export const getPendingUploads = async () => {
  const db = await initOfflineDB();
  return db.getAll(STORE_NAME);
};

export const removePendingUpload = async (id: number) => {
  const db = await initOfflineDB();
  await db.delete(STORE_NAME, id);
};

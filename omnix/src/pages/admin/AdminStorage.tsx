import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { HardDrive, Folder, Image as ImageIcon, File, Trash2, RefreshCw } from 'lucide-react';

export default function AdminStorage() {
  const [buckets, setBuckets] = useState<any[]>([]);
  const [selectedBucket, setSelectedBucket] = useState('post-media');
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // We hardcode the expected buckets as getting them dynamically requires service_role key
  const bucketList = ['post-media', 'avatars', 'banners', 'stories', 'clips'];

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.storage.from(selectedBucket).list();
      if (data) {
        // Filter out the empty placeholder .emptyFolderPlaceholder
        setFiles(data.filter(f => f.name !== '.emptyFolderPlaceholder'));
      } else {
        setFiles([]);
      }
    } catch (err) {
      console.error(err);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [selectedBucket]);

  const handleDelete = async (fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete ${fileName}? This will permanently remove it from storage.`)) {
      return;
    }
    try {
      await supabase.storage.from(selectedBucket).remove([fileName]);
      setFiles(files.filter(f => f.name !== fileName));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete file.");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <HardDrive className="w-6 h-6 text-orange-500" />
          Storage Browser
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedBucket}
            onChange={(e) => setSelectedBucket(e.target.value)}
            className="flex-1 md:w-48 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-orange-500"
          >
            {bucketList.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          <button 
            onClick={fetchFiles}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center bg-black/50">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
            <Folder className="w-4 h-4 text-orange-500" />
            <span>/{selectedBucket}</span>
          </div>
          <span className="text-xs text-zinc-500">{files.length} items</span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-4">
          {loading ? (
            <div className="col-span-full py-12 text-center text-zinc-500 animate-pulse">Loading bucket contents...</div>
          ) : files.length === 0 ? (
            <div className="col-span-full py-12 text-center text-zinc-500">Bucket is empty.</div>
          ) : (
            files.map(file => {
              const isImage = file.metadata?.mimetype?.startsWith('image/');
              const url = supabase.storage.from(selectedBucket).getPublicUrl(file.name).data.publicUrl;
              
              return (
                <div key={file.name} className="bg-black border border-zinc-800 rounded-xl overflow-hidden group relative">
                  <div className="aspect-square bg-zinc-900 flex items-center justify-center p-2 relative">
                    {isImage ? (
                      <img src={url} alt={file.name} className="w-full h-full object-cover rounded-lg" loading="lazy" />
                    ) : (
                      <File className="w-12 h-12 text-zinc-700" />
                    )}
                    
                    {/* Delete overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button 
                        onClick={() => handleDelete(file.name)}
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors transform translate-y-4 group-hover:translate-y-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-white font-medium truncate" title={file.name}>{file.name}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">{formatSize(file.metadata?.size || 0)}</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  );
}

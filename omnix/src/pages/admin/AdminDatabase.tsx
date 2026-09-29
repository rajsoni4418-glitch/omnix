import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, Search, RefreshCw, AlertTriangle, Trash2 } from 'lucide-react';

export default function AdminDatabase() {
  const [tables, setTables] = useState<string[]>([
    'profiles', 'posts', 'stories', 'comments', 'likes', 'follows', 'user_reports', 'wallet_transactions'
  ]);
  const [selectedTable, setSelectedTable] = useState('profiles');
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const fetchRows = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from(selectedTable).select('*').limit(100);
      if (data) setRows(data);
      else setRows([]);
    } catch (err) {
      console.error(err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
  }, [selectedTable]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this row? This action cannot be undone and will be logged in the audit trail.')) {
      return;
    }
    try {
      await supabase.from(selectedTable).delete().eq('id', id);
      setRows(rows.filter(r => r.id !== id));
    } catch (err) {
      console.error("Failed to delete", err);
      alert("Failed to delete row. Check permissions or foreign key constraints.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-blue-500" />
          Database Manager
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="flex-1 md:w-48 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500"
          >
            {tables.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button 
            onClick={fetchRows}
            className="p-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 rounded-xl text-zinc-400 hover:text-white transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Table: {selectedTable}</h3>
          <span className="text-xs font-mono text-zinc-500 bg-black px-2 py-1 rounded">SELECT * FROM {selectedTable} LIMIT 100</span>
        </div>
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 text-xs uppercase sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium bg-zinc-900">Actions</th>
                {rows.length > 0 && Object.keys(rows[0]).map(key => (
                  <th key={key} className="px-4 py-3 font-medium bg-zinc-900 whitespace-nowrap">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={20} className="px-6 py-8 text-center text-zinc-500 animate-pulse">Running query...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={20} className="px-6 py-8 text-center text-zinc-500">No rows found in {selectedTable}.</td>
                </tr>
              ) : (
                rows.map((row, i) => (
                  <tr key={row.id || i} className="hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-2">
                      <button 
                        onClick={() => row.id && handleDelete(row.id)}
                        disabled={!row.id}
                        className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg disabled:opacity-30 transition-colors"
                        title="Delete Row"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                    {Object.keys(row).map(key => (
                      <td key={key} className="px-4 py-2 font-mono text-xs max-w-[200px] truncate" title={String(row[key])}>
                        {row[key] === null ? (
                          <span className="text-zinc-600 italic">null</span>
                        ) : typeof row[key] === 'boolean' ? (
                          <span className={row[key] ? 'text-green-400' : 'text-red-400'}>{row[key].toString()}</span>
                        ) : typeof row[key] === 'object' ? (
                          <span className="text-yellow-500">{"{...}"}</span>
                        ) : (
                          <span className="text-zinc-300">{String(row[key])}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

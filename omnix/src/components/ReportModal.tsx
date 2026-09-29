import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetId: string;
  targetType: 'post' | 'user' | 'clip' | 'community';
}

export default function ReportModal({ isOpen, onClose, targetId, targetType }: ReportModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const reasons = [
    'Spam or misleading',
    'Hate speech or symbols',
    'Violence or dangerous organizations',
    'Nudity or sexual activity',
    'Bullying or harassment',
    'Intellectual property violation'
  ];

  const handleSubmit = async () => {
    if (!reason) return;
    setIsSubmitting(true);
    // Simulate API call to reporting queue
    await new Promise(r => setTimeout(r, 1000));
    setIsSubmitting(false);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setReason('');
      onClose();
    }, 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
          >
            {isSuccess ? (
              <div className="p-8 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Report Submitted</h3>
                <p className="text-zinc-400">Our moderation team will review this shortly.</p>
              </div>
            ) : (
              <>
                <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    Report {targetType}
                  </div>
                  <button onClick={onClose} className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 space-y-2">
                  <p className="text-sm text-zinc-400 mb-4">Why are you reporting this {targetType}?</p>
                  
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {reasons.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => setReason(r)}
                        className={`w-full text-left p-3 rounded-xl border transition-colors text-sm font-medium ${
                          reason === r 
                            ? 'bg-red-500/10 border-red-500/50 text-red-400' 
                            : 'bg-black border-zinc-800 text-zinc-300 hover:border-zinc-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 border-t border-zinc-800 flex justify-end gap-2">
                  <button 
                    onClick={onClose}
                    className="px-4 py-2 text-white font-medium hover:bg-zinc-800 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleSubmit}
                    disabled={!reason || isSubmitting}
                    className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Report'}
                  </button>
                </div>
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

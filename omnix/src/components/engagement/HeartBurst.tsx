import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart } from 'lucide-react';

export default function HeartBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 overflow-hidden">
          {/* Main Heart */}
          <motion.div
            initial={{ scale: 0, opacity: 0, rotate: -15 }}
            animate={{ 
              scale: [0, 1.5, 1], 
              opacity: [0, 1, 0],
              rotate: [-15, 0, 15]
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute drop-shadow-[0_0_30px_rgba(239,68,68,0.6)]"
          >
            <Heart className="w-32 h-32 text-red-500 fill-current" />
          </motion.div>
          
          {/* Particles */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 45) * (Math.PI / 180);
            const radius = 100;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                animate={{ 
                  x, 
                  y, 
                  scale: [0, 1, 0],
                  opacity: [1, 0]
                }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute w-4 h-4 text-red-400"
              >
                <Heart className="w-full h-full fill-current" />
              </motion.div>
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}

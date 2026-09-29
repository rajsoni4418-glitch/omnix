const fs = require('fs');
let code = fs.readFileSync('src/components/story/MusicPicker.tsx', 'utf8');

const targetScrubArea = `                  {/* Scrub Area */}
                  <div 
                    className="absolute inset-0 cursor-ew-resize z-20"
                    onPointerDown={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const updatePosition = (clientX: number) => {
                        const x = clientX - rect.left;
                        const percentage = Math.max(0, Math.min(1, x / rect.width));
                        // The user is dragging the center of the selection window
                        const newStart = (percentage * duration) - (trimDuration / 2);
                        handleTrimStartChange(newStart);
                      };
                      updatePosition(e.clientX);
                      
                      const onMove = (moveEvt: PointerEvent) => updatePosition(moveEvt.clientX);
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };
                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                  />`;

const replacementScrubArea = `                  {/* Background timeline click to jump */}
                  <div 
                    className="absolute inset-0 z-10"
                    onPointerDown={(e) => {
                      // Only handle clicks outside the selection window to jump
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = e.clientX - rect.left;
                      const percentage = Math.max(0, Math.min(1, x / rect.width));
                      const clickTime = percentage * duration;
                      
                      if (clickTime < trimStart || clickTime > trimStart + trimDuration) {
                        const newStart = Math.min(Math.max(0, clickTime - trimDuration / 2), duration - trimDuration);
                        handleTrimStartChange(newStart);
                      }
                    }}
                  />`;
code = code.replace(targetScrubArea, replacementScrubArea);

const targetSelectionWindow = `                  {/* Selection Window */}
                  <div 
                    className="absolute top-0 bottom-0 bg-purple-500/20 border-x-4 border-white z-10 pointer-events-none transition-all duration-100"
                    style={{
                      left: \`\${(trimStart / duration) * 100}%\`,
                      width: \`\${(trimDuration / duration) * 100}%\`
                    }}
                  >
                    {/* Handles */}
                    <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-1 h-4 bg-black rounded-full" />
                    <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-1 h-4 bg-black rounded-full" />
                  </div>`;

const replacementSelectionWindow = `                  {/* Selection Window */}
                  <div 
                    className="absolute top-0 bottom-0 bg-purple-500/30 border-y-2 border-purple-500 z-20 cursor-grab active:cursor-grabbing"
                    style={{
                      left: \`\${(trimStart / duration) * 100}%\`,
                      width: \`\${(trimDuration / duration) * 100}%\`
                    }}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      const parent = e.currentTarget.parentElement;
                      if (!parent) return;
                      const rect = parent.getBoundingClientRect();
                      const startX = e.clientX;
                      const initialStart = trimStart;
                      
                      const onMove = (moveEvt: PointerEvent) => {
                        const dx = moveEvt.clientX - startX;
                        const dTime = (dx / rect.width) * duration;
                        const newStart = Math.max(0, Math.min(initialStart + dTime, duration - trimDuration));
                        handleTrimStartChange(newStart);
                      };
                      const onUp = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                      };
                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                    }}
                  >
                    {/* Left Handle */}
                    <div 
                      className="absolute top-0 bottom-0 -left-3 w-6 flex items-center justify-center cursor-ew-resize group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        
                        const onMove = (moveEvt: PointerEvent) => {
                          const x = moveEvt.clientX - rect.left;
                          let newStart = Math.max(0, Math.min((x / rect.width) * duration, initialStart + initialDuration - 1));
                          let newDuration = initialStart + initialDuration - newStart;
                          // Optional: clamp duration to max 30s
                          if (newDuration > 30) {
                            newDuration = 30;
                            newStart = initialStart + initialDuration - 30;
                          }
                          setTrimStart(newStart);
                          setTrimDuration(newDuration);
                          if (audioRef.current) {
                            audioRef.current.currentTime = newStart;
                          }
                        };
                        const onUp = () => {
                          window.removeEventListener('pointermove', onMove);
                          window.removeEventListener('pointerup', onUp);
                          if (audioRef.current && !isPlaying) {
                            audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
                          }
                        };
                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                      }}
                    >
                      <div className="w-2 h-full bg-white rounded-l-md shadow-md flex flex-col items-center justify-center gap-1">
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                    </div>

                    {/* Right Handle */}
                    <div 
                      className="absolute top-0 bottom-0 -right-3 w-6 flex items-center justify-center cursor-ew-resize group/handle"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        const parent = e.currentTarget.parentElement?.parentElement;
                        if (!parent) return;
                        const rect = parent.getBoundingClientRect();
                        const initialStart = trimStart;
                        const initialDuration = trimDuration;
                        
                        const onMove = (moveEvt: PointerEvent) => {
                          const x = moveEvt.clientX - rect.left;
                          let newEnd = Math.max(initialStart + 1, Math.min((x / rect.width) * duration, duration));
                          let newDuration = newEnd - initialStart;
                          if (newDuration > 30) {
                            newDuration = 30;
                          }
                          setTrimDuration(newDuration);
                        };
                        const onUp = () => {
                          window.removeEventListener('pointermove', onMove);
                          window.removeEventListener('pointerup', onUp);
                        };
                        window.addEventListener('pointermove', onMove);
                        window.addEventListener('pointerup', onUp);
                      }}
                    >
                      <div className="w-2 h-full bg-white rounded-r-md shadow-md flex flex-col items-center justify-center gap-1">
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                        <div className="w-0.5 h-1.5 bg-zinc-400 rounded-full" />
                      </div>
                    </div>
                  </div>`;
code = code.replace(targetSelectionWindow, replacementSelectionWindow);

// Add haptic feedback if mobile
if (!code.includes('navigator.vibrate')) {
  code = code.replace(
    /const handleTrimStartChange = \(val: number\) => {/g,
    `const handleTrimStartChange = (val: number) => {
    if (navigator.vibrate) {
       navigator.vibrate(10);
    }`
  );
}

fs.writeFileSync('src/components/story/MusicPicker.tsx', code);

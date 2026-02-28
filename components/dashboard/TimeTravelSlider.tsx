'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAppStore } from '@/store/useAppStore';
import { Clock, Rewind, Play, FastForward } from 'lucide-react';

export function TimeTravelSlider() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(100);
  const sliderRef = useRef<HTMLDivElement>(null);
  
  const isTimeTravelMode = useAppStore((state) => state.isTimeTravelMode);
  const setTimeTravelMode = useAppStore((state) => state.setTimeTravelMode);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const newProgress = (x / rect.width) * 100;
    
    setProgress(newProgress);
    setTimeTravelMode(newProgress < 100);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && progress < 100) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + 0.5;
          if (next >= 100) {
            setIsPlaying(false);
            setTimeTravelMode(false);
            return 100;
          }
          return next;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, progress, setTimeTravelMode]);

  return (
    <div className="w-full flex items-center gap-6">
      <div className="flex items-center gap-4">
        <button 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-bdie-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => { setProgress(0); setTimeTravelMode(true); }}
        >
          <Rewind size={16} />
        </button>
        <button 
          className="w-12 h-12 rounded-full bg-bdie-accent/20 border border-bdie-accent/50 flex items-center justify-center text-bdie-accent hover:bg-bdie-accent/30 transition-colors box-glow-accent"
          onClick={() => setIsPlaying(!isPlaying)}
        >
          {isPlaying ? <Square size={18} /> : <Play size={18} className="ml-1" />}
        </button>
        <button 
          className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-bdie-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          onClick={() => { setProgress(100); setTimeTravelMode(false); }}
        >
          <FastForward size={16} />
        </button>
      </div>

      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-mono text-bdie-text-secondary">
          <span>-24h</span>
          <span className={isTimeTravelMode ? 'text-bdie-warning' : 'text-bdie-accent'}>
            {isTimeTravelMode ? 'Historical Replay' : 'Live'}
          </span>
          <span>Now</span>
        </div>
        
        <div 
          ref={sliderRef}
          className="w-full h-2 bg-black/50 rounded-full relative cursor-pointer group"
          onMouseDown={(e) => {
            handleDrag(e);
            const handleMouseMove = (e: MouseEvent) => handleDrag(e as any);
            const handleMouseUp = () => {
              window.removeEventListener('mousemove', handleMouseMove);
              window.removeEventListener('mouseup', handleMouseUp);
            };
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
          }}
          onTouchStart={(e) => {
            handleDrag(e);
            const handleTouchMove = (e: TouchEvent) => handleDrag(e as any);
            const handleTouchEnd = () => {
              window.removeEventListener('touchmove', handleTouchMove);
              window.removeEventListener('touchend', handleTouchEnd);
            };
            window.addEventListener('touchmove', handleTouchMove);
            window.addEventListener('touchend', handleTouchEnd);
          }}
        >
          {/* Timeline markers */}
          <div className="absolute inset-0 flex justify-between px-1">
            {[...Array(24)].map((_, i) => (
              <div key={i} className="w-px h-full bg-white/10" />
            ))}
          </div>
          
          <motion.div 
            className={`absolute top-0 left-0 bottom-0 rounded-full ${isTimeTravelMode ? 'bg-bdie-warning' : 'bg-bdie-accent'}`}
            style={{ width: `${progress}%` }}
          />
          
          <motion.div 
            className={`absolute top-1/2 -translate-y-1/2 -ml-2 w-4 h-4 rounded-full border-2 border-bdie-surface shadow-[0_0_10px_rgba(0,0,0,0.5)] ${isTimeTravelMode ? 'bg-bdie-warning' : 'bg-bdie-accent'}`}
            style={{ left: `${progress}%` }}
            whileHover={{ scale: 1.5 }}
            whileTap={{ scale: 1.2 }}
          />
        </div>
      </div>
    </div>
  );
}

// Temporary Square icon component since it wasn't imported
function Square(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
    </svg>
  );
}

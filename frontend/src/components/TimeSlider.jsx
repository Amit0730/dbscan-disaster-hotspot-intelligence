import React, { useState, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { Play, Pause, RotateCcw, Clock } from 'lucide-react';

export const TimeSlider = () => {
  const { timeFilterMinutes, setTimeFilterMinutes, visibleSignals, signals } = useMission();
  const [isPlaying, setIsPlaying] = useState(false);

  // Helper to format minutes from 08:00 AM
  const formatMinutesToTime = (mins) => {
    const totalMinutes = 8 * 60 + mins;
    const hours = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  // Playback timer loop
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setTimeFilterMinutes((prev) => {
          if (prev >= 600) {
            setIsPlaying(false);
            return 600;
          }
          return prev + 15;
        });
      }, 350);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, setTimeFilterMinutes]);

  const handleReset = () => {
    setIsPlaying(false);
    setTimeFilterMinutes(600);
  };

  return (
    <div className="bg-[#11131a]/95 backdrop-blur border border-white/[0.08] rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider font-mono">Survey Timeline:</span>
          <span className="font-bold font-mono text-sky-400 bg-[#0c0d12] px-2 py-0.5 rounded-md border border-white/[0.08] tabular-nums">
            {formatMinutesToTime(timeFilterMinutes)}
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline tabular-nums">
            ({visibleSignals.length} / {signals.length} visible)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-[11px] font-medium">{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-colors cursor-pointer"
            title="Reset to Full Time"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500 tabular-nums">08:00</span>
        <input
          type="range"
          min="0"
          max="600"
          step="10"
          value={timeFilterMinutes}
          onChange={(e) => {
            setIsPlaying(false);
            setTimeFilterMinutes(Number(e.target.value));
          }}
          className="w-full h-1.5 bg-white/[0.1] rounded-lg appearance-none cursor-pointer accent-sky-400"
        />
        <span className="text-[10px] font-mono text-slate-500 tabular-nums">18:00</span>
      </div>
    </div>
  );
};

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
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>SURVEY TIMELINE:</span>
          <span className="font-bold text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
            {formatMinutesToTime(timeFilterMinutes)}
          </span>
          <span className="text-[11px] text-slate-500 hidden sm:inline">
            ({visibleSignals.length} / {signals.length} signals visible)
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-1.5 rounded text-xs font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="text-[11px] font-mono">{isPlaying ? 'PAUSE' : 'PLAY'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Reset to Full Time"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Range Slider */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500">08:00</span>
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
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
        />
        <span className="text-[10px] font-mono text-slate-500">18:00</span>
      </div>
    </div>
  );
};

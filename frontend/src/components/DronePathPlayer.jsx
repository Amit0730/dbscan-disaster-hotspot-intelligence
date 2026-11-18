import React, { useState, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { Plane, Play, Pause, RotateCcw, Activity } from 'lucide-react';

export const DronePathPlayer = ({ currentWaypointIndex, onStepChange }) => {
  const { flightPath } = useMission();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const totalWaypoints = flightPath?.length || 0;

  useEffect(() => {
    let interval = null;
    if (isPlaying && totalWaypoints > 0) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => {
          const next = prev + 1;
          if (next >= totalWaypoints) {
            setIsPlaying(false);
            return totalWaypoints - 1;
          }
          if (onStepChange) onStepChange(next);
          return next;
        });
      }, 800);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, totalWaypoints, onStepChange]);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    if (onStepChange) onStepChange(0);
  };

  const activeWaypoint = flightPath[currentIndex] || null;

  return (
    <div className="bg-[#11131a]/95 backdrop-blur border border-white/[0.08] rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Plane className="w-4 h-4 text-sky-400" />
          <span className="font-semibold text-slate-400 text-[11px] uppercase tracking-wider font-mono">Recon Replay:</span>
          <span className="text-sky-400 font-bold font-mono tabular-nums">
            WP #{activeWaypoint ? String(activeWaypoint.sequence).padStart(2, '0') : '01'} / {totalWaypoints}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={totalWaypoints === 0}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-sky-500/10 text-sky-300 border-sky-500/30 hover:bg-sky-500/20'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span className="text-[11px] font-medium">{isPlaying ? 'Pause' : 'Play Mission'}</span>
          </button>

          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-xs bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 border border-white/[0.08] transition-colors cursor-pointer"
            title="Reset Drone Mission"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeWaypoint && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-[#0c0d12] px-2.5 py-1.5 rounded-lg border border-white/[0.06]">
          <span>ALT: <strong className="text-slate-200 font-semibold">{activeWaypoint.altitude}m</strong></span>
          <span>SPD: <strong className="text-slate-200 font-semibold">{activeWaypoint.speed_mps} m/s</strong></span>
          <span className="text-sky-400 font-medium">ACTION: {activeWaypoint.action_type}</span>
        </div>
      )}
    </div>
  );
};

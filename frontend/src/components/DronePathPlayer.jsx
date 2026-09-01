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
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Plane className="w-4 h-4 text-cyan-400" />
          <span>DRONE RECON REPLAY:</span>
          <span className="text-cyan-400 font-bold">
            WP #{activeWaypoint ? String(activeWaypoint.sequence).padStart(2, '0') : '01'} / {totalWaypoints}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={totalWaypoints === 0}
            className={`px-2.5 py-1 rounded text-xs font-mono font-medium border flex items-center gap-1 cursor-pointer transition-colors ${
              isPlaying
                ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                : 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50 hover:bg-cyan-900/80'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'PAUSE' : 'PLAY MISSION'}
          </button>

          <button
            onClick={handleReset}
            className="p-1 rounded text-xs bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 transition-colors cursor-pointer"
            title="Reset Drone Mission"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {activeWaypoint && (
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950 px-2.5 py-1.5 rounded border border-slate-800/80">
          <span>ALT: {activeWaypoint.altitude}m</span>
          <span>SPD: {activeWaypoint.speed_mps} m/s</span>
          <span className="text-cyan-400 uppercase font-semibold">ACTION: {activeWaypoint.action_type}</span>
        </div>
      )}
    </div>
  );
};

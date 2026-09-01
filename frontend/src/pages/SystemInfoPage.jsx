import React from 'react';
import { TacticalBadge } from '../components/TacticalBadge';
import {
  BookOpen,
  SlidersHorizontal,
  Flame,
  Radio,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Shield,
  Layers,
  Code2,
} from 'lucide-react';

export const SystemInfoPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
            SIH26030
          </span>
          <h1 className="text-2xl font-bold font-mono text-slate-100 uppercase tracking-tight">
            System Technical Architecture & Theory Documentation
          </h1>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Algorithmic foundations, spatial geodesic DBSCAN formulas, multi-factor priority triage scoring, and operational limitations.
        </p>
      </div>

      {/* Critical Operational Limitation Callout */}
      <div className="p-5 rounded-xl bg-red-950/30 border border-red-500/40 text-slate-200 space-y-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-red-400 font-bold uppercase tracking-wider text-sm">
          <AlertTriangle className="w-4 h-4" />
          Mandatory Operational Safety Limitation
        </div>
        <p className="text-slate-300 leading-relaxed">
          <strong>"DBSCAN identifies spatially dense patterns. It does not independently determine whether a cluster contains survivors."</strong>
        </p>
        <p className="text-slate-400 leading-relaxed text-[11px]">
          Thermal anomalies may originate from sun-exposed concrete rubble, vehicle engines, smoldering fires, electrical transformers, or roofing materials. This platform is strictly an <strong>operational decision-support intelligence tool</strong>, not an autonomous rescue decision-maker. Field reconnaissance units must verify targets before hazardous structural entry.
        </p>
      </div>

      {/* Section 1: What is DBSCAN and Why DBSCAN for Disasters? */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase text-xs">
          <SlidersHorizontal className="w-4 h-4" />
          1. Density-Based Spatial Clustering of Applications with Noise (DBSCAN)
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Why DBSCAN is the Optimal Algorithm for Disaster Hotspots
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Unlike <strong>K-Means</strong> (which forces clusters into spherical isotropic shapes and requires pre-specifying k) or <strong>Grid-based Binning</strong> (which suffers from arbitrary boundary splitting), <strong>DBSCAN</strong> discovers clusters of <em>arbitrary, irregular geometry</em> purely based on local point densities.
          </p>
          <p>
            In real structural disasters (earthquakes, collapsed overpasses, debris flows), collapsed survivor pockets and debris paths follow fault lines, street corridors, and irregular building footprints. DBSCAN natively handles:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono pl-2">
            <li><strong>Arbitrary Cluster Geometries:</strong> oblong, curved, or multi-branching structural collapse zones.</li>
            <li><strong>Noise Filtering:</strong> isolates false-positive individual anomalies as noise points (cluster_id = -1).</li>
            <li><strong>No Fixed Cluster Count:</strong> automatically determines the number of active hotspots from survey data.</li>
          </ul>
        </div>
      </div>

      {/* Section 2: EPS & Min Samples in Geodesic Space */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase text-xs">
          <Globe2 className="w-4 h-4" />
          2. Geodesic Haversine Distance (Earth Radius R = 6,371 km)
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Why Raw Euclidean Distance on Coordinates Fails
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Latitude and longitude are spherical angular coordinates (degrees). One degree of latitude is approximately 111.19 km, while one degree of longitude shrinks with the cosine of latitude. Running standard Euclidean distance on raw degrees introduces extreme east-west stretching and false cluster distortion.
          </p>
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300 space-y-2">
            <div className="text-cyan-400 font-bold text-[11px]">// Haversine Angular Transformation for Scikit-Learn DBSCAN:</div>
            <div className="text-[11px]">
              1. Convert coordinates from degrees to radians: coords_rad = radians(coords_deg)<br />
              2. Compute spherical epsilon: eps_rad = eps_meters / 6,371,000 m<br />
              3. Execute: <code>DBSCAN(eps=eps_rad, min_samples=min_samples, metric='haversine')</code>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Dual-Sensor Feature Extraction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold font-mono uppercase text-xs">
            <Flame className="w-4 h-4" />
            Thermal Radiometric Feature Pipeline
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Raw thermal matrices are parsed using OpenCV to compute spatial variance and local background contrast. Hotspots are segmented based on extreme pixel deviations (&gt; 1.8 standard deviations above ambient background).
          </p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            Thermal Score = clamp((T_max - 18.0°C) / 30.0°C, 0.0, 1.0)
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold font-mono uppercase text-xs">
            <Radio className="w-4 h-4" />
            RGB Visual Detector Probabilities
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Visual inspection frames produce normalized multi-class classification probabilities: Person (P_human), Concrete Debris (P_debris), Structural Compromise (P_damage), and Vehicles (P_vehicle).
          </p>
          <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-400">
            Standardized record: <code>[lat, lon, alt, time, temp, p_human, p_debris, p_damage]</code>
          </div>
        </div>
      </div>

      {/* Section 4: 5-Factor Rescue Priority Scoring Engine */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-bold font-mono uppercase text-xs">
          <Calculator className="w-4 h-4" />
          4. Transparent 5-Factor Rescue Priority Scoring Model
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Deterministic Hotspot Triage Scoring Formula
        </h2>
        <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-200 text-xs space-y-2">
          <div className="text-amber-400 font-bold">
            Priority Score = [ 0.35 * Thermal + 0.30 * Human + 0.15 * Debris + 0.10 * Damage + 0.10 * Density_Norm ] * 100
          </div>
          <div className="text-slate-400 text-[11px] pt-1">
            Where Density_Norm = min(1.0, Density / 250 pts/km²) represents the normalized spatial cluster concentration.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded bg-red-950/40 border border-red-500/50">
            <span className="text-red-400 font-bold block">CRITICAL (90–100)</span>
            <span className="text-slate-300 text-[11px]">Immediate Search & Extraction (Heavy USAR + Canine)</span>
          </div>
          <div className="p-3 rounded bg-amber-950/40 border border-amber-500/50">
            <span className="text-amber-400 font-bold block">HIGH (75–89)</span>
            <span className="text-slate-300 text-[11px]">Rapid Reconnaissance & Tactical Entry</span>
          </div>
          <div className="p-3 rounded bg-blue-950/40 border border-blue-500/50">
            <span className="text-blue-400 font-bold block">MEDIUM (50–74)</span>
            <span className="text-slate-300 text-[11px]">Structural Monitoring & Acoustic Listening</span>
          </div>
          <div className="p-3 rounded bg-emerald-950/40 border border-emerald-500/50">
            <span className="text-emerald-400 font-bold block">LOW (0–49)</span>
            <span className="text-slate-300 text-[11px]">Secondary Logistics Patrol & Clearance</span>
          </div>
        </div>
      </div>

      {/* Section 5: Ground-Truth Validation Methodology */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-purple-400 font-bold font-mono uppercase text-xs">
          <CheckCircle2 className="w-4 h-4" />
          5. Ground-Truth Spatial Validation Methodology
        </div>
        <h2 className="text-lg font-bold text-slate-100">
          Bipartite Distance Matching & Benchmark Metrics
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p>
            Predicted cluster centroids are matched to simulated ground-truth survivor/debris zones using greedy minimum Haversine distance pairing within a spatial threshold radius of 140 meters.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Precision:</span>
              <span className="font-bold text-slate-200">TP / (TP + FP)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Recall:</span>
              <span className="font-bold text-slate-200">TP / (TP + FN)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">F1 Score:</span>
              <span className="font-bold text-slate-200">2 * (P * R) / (P + R)</span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block">Localization Error:</span>
              <span className="font-bold text-slate-200">mean(distance_errors)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

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
    <div className="p-4 sm:p-6 lg:p-7 space-y-7 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold text-slate-100 tracking-tight">
            System Technical Architecture & Mathematical Foundations
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Algorithmic foundations, geodesic Haversine DBSCAN formulations, multi-factor triage priority scoring, and operational constraints.
        </p>
      </div>

      {/* Critical Operational Limitation Callout */}
      <div className="p-5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-slate-200 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-rose-400 font-semibold uppercase tracking-wider text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Operational Safety Protocol</span>
        </div>
        <p className="text-slate-200 font-medium">
          DBSCAN identifies spatial point density concentrations. It does not independently verify live human survivors.
        </p>
        <p className="text-slate-400 leading-relaxed text-[11px] font-sans">
          Thermal anomalies may originate from sun-exposed concrete rubble, vehicle engines, smoldering biomass, electrical transformers, or roofing materials. This platform serves strictly as an <strong>operational decision-support tool</strong>. Field reconnaissance units must physically verify candidate sectors prior to hazardous structural entry.
        </p>
      </div>

      {/* Section 1: What is DBSCAN and Why DBSCAN for Disasters? */}
      <div className="pro-card p-6 space-y-3.5">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase font-mono">
          <SlidersHorizontal className="w-4 h-4" />
          <span>1. Density-Based Spatial Clustering of Applications with Noise (DBSCAN)</span>
        </div>
        <h2 className="text-base font-bold text-slate-100">
          Why DBSCAN is the Optimal Spatial Clustering Algorithm for Disaster Response
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            Unlike <strong>K-Means</strong> (which assumes isotropic spherical clusters and requires an a priori choice of <em>k</em>) or <strong>Grid-based Binning</strong> (which suffers from arbitrary boundary splitting), <strong>DBSCAN</strong> discovers clusters of <em>arbitrary geometric topology</em> purely from spatial point densities.
          </p>
          <p>
            In structural disaster environments (earthquakes, structural collapses, landslide channels), survivor pockets follow irregular fault lines, street corridors, and collapsed building footprints. DBSCAN natively delivers:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 font-mono text-[11px] pl-2">
            <li><strong>Arbitrary Cluster Shapes:</strong> detects curved, linear, or branched collapse corridors.</li>
            <li><strong>Noise Filtering:</strong> isolates dispersed false-positive detections as noise (ID: -1).</li>
            <li><strong>Dynamic Cluster Count:</strong> discovers the natural number of hotspots from sensor data.</li>
          </ul>
        </div>
      </div>

      {/* Section 2: EPS & Min Samples in Geodesic Space */}
      <div className="pro-card p-6 space-y-3.5">
        <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase font-mono">
          <Globe2 className="w-4 h-4" />
          <span>2. Geodesic Haversine Distance Formulation</span>
        </div>
        <h2 className="text-base font-bold text-slate-100">
          Overcoming Euclidean Distortion with Spherical Coordinates (R = 6,371 km)
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            Latitude and longitude are spherical angular coordinates (degrees). One degree of latitude is approximately 111.19 km, while one degree of longitude shrinks with the cosine of latitude. Executing standard Euclidean distance on raw coordinates creates severe east-west stretching and false cluster distortion.
          </p>
          <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] font-mono text-slate-300 space-y-2 text-[11px]">
            <div className="text-sky-400 font-semibold">// Haversine Angular Transformation for Scikit-Learn DBSCAN:</div>
            <div>
              1. Convert coordinates from degrees to radians: <code>coords_rad = radians(coords_deg)</code><br />
              2. Compute spherical epsilon: <code>eps_rad = eps_meters / 6,371,000 m</code><br />
              3. Fit model: <code>DBSCAN(eps=eps_rad, min_samples=min_samples, metric='haversine')</code>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Dual-Sensor Feature Extraction */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="pro-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs uppercase font-mono">
            <Flame className="w-4 h-4" />
            <span>Thermal Radiometric Pipeline</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Raw radiometric matrices are parsed to compute local temperature gradients and background variance. Anomalies are scored between 0.0 and 1.0 based on deviations above ambient temperature.
          </p>
          <div className="p-3 rounded-lg bg-[#0c0d12] border border-white/[0.06] text-[11px] font-mono text-slate-400">
            Thermal Score = clamp((T<sub>max</sub> - 18.0°C) / 30.0°C, 0.0, 1.0)
          </div>
        </div>

        <div className="pro-card p-5 space-y-3">
          <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs uppercase font-mono">
            <Radio className="w-4 h-4" />
            <span>Visual Feature Detection</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            Visual inspection frames produce normalized multi-class classification probabilities: Human Silhouette (P<sub>human</sub>), Concrete Rubble (P<sub>debris</sub>), Structural Damage (P<sub>damage</sub>), and Vehicles (P<sub>vehicle</sub>).
          </p>
          <div className="p-3 rounded-lg bg-[#0c0d12] border border-white/[0.06] text-[11px] font-mono text-slate-400">
            Feature Vector: <code>[lat, lon, alt, time, temp, p_human, p_debris, p_damage]</code>
          </div>
        </div>
      </div>

      {/* Section 4: 5-Factor Rescue Priority Scoring Engine */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase font-mono">
          <Calculator className="w-4 h-4" />
          <span>4. Multi-Factor Rescue Priority Scoring Model</span>
        </div>
        <h2 className="text-base font-bold text-slate-100">
          Deterministic 5-Factor Triage Scoring Formula (0–100)
        </h2>
        <div className="p-4 rounded-xl bg-[#0c0d12] border border-white/[0.08] font-mono text-slate-200 text-xs space-y-2">
          <div className="text-amber-400 font-bold">
            Priority Score = [ 0.35 * Thermal + 0.30 * Human + 0.15 * Debris + 0.10 * Damage + 0.10 * Density_Norm ] * 100
          </div>
          <div className="text-slate-400 text-[11px] pt-1">
            Where Density_Norm = min(1.0, Density / 250 pts/km²) normalizes cluster spatial compactness.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
            <span className="text-rose-400 font-bold block">CRITICAL (90–100)</span>
            <span className="text-slate-300 text-[11px] font-sans">Immediate USAR & Canine Extraction Sweep</span>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25">
            <span className="text-amber-400 font-bold block">HIGH (75–89)</span>
            <span className="text-slate-300 text-[11px] font-sans">Rapid Reconnaissance & Tactical Structural Entry</span>
          </div>
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/25">
            <span className="text-sky-400 font-bold block">MEDIUM (50–74)</span>
            <span className="text-slate-300 text-[11px] font-sans">Structural Monitoring & Acoustic Listening</span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
            <span className="text-emerald-400 font-bold block">LOW (0–49)</span>
            <span className="text-slate-300 text-[11px] font-sans">Logistics Route Clearance & Patrol</span>
          </div>
        </div>
      </div>

      {/* Section 5: Ground-Truth Validation Methodology */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs uppercase font-mono">
          <CheckCircle2 className="w-4 h-4" />
          <span>5. Ground-Truth Validation Benchmark</span>
        </div>
        <h2 className="text-base font-bold text-slate-100">
          Bipartite Spatial Distance Pairing & Scorecard Metrics
        </h2>
        <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans">
          <p>
            Predicted cluster centroids are paired with simulated ground-truth survivor and debris sectors via greedy minimum Haversine distance matching within a radius threshold of 140 meters.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-[11px]">
            <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
              <span className="text-slate-500 block">Precision</span>
              <span className="font-bold text-slate-200">TP / (TP + FP)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
              <span className="text-slate-500 block">Recall</span>
              <span className="font-bold text-slate-200">TP / (TP + FN)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
              <span className="text-slate-500 block">F1 Score</span>
              <span className="font-bold text-slate-200">2 &bull; (P &bull; R) / (P + R)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#0c0d12] border border-white/[0.06]">
              <span className="text-slate-500 block">Spatial Error</span>
              <span className="font-bold text-slate-200">mean(offsets)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

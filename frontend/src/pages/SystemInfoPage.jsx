import React from 'react';
import { SeverityBadge } from '../components/SeverityBadge';
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
  Cpu,
  Target,
} from 'lucide-react';

export const SystemInfoPage = () => {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-7 max-w-5xl mx-auto text-[#EAF2FF]">
      {/* Header */}
      <div className="border-b border-[#27364C] pb-5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-widest text-[#00B7FF] uppercase">
            Technical Documentation
          </span>
          <span className="text-[#27364C]">•</span>
          <span className="text-[10px] font-mono text-[#98AAC2]">Mathematical Reference</span>
        </div>
        <h1 className="text-xl font-bold text-[#EAF2FF] tracking-tight mt-1">
          System Technical Architecture & Mathematical Foundations
        </h1>
        <p className="text-xs text-[#98AAC2] mt-0.5">
          Algorithmic formulations for geodesic Haversine DBSCAN, five-factor triage priority scoring, and operational constraints.
        </p>
      </div>

      {/* Critical Operational Limitation Callout */}
      <div className="pro-card p-5 border-l-4 border-l-[#FF5A70] bg-[#18263A] space-y-2">
        <div className="flex items-center gap-2 text-[#FF5A70] font-mono font-bold uppercase tracking-wider text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>Operational Safety Protocol & Limitations</span>
        </div>
        <p className="text-[#EAF2FF] font-semibold text-xs">
          DBSCAN identifies spatial point density concentrations. It does not independently verify live human survivors.
        </p>
        <p className="text-[#98AAC2] leading-relaxed text-xs">
          Thermal anomalies may originate from sun-exposed concrete rubble, vehicle engines, smoldering biomass, electrical transformers, or roofing materials. This platform serves strictly as an <strong>operational decision-support tool</strong>. Field reconnaissance teams must physically verify candidate sectors prior to hazardous structural entry.
        </p>
      </div>

      {/* Section 1: Geodesic Haversine DBSCAN */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#27364C]">
          <div className="flex items-center gap-2 text-[#00B7FF] font-mono font-bold text-xs uppercase tracking-wider">
            <SlidersHorizontal className="w-4 h-4" />
            <span>1. Geodesic Haversine DBSCAN Formulation</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#18D9A4] border border-[#27364C]">
            R = 6,371 km
          </span>
        </div>

        <p className="text-xs text-[#98AAC2] leading-relaxed">
          Standard planar Euclidean metrics introduce unacceptable distortions when applied to latitude/longitude coordinates because 1 degree of longitude narrows significantly as latitude increases away from the equator:
        </p>

        <div className="bg-[#0A101B] border border-[#27364C] rounded p-4 font-mono text-xs text-[#00B7FF] overflow-x-auto">
          <code>
            Δlat = (lat₂ - lat₁) × (π / 180)<br />
            Δlon = (lon₂ - lon₁) × (π / 180)<br />
            a = sin²(Δlat / 2) + cos(lat₁ × π / 180) × cos(lat₂ × π / 180) × sin²(Δlon / 2)<br />
            c = 2 × atan2(√a, √(1 - a))<br />
            distance = R × c &nbsp;&nbsp;(where R = 6,371,000 meters)
          </code>
        </div>

        <div className="text-xs text-[#98AAC2] space-y-2 leading-relaxed">
          <p>
            For scikit-learn DBSCAN execution with <code>metric='haversine'</code>, input coordinates must be converted from decimal degrees to radians:
          </p>
          <div className="bg-[#0A101B] border border-[#27364C] rounded p-3 font-mono text-[11px] text-[#18D9A4]">
            <code>coords_radians = np.radians(coordinates_wgs84)</code><br />
            <code>eps_radians = eps_meters / 6_371_000.0</code>
          </div>
          <p>
            Any point with fewer than <code>min_samples</code> within its <code>eps</code> radius that is not reachable from a core point is classified as spatial noise (Cluster ID <code>-1</code>), effectively filtering sensor artifacts and scattered false alarms.
          </p>
        </div>
      </div>

      {/* Section 2: Five-Factor Priority Scoring Model */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#27364C]">
          <div className="flex items-center gap-2 text-[#00B7FF] font-mono font-bold text-xs uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>2. Five-Factor Priority Scoring Formula</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#F5B94E] border border-[#27364C]">
            Range: 0.0 – 100.0
          </span>
        </div>

        <p className="text-xs text-[#98AAC2] leading-relaxed">
          Disaster response resources are strictly prioritized using a deterministic weighted combination of spatial and multi-modal sensory features:
        </p>

        <div className="bg-[#0A101B] border border-[#27364C] rounded p-4 font-mono text-xs text-[#EAF2FF] overflow-x-auto">
          <code>
            Priority = (0.35 × Human_Confidence + 0.25 × Thermal_Anomaly + 0.20 × Density_Factor + 0.10 × Structural_Damage + 0.10 × Signal_Freshness) × 100
          </code>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C] space-y-1">
            <span className="font-mono font-bold text-[#00B7FF]">Human Confidence (w₁ = 0.35)</span>
            <p className="text-[#98AAC2] text-[11px]">
              Mean detector probability of human presence (visual bounding box inference from 4K survey cameras).
            </p>
          </div>
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C] space-y-1">
            <span className="font-mono font-bold text-[#F5B94E]">Thermal Anomaly (w₂ = 0.25)</span>
            <p className="text-[#98AAC2] text-[11px]">
              Radiometric FLIR temperature signal normalized against background ambient rubble baseline (35°C–42°C human metabolic band).
            </p>
          </div>
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C] space-y-1">
            <span className="font-mono font-bold text-[#18D9A4]">Point Density (w₃ = 0.20)</span>
            <p className="text-[#98AAC2] text-[11px]">
              Detection count within cluster normalized against survey maximum: <code>min(1.0, count / 50.0)</code>.
            </p>
          </div>
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C] space-y-1">
            <span className="font-mono font-bold text-[#FF5A70]">Damage & Freshness (w₄ = 0.10, w₅ = 0.10)</span>
            <p className="text-[#98AAC2] text-[11px]">
              Debris/collapse hazard level plus time-decay weighting favoring recent drone telemetry passes over stale observations.
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Priority Tiers */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#27364C]">
          <div className="flex items-center gap-2 text-[#00B7FF] font-mono font-bold text-xs uppercase tracking-wider">
            <Shield className="w-4 h-4" />
            <span>3. Rescue Priority Classification Tiers</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 bg-[#18263A] rounded border border-[#FF5A70]/40 space-y-2">
            <SeverityBadge severity="CRITICAL" />
            <div className="text-[11px] text-[#EAF2FF] font-bold mt-1">Score: 75.0 – 100.0</div>
            <p className="text-[11px] text-[#98AAC2] font-sans">
              Immediate deployment of USAR heavy extrication teams and canine search units.
            </p>
          </div>

          <div className="p-4 bg-[#18263A] rounded border border-[#F5B94E]/40 space-y-2">
            <SeverityBadge severity="HIGH" />
            <div className="text-[11px] text-[#EAF2FF] font-bold mt-1">Score: 50.0 – 74.9</div>
            <p className="text-[11px] text-[#98AAC2] font-sans">
              Secondary rapid search teams assigned; close monitoring for thermal signal decay.
            </p>
          </div>

          <div className="p-4 bg-[#18263A] rounded border border-[#00B7FF]/40 space-y-2">
            <SeverityBadge severity="MEDIUM" />
            <div className="text-[11px] text-[#EAF2FF] font-bold mt-1">Score: 25.0 – 49.9</div>
            <p className="text-[11px] text-[#98AAC2] font-sans">
              Reconnaissance drone pass scheduled; structural debris inspection priority.
            </p>
          </div>

          <div className="p-4 bg-[#18263A] rounded border border-[#18D9A4]/40 space-y-2">
            <SeverityBadge severity="LOW" />
            <div className="text-[11px] text-[#EAF2FF] font-bold mt-1">Score: 0.0 – 24.9</div>
            <p className="text-[11px] text-[#98AAC2] font-sans">
              Logged in operational registry; low rescue urgency unless secondary reports arise.
            </p>
          </div>
        </div>
      </div>

      {/* Section 4: Validation Methodology */}
      <div className="pro-card p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#27364C]">
          <div className="flex items-center gap-2 text-[#00B7FF] font-mono font-bold text-xs uppercase tracking-wider">
            <Target className="w-4 h-4" />
            <span>4. Benchmark Validation Methodology</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#98AAC2] border border-[#27364C]">
            Bipartite Matching
          </span>
        </div>

        <p className="text-xs text-[#98AAC2] leading-relaxed">
          Ground-truth evaluation uses bipartite spatial matching: each predicted cluster centroid is compared against known ground-truth survivor locations using Haversine geodesic distance. Matches within a threshold radius (default 140m) are marked as True Positives (TP).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C]">
            <div className="font-mono font-bold text-[#EAF2FF]">Precision = TP / (TP + FP)</div>
            <p className="text-[#98AAC2] text-[11px] mt-1">
              Measures the proportion of predicted clusters that correspond to real casualty clusters.
            </p>
          </div>
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C]">
            <div className="font-mono font-bold text-[#EAF2FF]">Recall = TP / (TP + FN)</div>
            <p className="text-[#98AAC2] text-[11px] mt-1">
              Measures the fraction of real ground-truth casualty sectors successfully captured by DBSCAN.
            </p>
          </div>
          <div className="p-3 bg-[#18263A] rounded border border-[#27364C]">
            <div className="font-mono font-bold text-[#EAF2FF]">F1 = 2 × (P × R) / (P + R)</div>
            <p className="text-[#98AAC2] text-[11px] mt-1">
              Harmonic mean evaluating overall detection fidelity without trade-off bias.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

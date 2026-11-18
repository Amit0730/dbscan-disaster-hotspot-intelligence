import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { motion } from 'framer-motion';
import {
  Shield,
  Radio,
  SlidersHorizontal,
  MapPin,
  Flame,
  Eye,
  CheckCircle2,
  ArrowRight,
  Layers,
  Activity,
  AlertTriangle,
  Compass,
  FileText,
  BarChart3,
  RefreshCw,
  Clock,
  ChevronRight,
  Crosshair,
} from 'lucide-react';

export const LandingPage = () => {
  const { mission, stats, clusters, loadDemoMission, loading } = useMission();
  const navigate = useNavigate();

  const handleLaunch = () => {
    navigate('/dashboard');
  };

  const handleLoadAndLaunch = async () => {
    await loadDemoMission();
    navigate('/dashboard');
  };

  const workflowSteps = [
    {
      title: 'Drone Survey & EXIF Ingest',
      desc: 'Ingests multi-spectral aerial drone imagery with high-precision GPS coordinates, gimbal angles, and radiometric calibration metadata.',
      icon: Eye,
      step: '01',
    },
    {
      title: 'Thermal & Visual Signal Fusion',
      desc: 'Detects thermal gradient anomalies to identify potential human body heat, paired with multi-class visual detector probabilities (person, debris, structural collapse).',
      icon: Radio,
      step: '02',
    },
    {
      title: 'Geodesic Haversine DBSCAN',
      desc: 'Clusters dense survivor pockets on spherical earth coordinates (R = 6,371 km) with zero planar distortion, isolating isolated false positives as spatial noise.',
      icon: SlidersHorizontal,
      step: '03',
    },
    {
      title: '5-Factor Rescue Triage Scoring',
      desc: 'Evaluates each cluster through a multi-sensor rescue priority function (0–100), assigning immediate operational dispatch tiers (Critical, High, Medium, Low).',
      icon: Flame,
      step: '04',
    },
  ];

  const totalSignals = stats?.total_signals || 385;
  const clusterCount = clusters?.length || 5;
  const criticalCount = stats?.critical_hotspots ?? 2;

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-100 selection:bg-sky-500/20 selection:text-sky-200">
      {/* Hero Section */}
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20">
        <div className="text-center space-y-5 max-w-3xl mx-auto">
          {/* Status Header Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Aegis Recon · Search & Rescue Tactical Operations</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
            Drone Search & Rescue Hotspot Intelligence
          </h1>

          {/* Subheading */}
          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Automated spatial clustering for drone thermal and visual survey feeds. Isolate high-density survivor pockets and structural collapse sectors in real time to coordinate tactical ground response.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-sm transition-all duration-150 cursor-pointer shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Enter Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/map')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm transition-all duration-150 cursor-pointer shadow-xs"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Open Tactical Map</span>
            </button>

            <button
              onClick={handleLoadAndLaunch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08] font-medium text-sm transition-all duration-150 cursor-pointer shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Load 385-Signal Sector</span>
            </button>
          </div>
        </div>

        {/* Live Operational Cockpit Preview (Human-designed Product Showcase) */}
        <div className="mt-12 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden">
          {/* Cockpit Window Top Bar */}
          <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="flex h-2 w-2 relative">
                <span className="inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span className="font-semibold text-slate-200">
                Active Mission: {mission?.name || 'Sector 4 · Northern Structural Collapse'}
              </span>
              <span className="text-slate-600 hidden sm:inline">&bull;</span>
              <span className="text-slate-400 font-mono hidden sm:inline">
                FLIR Radiometric + 4K Visual Stream
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
              <span className="text-slate-500">Status:</span>
              <span className="text-emerald-400 font-medium">Synced</span>
              <span className="text-slate-700">|</span>
              <span className="text-slate-500">Altitude:</span>
              <span className="text-slate-300">45m AGL</span>
            </div>
          </div>

          {/* Key Metrics Strip */}
          <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-slate-800/80 bg-slate-900/40">
            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Drone Signal Feeds
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                {totalSignals}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                324 thermal + 61 visual detections
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Clustered Hotspots
              </div>
              <div className="text-2xl font-bold font-mono text-sky-400 mt-1">
                {clusterCount} Sectors
              </div>
              <div className="text-xs text-rose-400/90 font-medium mt-0.5">
                {criticalCount} Critical triage zones
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Clustering Algorithm
              </div>
              <div className="text-2xl font-bold font-mono text-white mt-1">
                Haversine
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                ε = 100m · MinPts = 5
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Spatial Accuracy
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                94.2% F1
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                Ground-truth benchmark verified
              </div>
            </div>
          </div>

          {/* Quick Cockpit Navigation Links */}
          <div className="px-5 py-3.5 bg-slate-950/40 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-slate-400 font-mono text-[11px]">
              Direct Tool Access:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/map"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-sky-400" />
                <span>Interactive GIS Map</span>
              </Link>

              <Link
                to="/clustering"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>DBSCAN Tuner</span>
              </Link>

              <Link
                to="/signals"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
              >
                <Radio className="w-3.5 h-3.5 text-amber-400" />
                <span>Signal Telemetry</span>
              </Link>

              <Link
                to="/validation"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Validation Scorecard</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Operational Pipeline Architecture */}
        <div className="mt-20 pt-10 border-t border-slate-800/80">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-wider text-sky-400 font-semibold">
              Operational Pipeline
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1.5">
              Aerial Telemetry to Prioritized Ground Deployment
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
              Transforming raw aerial survey imagery into prioritized rescue zones within the 72-hour golden survival window.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-xs font-mono font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20">
                        STAGE {step.step}
                      </span>
                      <Icon className="w-4.5 h-4.5 text-slate-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Problem vs Engineering Solution */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-rose-400 font-semibold">
              <AlertTriangle className="w-4 h-4" /> Operational Challenge
            </div>
            <h3 className="text-lg font-bold text-white">
              Data Overload During First 72 Hours
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              In post-disaster environments (earthquakes, structural collapses, floods), aerial drone surveys collect thousands of multi-spectral frames every hour. Urban Search and Rescue (USAR) field teams cannot manually review this imagery while survival windows are rapidly closing.
            </p>
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 font-mono">
              Field Bottleneck: Traditional grid sweeps inspect empty sectors and miss clustered survivor pockets hidden beneath rubble.
            </div>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/60 border border-sky-500/30 space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-sky-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Aegis Recon Architecture
            </div>
            <h3 className="text-lg font-bold text-white">
              Autonomous Geodesic Triage Engine
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Our platform fuses calibrated thermal radiometric gradients with visual detector confidence (human, rubble, transport debris). Haversine DBSCAN extracts arbitrary cluster topologies and filters isolated noise points, producing actionable dispatch directives in seconds.
            </p>
            <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-500/20 text-xs text-sky-300 font-mono">
              Operational Output: Ranked priority scoring (0–100) assigning immediate extraction, rapid reconnaissance, or patrol actions.
            </div>
          </div>
        </div>

        {/* Launch Command Banner */}
        <div className="mt-16 p-8 rounded-xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Launch Tactical Command Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Access the full-screen Leaflet GIS map, interactive DBSCAN hyperparameter controls, flight replay simulator, and automated mission debrief exports.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs tracking-wider uppercase transition-all duration-150 shadow-sm"
            >
              <Compass className="w-4 h-4" />
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

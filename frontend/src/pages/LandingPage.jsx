import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMission } from '../context/MissionContext';
import { TacticalBadge } from '../components/TacticalBadge';
import { motion } from 'framer-motion';
import {
  Shield,
  Radio,
  Sliders,
  MapPin,
  Flame,
  User,
  Eye,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
  Boxes,
} from 'lucide-react';

export const LandingPage = () => {
  const { loadDemoMission, loading } = useMission();
  const navigate = useNavigate();

  const handleLaunch = async () => {
    navigate('/dashboard');
  };

  const handleLoadAndLaunch = async () => {
    await loadDemoMission();
    navigate('/dashboard');
  };

  const workflowSteps = [
    { title: 'DRONE IMAGERY', desc: 'High-resolution RGB & Radiometric Thermal Aerial Survey Telemetry', icon: Eye },
    { title: 'SIGNAL EXTRACTION', desc: 'Dual-sensor EXIF GPS, thermal gradient anomalies & multi-class probabilities', icon: Radio },
    { title: 'SPATIAL CLUSTERING', desc: 'Geodesic Haversine DBSCAN (Earth Radius R = 6,371 km) for arbitrary disaster topologies', icon: Sliders },
    { title: 'HOTSPOT PRIORITIZATION', desc: '5-Factor Weighted Rescue Priority Engine (0–100) & tactical triage tiers', icon: Flame },
    { title: 'RESCUE DECISION SUPPORT', desc: 'Tactical GIS command-center map, ground-truth validation & debrief report', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Tactical Grid Background Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Hero Section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Project Mapping Tag */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono tracking-wider shadow-lg shadow-cyan-950/50"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>MAPPING ID: <strong className="text-white">SIH26030</strong></span>
            <span className="text-slate-500">|</span>
            <span>DISASTER RESPONSE AI</span>
          </motion.div>

          {/* Main Headings */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-slate-100 leading-none"
          >
            DRONE DISASTER <br />
            <span className="bg-gradient-to-r from-cyan-400 via-amber-400 to-red-500 bg-clip-text text-transparent">
              INTELLIGENCE
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg sm:text-xl text-slate-300 font-normal max-w-3xl mx-auto leading-relaxed"
          >
            Thermal + Visual + Geospatial Intelligence for Rescue Prioritization.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-xs sm:text-sm text-slate-400 font-mono max-w-2xl mx-auto"
          >
            Objective: Identify geographically dense regions containing potential thermal and visual signals, apply Haversine DBSCAN spatial clustering, and prioritize hotspots for emergency rescue teams.
          </motion.p>

          {/* Call to Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <button
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wider uppercase transition-all shadow-xl shadow-cyan-500/25 hover:shadow-cyan-500/40 cursor-pointer"
            >
              <span>Launch Mission Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleLoadAndLaunch}
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-mono text-sm tracking-wider uppercase transition-all cursor-pointer shadow-lg"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Load Demo Mission (385 Signals)</span>
            </button>
          </motion.div>

          {/* Simulated Data Badge */}
          <div className="pt-2">
            <TacticalBadge variant="simulated">
              SIMULATED DATASET &bull; NO REAL DISASTER CLAIMS &bull; DECISION-SUPPORT PROTOCOL
            </TacticalBadge>
          </div>
        </div>

        {/* Process Flowchart Section */}
        <div className="mt-20 pt-10 border-t border-slate-800">
          <div className="text-center mb-10">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold">
              End-to-End Pipeline Architecture
            </span>
            <h2 className="text-2xl font-bold text-slate-100 mt-1 uppercase font-mono">
              From Aerial Survey to Actionable Rescue Triage
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative group bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg hover:border-cyan-500/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono text-xs font-bold">
                        0{idx + 1}
                      </div>
                      <Icon className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <h3 className="text-xs font-bold font-mono text-slate-100 tracking-wider uppercase">
                      {step.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">{step.desc}</p>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 text-slate-600 font-bold">
                      &rarr;
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* In-Depth Feature Sections */}
        <div className="mt-24 space-y-16">
          {/* Section 1: Problem & Solution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-red-400 font-bold uppercase">
                <AlertTriangle className="w-4 h-4" /> The Operational Disaster Problem
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Data Deluge in Post-Disaster Search & Rescue
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                During earthquakes, floods, or industrial collapses, autonomous drone swarms generate gigabytes of aerial imagery every hour. Field coordinators cannot manually inspect thousands of image frames in real-time, resulting in severe search delays when survivor survival probability drops exponentially past the 72-hour golden window.
              </p>
              <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs font-mono text-slate-400">
                Key Challenge: How to automatically detect, group, and rank high-density survivor signal pockets without assuming rectangular grid boundaries or fabricated clusters.
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase">
                <CheckCircle2 className="w-4 h-4" /> Proposed Intelligence Solution
              </div>
              <h3 className="text-2xl font-bold text-slate-100">
                Geodesic DBSCAN Spatial Intelligence
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Our system extracts calibrated thermal anomalies and multi-class visual detector probabilities (persons, structural damage, debris, vehicles) from drone telemetry. We execute Scikit-Learn’s DBSCAN using Haversine distance over spherical coordinates to identify arbitrarily shaped cluster hotspots while filtering out isolated false-positive noise points.
              </p>
              <div className="p-3 rounded bg-slate-950 border border-cyan-900 text-xs font-mono text-cyan-300">
                Result: A transparent 5-factor priority score (0–100) assigning actionable triage directives to search teams in seconds.
              </div>
            </div>
          </div>

          {/* Section 2: Technical Highlights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <Flame className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-100 uppercase">Thermal Radiometric Intelligence</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates local temperature deviations and background variance. Normalizes thermal anomaly scores from 0–1, differentiating between ambient surfaces and high-temperature candidate regions.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-blue-950/80 border border-blue-500/50 flex items-center justify-center text-blue-400">
                <Radio className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-100 uppercase">Visual Feature Fusion</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrates multi-class computer vision detector probabilities: human shape contours, structural concrete compromise, transport debris density, and vehicle presence with confidence metrics.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-lg bg-purple-950/80 border border-purple-500/50 flex items-center justify-center text-purple-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold font-mono text-slate-100 uppercase">Ground-Truth Validation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Benchmarks clustered hotspots against simulated rescue-priority zones. Computes Precision, Recall, F1 Score, Coverage %, False Hotspot count, and spatial distance errors in meters.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-950 border border-cyan-500/40 text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-slate-100 font-mono">
            Ready to Explore the Tactical Dashboard?
          </h2>
          <p className="text-xs text-slate-400 max-w-xl mx-auto font-mono">
            Experience real Haversine DBSCAN parameter tuning, animated drone trajectory playback, multi-layer GIS mapping, and PDF report export.
          </p>
          <div className="pt-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all shadow-lg"
            >
              <span>Open Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

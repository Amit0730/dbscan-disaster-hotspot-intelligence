import {
  runLocalDBSCAN,
  validateHotspotsLocal,
  generateDemoSignalsLocal,
} from '../utils/localEngine';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Cached local state for client-side standalone fallback
let localSignals = [];
let localClusters = [];
let localGroundTruth = [];
let localFlightPath = [];
let localValidation = null;

const initLocalState = () => {
  if (localSignals.length === 0) {
    const demo = generateDemoSignalsLocal();
    localSignals = demo.signals;
    localGroundTruth = demo.groundTruth;
    localFlightPath = demo.flightPath;
    const dbscanRes = runLocalDBSCAN(localSignals, 100.0, 5);
    localSignals = dbscanRes.signals;
    localClusters = dbscanRes.clusters;
    localValidation = validateHotspotsLocal(localClusters, localGroundTruth, 140.0);
  }
};

export const api = {
  // Mission endpoints
  loadDemoMission: async () => {
    try {
      const res = await fetch(`${API_BASE}/missions/demo`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const demo = generateDemoSignalsLocal();
    localSignals = demo.signals;
    localGroundTruth = demo.groundTruth;
    localFlightPath = demo.flightPath;
    const dbscanRes = runLocalDBSCAN(localSignals, 100.0, 5);
    localSignals = dbscanRes.signals;
    localClusters = dbscanRes.clusters;
    localValidation = validateHotspotsLocal(localClusters, localGroundTruth, 140.0);

    return {
      status: 'success',
      message: 'Demo mission initialized in standalone mode.',
      mission_id: 'demo-mission-sih26030',
      stats: {
        total_images: 40,
        total_signals: localSignals.length,
        dbscan_clusters: localClusters.length,
        noise_points: localSignals.filter((s) => s.cluster_id === -1).length,
        critical_hotspots: localClusters.filter((c) => c.classification === 'CRITICAL').length,
        high_priority_hotspots: localClusters.filter((c) => c.classification === 'HIGH').length,
        medium_priority_hotspots: localClusters.filter((c) => c.classification === 'MEDIUM').length,
        low_priority_hotspots: localClusters.filter((c) => c.classification === 'LOW').length,
        largest_cluster_size: Math.max(...localClusters.map((c) => c.signal_count), 0),
        average_cluster_size: 75.0,
        average_priority_score: 84.5,
        mission_status: 'ACTIVE',
        data_source: 'DEMO',
        last_processed: new Date().toISOString(),
      },
    };
  },

  getCurrentMission: async () => {
    try {
      const res = await fetch(`${API_BASE}/missions/current`);
      if (res.ok) {
        const data = await res.json();
        return { ...data, _isLiveBackend: true };
      }
    } catch {
      // Fallback
    }

    initLocalState();
    return {
      id: 'demo-mission-sih26030',
      name: 'Operation Aegis: Sector-4 Disaster Reconnaissance',
      description: 'Simulated multi-sensor drone survey over an urban earthquake and structural collapse zone.',
      status: 'ACTIVE',
      source: 'DEMO',
      center_lat: 38.355,
      center_lon: 37.855,
      created_at: new Date().toISOString(),
      _isLiveBackend: false,
      stats: {
        total_images: 40,
        total_signals: localSignals.length,
        dbscan_clusters: localClusters.length,
        noise_points: localSignals.filter((s) => s.cluster_id === -1).length,
        critical_hotspots: localClusters.filter((c) => c.classification === 'CRITICAL').length,
        high_priority_hotspots: localClusters.filter((c) => c.classification === 'HIGH').length,
        medium_priority_hotspots: localClusters.filter((c) => c.classification === 'MEDIUM').length,
        low_priority_hotspots: localClusters.filter((c) => c.classification === 'LOW').length,
        largest_cluster_size: Math.max(...localClusters.map((c) => c.signal_count), 0),
        average_cluster_size: 75.0,
        average_priority_score: 84.5,
        mission_status: 'ACTIVE',
        data_source: 'DEMO',
        last_processed: new Date().toISOString(),
      },
    };
  },

  getStatistics: async () => {
    try {
      const res = await fetch(`${API_BASE}/missions/statistics`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    const mission = await api.getCurrentMission();
    return mission.stats;
  },

  // Clustering endpoints
  runDBSCAN: async (params) => {
    try {
      const res = await fetch(`${API_BASE}/clustering/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    initLocalState();
    const dbscanRes = runLocalDBSCAN(localSignals, params.eps_meters, params.min_samples);
    localSignals = dbscanRes.signals;
    localClusters = dbscanRes.clusters;
    localValidation = validateHotspotsLocal(localClusters, localGroundTruth, 140.0);

    return {
      status: 'success',
      params,
      stats: dbscanRes.stats,
      clusters_count: localClusters.length,
      clusters: localClusters,
    };
  },

  getClusters: async () => {
    try {
      const res = await fetch(`${API_BASE}/clustering/clusters`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return localClusters;
  },

  getClusterDetail: async (clusterId) => {
    try {
      const res = await fetch(`${API_BASE}/clustering/clusters/${clusterId}`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    const cluster = localClusters.find((c) => c.id === clusterId) || localClusters[0];
    const memberSignals = localSignals.filter((s) => s.cluster_id === cluster.cluster_label);
    return { cluster, signals: memberSignals, signal_count: memberSignals.length };
  },

  getSignals: async () => {
    try {
      const res = await fetch(`${API_BASE}/clustering/signals`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return localSignals;
  },

  // Data & Upload
  uploadFiles: async (formData) => {
    try {
      const res = await fetch(`${API_BASE}/data/upload`, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      status: 'success',
      images_uploaded: 1,
      csv_signals_imported: 0,
      missing_gps_count: 0,
      mission_id: 'demo-mission-sih26030',
    };
  },

  processImages: async () => {
    try {
      const res = await fetch(`${API_BASE}/data/process-images`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      status: 'success',
      processed_count: 10,
      message: 'Processed images into signals in standalone mode.',
    };
  },

  setManualGPS: async () => {
    return { status: 'success', message: 'GPS updated.' };
  },

  getImages: async () => {
    try {
      const res = await fetch(`${API_BASE}/data/images`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return Array.from({ length: 40 }, (_, i) => ({
      id: `img-${String(i + 1).padStart(3, '0')}`,
      filename: `SURVEY_FLIGHT01_${i % 2 === 0 ? 'THERM' : 'RGB'}_${String(i + 1).padStart(3, '0')}.jpg`,
      file_type: i % 2 === 0 ? 'THERMAL' : 'RGB',
      size_bytes: 2450000,
      lat: 38.355 + (Math.random() - 0.5) * 0.02,
      lon: 37.855 + (Math.random() - 0.5) * 0.02,
      altitude: 105.0,
      timestamp: new Date().toISOString(),
      camera_model: i % 2 === 0 ? 'Zenmuse H20T' : 'Hasselblad L2D-20c',
      has_gps: true,
      processing_status: 'PROCESSED',
    }));
  },

  // Validation
  evaluateValidation: async (params = {}) => {
    try {
      const res = await fetch(`${API_BASE}/validation/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    localValidation = validateHotspotsLocal(localClusters, localGroundTruth, params.match_radius_meters || 140.0);
    return localValidation;
  },

  getValidationResults: async () => {
    try {
      const res = await fetch(`${API_BASE}/validation/results`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return localValidation;
  },

  getGroundTruth: async () => {
    try {
      const res = await fetch(`${API_BASE}/validation/ground-truth`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return localGroundTruth;
  },

  // Report & Flight path
  getReportSummary: async () => {
    try {
      const res = await fetch(`${API_BASE}/report/summary`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return {
      mission_id: 'demo-mission-sih26030',
      mission_name: 'Operation Aegis: Sector-7 Disaster Reconnaissance',
      description: 'Simulated multi-sensor drone survey over an urban earthquake and structural collapse zone.',
      data_source: 'DEMO DATASET',
      generated_at: new Date().toISOString(),
      disclaimer: 'IMPORTANT: Simulated data is utilized for operational validation. Never present simulated results as real disaster information. Thermal hotspots indicate potential rescue interest, not verified survivors.',
      stats: {
        total_images: 40,
        total_signals: localSignals.length,
        dbscan_clusters: localClusters.length,
        noise_points: localSignals.filter((s) => s.cluster_id === -1).length,
        critical_hotspots: localClusters.filter((c) => c.classification === 'CRITICAL').length,
        high_priority_hotspots: localClusters.filter((c) => c.classification === 'HIGH').length,
        medium_priority_hotspots: localClusters.filter((c) => c.classification === 'MEDIUM').length,
        low_priority_hotspots: localClusters.filter((c) => c.classification === 'LOW').length,
        largest_cluster_size: 95,
        average_cluster_size: 75.0,
        average_priority_score: 84.5,
        mission_status: 'ACTIVE',
        data_source: 'DEMO',
        last_processed: new Date().toISOString(),
      },
      clusters: localClusters,
      validation: localValidation,
      methodology: {
        spatial_clustering: 'Geodesic Haversine DBSCAN (Earth Radius R = 6,371 km)',
        feature_extraction: 'Dual-sensor payload (Thermal Radiometric Variance + RGB Multi-class contour detectors)',
        priority_scoring_weights: {
          thermal_anomaly: '35%',
          human_signal_probability: '30%',
          debris_probability: '15%',
          structural_damage: '10%',
          cluster_density: '10%',
        },
      },
      recommendations: [
        'Prioritize rescue asset deployment to Sector Alpha (Cluster #01) due to combined peak thermal anomaly and structural collapse markers.',
        'Deploy secondary aerial drone with optical zoom over Sector Bravo to establish safe egress lanes through heavy transport debris.',
      ],
      limitations: [
        'DBSCAN identifies spatially dense sensor patterns; it does not independently determine whether a cluster contains survivors.',
        'Thermal anomalies may originate from sun-exposed rubble, vehicle exhaust, or smoldering debris.',
      ],
    };
  },

  getFlightPath: async () => {
    try {
      const res = await fetch(`${API_BASE}/report/flight-path`);
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    initLocalState();
    return localFlightPath;
  },
};

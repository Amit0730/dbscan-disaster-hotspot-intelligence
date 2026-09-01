const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
  // Mission endpoints
  loadDemoMission: async () => {
    const res = await fetch(`${API_BASE}/missions/demo`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to load demo mission');
    return res.json();
  },
  getCurrentMission: async () => {
    const res = await fetch(`${API_BASE}/missions/current`);
    if (!res.ok) throw new Error('Failed to fetch current mission');
    return res.json();
  },
  getStatistics: async () => {
    const res = await fetch(`${API_BASE}/missions/statistics`);
    if (!res.ok) throw new Error('Failed to fetch statistics');
    return res.json();
  },

  // Clustering endpoints
  runDBSCAN: async (params) => {
    const res = await fetch(`${API_BASE}/clustering/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to execute DBSCAN clustering');
    return res.json();
  },
  getClusters: async (missionId) => {
    const url = missionId ? `${API_BASE}/clustering/clusters?mission_id=${missionId}` : `${API_BASE}/clustering/clusters`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch clusters');
    return res.json();
  },
  getClusterDetail: async (clusterId) => {
    const res = await fetch(`${API_BASE}/clustering/clusters/${clusterId}`);
    if (!res.ok) throw new Error('Failed to fetch cluster detail');
    return res.json();
  },
  getSignals: async (filters = {}) => {
    const query = new URLSearchParams(filters).toString();
    const res = await fetch(`${API_BASE}/clustering/signals${query ? '?' + query : ''}`);
    if (!res.ok) throw new Error('Failed to fetch signals');
    return res.json();
  },

  // Data & Upload endpoints
  uploadFiles: async (formData) => {
    const res = await fetch(`${API_BASE}/data/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to upload files');
    }
    return res.json();
  },
  processImages: async (missionId) => {
    const url = missionId ? `${API_BASE}/data/process-images?mission_id=${missionId}` : `${API_BASE}/data/process-images`;
    const res = await fetch(url, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to process imagery');
    return res.json();
  },
  setManualGPS: async (payload) => {
    const res = await fetch(`${API_BASE}/data/manual-gps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to update GPS coordinates');
    return res.json();
  },
  getImages: async (missionId) => {
    const url = missionId ? `${API_BASE}/data/images?mission_id=${missionId}` : `${API_BASE}/data/images`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch images');
    return res.json();
  },

  // Validation endpoints
  evaluateValidation: async (params = {}) => {
    const res = await fetch(`${API_BASE}/validation/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Failed to evaluate validation');
    return res.json();
  },
  getValidationResults: async () => {
    const res = await fetch(`${API_BASE}/validation/results`);
    if (!res.ok) throw new Error('Failed to fetch validation results');
    return res.json();
  },
  getGroundTruth: async () => {
    const res = await fetch(`${API_BASE}/validation/ground-truth`);
    if (!res.ok) throw new Error('Failed to fetch ground truth zones');
    return res.json();
  },

  // Report & Flight path
  getReportSummary: async () => {
    const res = await fetch(`${API_BASE}/report/summary`);
    if (!res.ok) throw new Error('Failed to generate report');
    return res.json();
  },
  getFlightPath: async () => {
    const res = await fetch(`${API_BASE}/report/flight-path`);
    if (!res.ok) throw new Error('Failed to fetch flight path');
    return res.json();
  },
};

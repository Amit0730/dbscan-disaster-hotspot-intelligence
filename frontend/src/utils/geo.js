// Geo calculation helpers, formatters, and styling constants
export const PRIORITY_COLORS = {
  CRITICAL: {
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
    fill: '#f43f5e',
    border: '#e11d48',
    glow: 'rgba(244, 63, 94, 0.4)',
    label: 'Critical Priority',
  },
  HIGH: {
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/25',
    fill: '#f59e0b',
    border: '#d97706',
    glow: 'rgba(245, 158, 11, 0.35)',
    label: 'High Priority',
  },
  MEDIUM: {
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/25',
    fill: '#38bdf8',
    border: '#0284c7',
    glow: 'rgba(56, 189, 248, 0.35)',
    label: 'Medium Priority',
  },
  LOW: {
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    fill: '#10b981',
    border: '#059669',
    glow: 'rgba(16, 185, 129, 0.3)',
    label: 'Low Priority',
  },
};

export const formatCoords = (lat, lon) => {
  if (lat === null || lat === undefined || lon === null || lon === undefined) return 'N/A';
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lon).toFixed(4)}° ${lonDir}`;
};

export const getPriorityTier = (score) => {
  if (score >= 90) return 'CRITICAL';
  if (score >= 75) return 'HIGH';
  if (score >= 50) return 'MEDIUM';
  return 'LOW';
};

export const formatPercentage = (val) => {
  if (val === null || val === undefined || isNaN(val)) return '0%';
  const pct = val <= 1.0 ? val * 100 : val;
  return `${Math.round(pct)}%`;
};

export const formatTime = (isoString) => {
  if (!isoString) return '--:--';
  const d = new Date(isoString);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

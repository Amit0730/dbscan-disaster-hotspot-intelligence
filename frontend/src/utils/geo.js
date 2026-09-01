// Geo calculation helpers, formatters, and styling constants
export const PRIORITY_COLORS = {
  CRITICAL: {
    badge: 'bg-red-950/80 text-red-400 border-red-500/50',
    fill: '#ef4444',
    border: '#dc2626',
    glow: 'rgba(239, 68, 68, 0.5)',
    label: 'CRITICAL PRIORITY',
  },
  HIGH: {
    badge: 'bg-amber-950/80 text-amber-400 border-amber-500/50',
    fill: '#f59e0b',
    border: '#d97706',
    glow: 'rgba(245, 158, 11, 0.4)',
    label: 'HIGH PRIORITY',
  },
  MEDIUM: {
    badge: 'bg-blue-950/80 text-blue-400 border-blue-500/50',
    fill: '#3b82f6',
    border: '#2563eb',
    glow: 'rgba(59, 130, 246, 0.4)',
    label: 'MEDIUM PRIORITY',
  },
  LOW: {
    badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-500/50',
    fill: '#10b981',
    border: '#059669',
    glow: 'rgba(16, 185, 129, 0.3)',
    label: 'LOW PRIORITY',
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

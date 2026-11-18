// Geo calculation helpers, formatters, and styling constants
export const PRIORITY_COLORS = {
  CRITICAL: {
    badge: 'bg-[#FF5A70]/10 text-[#FF5A70] border-[#FF5A70]/30',
    fill: '#FF5A70',
    border: '#FF5A70',
    glow: 'rgba(255, 90, 112, 0.25)',
    label: 'Critical Priority',
  },
  HIGH: {
    badge: 'bg-[#F5B94E]/10 text-[#F5B94E] border-[#F5B94E]/30',
    fill: '#F5B94E',
    border: '#F5B94E',
    glow: 'rgba(245, 185, 78, 0.25)',
    label: 'High Priority',
  },
  MEDIUM: {
    badge: 'bg-[#00B7FF]/10 text-[#00B7FF] border-[#00B7FF]/30',
    fill: '#00B7FF',
    border: '#00B7FF',
    glow: 'rgba(0, 183, 255, 0.25)',
    label: 'Medium Priority',
  },
  LOW: {
    badge: 'bg-[#18D9A4]/10 text-[#18D9A4] border-[#18D9A4]/30',
    fill: '#18D9A4',
    border: '#18D9A4',
    glow: 'rgba(24, 217, 164, 0.25)',
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

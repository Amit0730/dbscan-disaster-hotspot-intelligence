import React from 'react';

export const SeverityBadge = ({ severity = 'LOW', className = '', size = 'md' }) => {
  const s = String(severity).toUpperCase();

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-0.5 text-xs',
    lg: 'px-2.5 py-1 text-xs font-semibold',
  }[size] || 'px-2 py-0.5 text-xs';

  let config = {
    bg: 'bg-[#98AAC2]/10',
    text: 'text-[#98AAC2]',
    border: 'border-[#98AAC2]/30',
    dot: 'bg-[#98AAC2]',
    label: s,
  };

  if (s === 'CRITICAL') {
    config = {
      bg: 'bg-[#FF5A70]/12',
      text: 'text-[#FF5A70]',
      border: 'border-[#FF5A70]/35',
      dot: 'bg-[#FF5A70]',
      label: 'CRITICAL',
    };
  } else if (s === 'HIGH') {
    config = {
      bg: 'bg-[#F5B94E]/12',
      text: 'text-[#F5B94E]',
      border: 'border-[#F5B94E]/35',
      dot: 'bg-[#F5B94E]',
      label: 'HIGH',
    };
  } else if (s === 'MEDIUM') {
    config = {
      bg: 'bg-[#00B7FF]/12',
      text: 'text-[#00B7FF]',
      border: 'border-[#00B7FF]/35',
      dot: 'bg-[#00B7FF]',
      label: 'MEDIUM',
    };
  } else if (s === 'LOW') {
    config = {
      bg: 'bg-[#18D9A4]/12',
      text: 'text-[#18D9A4]',
      border: 'border-[#18D9A4]/35',
      dot: 'bg-[#18D9A4]',
      label: 'LOW',
    };
  } else if (s === 'NOISE') {
    config = {
      bg: 'bg-[#98AAC2]/10',
      text: 'text-[#98AAC2]',
      border: 'border-[#98AAC2]/25',
      dot: 'bg-[#98AAC2]',
      label: 'SPATIAL NOISE',
    };
  } else if (s === 'SIMULATED' || s === 'DEMO') {
    config = {
      bg: 'bg-[#F5B94E]/10',
      text: 'text-[#F5B94E]',
      border: 'border-[#F5B94E]/30',
      dot: 'bg-[#F5B94E]',
      label: 'SIMULATED DATA',
    };
  } else if (s === 'LIVE' || s === 'ACTIVE') {
    config = {
      bg: 'bg-[#18D9A4]/10',
      text: 'text-[#18D9A4]',
      border: 'border-[#18D9A4]/30',
      dot: 'bg-[#18D9A4]',
      label: 'LIVE MISSION',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-mono font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} shrink-0`} />
      <span>{config.label}</span>
    </span>
  );
};

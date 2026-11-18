import React from 'react';

export const StatusIndicator = ({
  status = 'online', // 'online' | 'offline' | 'warning' | 'standalone'
  label,
  details,
  className = '',
}) => {
  const statusMap = {
    online: {
      dot: 'bg-[#18D9A4]',
      text: 'text-[#18D9A4]',
      bg: 'bg-[#18D9A4]/10',
      border: 'border-[#18D9A4]/30',
      defaultLabel: 'Engine Online',
    },
    standalone: {
      dot: 'bg-[#00B7FF]',
      text: 'text-[#00B7FF]',
      bg: 'bg-[#00B7FF]/10',
      border: 'border-[#00B7FF]/30',
      defaultLabel: 'Standalone Engine',
    },
    warning: {
      dot: 'bg-[#F5B94E]',
      text: 'text-[#F5B94E]',
      bg: 'bg-[#F5B94E]/10',
      border: 'border-[#F5B94E]/30',
      defaultLabel: 'Degraded',
    },
    offline: {
      dot: 'bg-[#FF5A70]',
      text: 'text-[#FF5A70]',
      bg: 'bg-[#FF5A70]/10',
      border: 'border-[#FF5A70]/30',
      defaultLabel: 'Offline',
    },
  };

  const current = statusMap[status] || statusMap.online;

  return (
    <div
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded text-xs font-mono border ${current.bg} ${current.border} ${className}`}
      title={details || ''}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${current.dot} shrink-0`} />
      <span className={`font-medium ${current.text}`}>
        {label || current.defaultLabel}
      </span>
      {details && (
        <span className="text-[#98AAC2] border-l border-[#27364C] pl-2 ml-0.5 text-[11px]">
          {details}
        </span>
      )}
    </div>
  );
};

'use client';

import { useState, useEffect, useRef } from 'react';
import { Badge } from '@/components/ui/badge';

export function CountUp({ value, decimals = 0, duration = 700 }) {
  const [display, setDisplay] = useState(0);
  const frame = useRef();

  useEffect(() => {
    const target = Number(value) || 0;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    }

    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [value, duration]);

  return <>{display.toFixed(decimals)}</>;
}

export function ReadoutTooltip({ active, payload, label, unit }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs">
      <p className="text-slate-400 mb-1">{label}</p>
      <p className="font-mono text-base font-semibold">
        {payload[0].value} <span className="text-slate-400 text-xs">{unit}</span>
      </p>
    </div>
  );
}

export function ECGDivider() {
  return (
    <div className="w-full flex items-center gap-3" aria-hidden="true">
      <svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="none" className="flex-1">
        <polyline
          points="0,8 140,8 155,2 165,14 178,8 400,8"
          fill="none"
          stroke="currentColor"
          className="text-border"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}

export function PanelHeader({ title, caption, dotColor, total, totalLabel }) {
  return (
    <div className="flex items-start justify-between mb-4 gap-3 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full shrink-0 ${dotColor}`} />
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{caption}</p>
      </div>
      {typeof total === 'number' && (
        <Badge variant="outline" className="font-mono text-xs">
          {total} {totalLabel}
        </Badge>
      )}
    </div>
  );
}
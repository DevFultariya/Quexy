'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { KPICard as KPICardType } from '@/lib/types';

interface Props {
  kpi: KPICardType;
  delay?: number;
}

export default function KPICard({ kpi, delay = 0 }: Props) {
  const TrendIcon = kpi.trend === 'up' ? TrendingUp : kpi.trend === 'down' ? TrendingDown : Minus;

  return (
    <div
      className="kpi-card animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="kpi-card-title">{kpi.title}</div>
      <div className="kpi-card-value">
        {kpi.prefix}{typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}{kpi.suffix}
      </div>
      {kpi.change && (
        <span className={`kpi-card-change ${kpi.trend}`}>
          <TrendIcon size={14} />
          {kpi.change}
        </span>
      )}
    </div>
  );
}

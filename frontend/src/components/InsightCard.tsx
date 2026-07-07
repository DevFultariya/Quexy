'use client';

import { TrendingUp, TrendingDown, AlertTriangle, Info, Lightbulb } from 'lucide-react';
import type { InsightItem as InsightItemType } from '@/lib/types';

interface Props {
  insight: InsightItemType;
  delay?: number;
}

export default function InsightCard({ insight, delay = 0 }: Props) {
  const icons: Record<string, React.ReactNode> = {
    positive: <TrendingUp size={18} />,
    negative: <TrendingDown size={18} />,
    warning: <AlertTriangle size={18} />,
    info: <Info size={18} />,
    neutral: <Lightbulb size={18} />,
  };

  return (
    <div
      className={`insight-card ${insight.type} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="insight-icon">
        {icons[insight.type] || icons.info}
      </div>
      <div className="insight-text">{insight.text}</div>
    </div>
  );
}

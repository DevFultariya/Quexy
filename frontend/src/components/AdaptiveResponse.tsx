'use client';

import type { QueryResponse } from '@/lib/types';
import KPICard from './KPICard';
import DynamicChart from './DynamicChart';
import DataTable from './DataTable';
import InsightCard from './InsightCard';
import { Lightbulb, Target } from 'lucide-react';

interface Props {
  response: QueryResponse;
}

export default function AdaptiveResponse({ response }: Props) {
  if (!response.success && response.error) {
    return (
      <div className="error-container animate-fade-in-up">
        <div className="error-icon">!</div>
        <h3 className="error-title">Could not process your question</h3>
        <p className="error-message">{response.error}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* Summary */}
      {response.summary && (
        <div className="response-summary" style={{ animationDelay: '0ms' }}>
          {response.summary}
        </div>
      )}

      {/* KPI Cards */}
      {response.kpi_cards.length > 0 && (
        <div className="kpi-grid" style={{ animationDelay: '100ms' }}>
          {response.kpi_cards.map((kpi, i) => (
            <KPICard key={i} kpi={kpi} delay={i * 80} />
          ))}
        </div>
      )}

      {/* Charts */}
      {response.charts.length > 0 && (
        <div className={response.charts.length > 1 ? 'charts-grid' : ''}>
          {response.charts.map((chart, i) => (
            <DynamicChart key={i} chart={chart} delay={200 + i * 100} />
          ))}
        </div>
      )}

      {/* Insights */}
      {response.insights.length > 0 && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h3 style={{
            fontSize: 'var(--text-lg)', fontWeight: 600,
            color: 'var(--text-primary)', marginBottom: 'var(--space-4)',
            display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
          }}>
            <Lightbulb size={20} style={{ color: 'var(--color-warning)' }} />
            AI Insights
          </h3>
          <div className="insights-grid">
            {response.insights.map((insight, i) => (
              <InsightCard key={i} insight={insight} delay={300 + i * 80} />
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      {response.tables.length > 0 && (
        <>
          {response.tables.map((table, i) => (
            <DataTable key={i} table={table} delay={400 + i * 100} />
          ))}
        </>
      )}

      {/* Recommendations */}
      {response.recommendations.length > 0 && (
        <div className="recommendations-section">
          <h3 className="recommendations-title">
            <Target size={20} style={{ color: 'var(--accent-primary)' }} />
            Recommendations
          </h3>
          {response.recommendations.map((rec, i) => (
            <div
              key={i}
              className="recommendation-item animate-fade-in-up"
              style={{ animationDelay: `${500 + i * 80}ms` }}
            >
              <div className="recommendation-number">{i + 1}</div>
              <span className="recommendation-text">{rec.text}</span>
              <span className={`recommendation-priority ${rec.priority}`}>
                {rec.priority}
              </span>
            </div>
          ))}
        </div>
      )}



      {/* Execution time footer */}
      {response.execution_time_ms > 0 && (
        <div style={{
          textAlign: 'right', fontSize: 'var(--text-xs)',
          color: 'var(--text-muted)', marginTop: 'var(--space-4)',
        }}>
          Analyzed in {(response.execution_time_ms / 1000).toFixed(1)}s
        </div>
      )}
    </div>
  );
}

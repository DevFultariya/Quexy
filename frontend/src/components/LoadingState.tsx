'use client';

export default function LoadingState() {
  return (
    <div className="animate-fade-in" style={{ width: '100%' }}>
      {/* Executive Summary Skeleton */}
      <div className="glass-card" style={{ marginBottom: 'var(--space-6)', padding: 'var(--space-5) var(--space-6)' }}>
        <div className="skeleton skeleton-text" style={{ width: '100%', height: '16px' }} />
        <div className="skeleton skeleton-text" style={{ width: '85%', height: '16px', marginBottom: 0 }} />
      </div>

      {/* KPI Cards Skeleton */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card skeleton-kpi" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
            <div className="skeleton skeleton-text" style={{ width: '40%', height: '12px' }} />
            <div className="skeleton skeleton-text" style={{ width: '70%', height: '32px' }} />
            <div className="skeleton skeleton-text" style={{ width: '30%', height: '16px', marginBottom: 0 }} />
          </div>
        ))}
      </div>

      {/* Grid for Chart & Insights Skeleton */}
      <div className="charts-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {/* Chart Skeleton */}
        <div className="glass-card skeleton-chart" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px' }} />
          <div className="skeleton" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} />
        </div>

        {/* Insights Skeleton */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="skeleton skeleton-text" style={{ width: '40%', height: '20px' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div className="skeleton" style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div className="skeleton skeleton-text" style={{ width: '90%', height: '12px' }} />
                  <div className="skeleton skeleton-text" style={{ width: '60%', height: '10px', marginBottom: 0 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: 'var(--glass-border)' }}>
          <div className="skeleton skeleton-text" style={{ width: '20%', height: '20px', marginBottom: 0 }} />
          <div className="skeleton skeleton-text" style={{ width: '15%', height: '32px', borderRadius: 'var(--radius-md)', marginBottom: 0 }} />
        </div>
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div className="skeleton skeleton-text" style={{ width: '25%', height: '14px', marginBottom: 0 }} />
              <div className="skeleton skeleton-text" style={{ width: '20%', height: '14px', marginBottom: 0 }} />
              <div className="skeleton skeleton-text" style={{ width: '15%', height: '14px', marginBottom: 0 }} />
              <div className="skeleton skeleton-text" style={{ width: '20%', height: '14px', marginBottom: 0 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Shimmer Shading for analyzing state */}
      <div className="loading-container">
        <h4 style={{ color: 'var(--text-primary)', fontSize: 'var(--text-lg)', fontWeight: 600 }}>
          Analyzing database
        </h4>
        <p className="loading-text">
          Translating question to SQL and computing insights...
        </p>
        <div className="loading-dots">
          <div className="loading-dot" />
          <div className="loading-dot" />
          <div className="loading-dot" />
        </div>
      </div>
    </div>
  );
}

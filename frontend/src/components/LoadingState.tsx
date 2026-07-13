'use client';

import { useState, useEffect } from 'react';
import { Brain, Shield, Database, BarChart3, Check, Loader2 } from 'lucide-react';

const STEPS = [
  { id: 1, label: 'Decoding Intent', desc: 'Parsing natural language question...', icon: Brain },
  { id: 2, label: 'Security Validation', desc: 'Verifying read-only safety protocols...', icon: Shield },
  { id: 3, label: 'Running Analytics', desc: 'Executing SQL queries on database...', icon: Database },
  { id: 4, label: 'Composing Visuals', desc: 'Generating charts and recommendations...', icon: BarChart3 },
];

export default function LoadingState() {
  const [activeStep, setActiveStep] = useState(1);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // Progress through pipeline tracer stages
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev < 4) return prev + 1;
        return prev;
      });
    }, 1300);

    // Asymptotic smooth progress bar
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 96) return prev + (100 - prev) * 0.12;
        return prev;
      });
    }, 200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="animate-fade-in" style={{ width: '100%', position: 'relative' }}>
      
      {/* Background Dashboard Mock Skeletons */}
      <div style={{ filter: 'blur(3px)', opacity: 0.25, pointerEvents: 'none', transition: 'all 0.5s' }}>
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
          <div className="glass-card skeleton-chart" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="skeleton skeleton-text" style={{ width: '30%', height: '20px' }} />
            <div className="skeleton" style={{ flex: 1, borderRadius: 'var(--radius-md)' }} />
          </div>

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
      </div>

      {/* Floating Status Tracer Card */}
      <div 
        style={{
          position: 'absolute',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          width: '100%',
          maxWidth: '440px',
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 50px rgba(124, 58, 237, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }} 
        className="animate-fade-in"
      >
        
        {/* Pulsing AI Thinking Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '50%',
            background: 'var(--gradient-ai)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 25px rgba(124, 58, 237, 0.4)',
            flexShrink: 0,
          }}>
            <Loader2 className="animate-spin" size={20} style={{ color: '#fff' }} />
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.01em' }}>
              Analyzing Data Source
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Compiling real-time business intelligence
            </p>
          </div>
        </div>

        {/* Steps Tracer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {STEPS.map((step) => {
            const Icon = step.icon;
            const isCompleted = activeStep > step.id;
            const isActive = activeStep === step.id;
            const isPending = activeStep < step.id;

            return (
              <div 
                key={step.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '16px',
                  opacity: isPending ? 0.35 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: isActive ? 'translateX(4px)' : 'translateX(0)',
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isCompleted 
                    ? 'rgba(16, 185, 129, 0.12)' 
                    : isActive 
                    ? 'rgba(124, 58, 237, 0.2)' 
                    : 'rgba(255, 255, 255, 0.02)',
                  border: isCompleted
                    ? '1px solid rgba(16, 185, 129, 0.3)'
                    : isActive
                    ? '1px solid var(--accent-primary)'
                    : '1px solid rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isCompleted 
                    ? '#10B981' 
                    : isActive 
                    ? '#A78BFA' 
                    : 'var(--text-tertiary)',
                  boxShadow: isActive ? '0 0 15px rgba(124, 58, 237, 0.35)' : 'none',
                  transition: 'all 0.3s',
                  flexShrink: 0,
                }}>
                  {isCompleted ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: isActive ? 600 : 500, 
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    transition: 'color 0.3s'
                  }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--accent-secondary)', 
                      marginTop: '2px',
                    }}>
                      {step.desc}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)' }}>
            <span>Pipeline progress</span>
            <span style={{ color: 'var(--text-secondary)' }}>{Math.round(progress)}%</span>
          </div>
          <div style={{
            height: '4px',
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '2px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: 'var(--gradient-ai)',
              borderRadius: '2px',
              transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
          </div>
        </div>
      </div>
    </div>
  );
}

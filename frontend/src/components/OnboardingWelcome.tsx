'use client';

import { Database, Upload, ArrowRight, Zap, BarChart3, Brain, Sparkles } from 'lucide-react';

interface Props {
  username: string;
  onConnectClick: () => void;
}

export default function OnboardingWelcome({ username, onConnectClick }: Props) {
  const steps = [
    { num: 1, label: 'Connect', desc: 'Link your database', icon: <Database size={16} />, active: true },
    { num: 2, label: 'Ask', desc: 'Type a question', icon: <Brain size={16} />, active: false },
    { num: 3, label: 'Insights', desc: 'Get visual answers', icon: <BarChart3 size={16} />, active: false },
  ];

  const sources = [
    { label: 'PostgreSQL', color: '#60A5FA' },
    { label: 'MySQL', color: '#F472B6' },
    { label: 'CSV', color: '#34D399' },
    { label: 'Excel', color: '#FBBF24' },
    { label: 'SQLite', color: '#A78BFA' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 1,
      padding: '40px 24px',
      minHeight: 'calc(100vh - 80px)',
    }}>
      {/* Welcome Card */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        textAlign: 'center',
      }}>
        {/* Greeting */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '50px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          fontSize: '12px',
          fontWeight: 600,
          color: '#C084FC',
          marginBottom: '24px',
        }}>
          <Sparkles size={12} />
          Welcome, {username}
        </div>

        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '-0.8px',
          marginBottom: '10px',
          color: 'var(--text-primary)',
        }}>
          Connect your first data source
        </h1>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
          maxWidth: '420px',
          margin: '0 auto 36px',
        }}>
          Link a database or upload a file to start querying your data with natural language.
        </p>

        {/* Step Indicator */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0',
          marginBottom: '40px',
        }}>
          {steps.map((step, idx) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                minWidth: '100px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '12px',
                  background: step.active ? 'rgba(124, 58, 237, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${step.active ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: step.active ? '#C084FC' : 'var(--text-tertiary)',
                  transition: 'all 0.3s',
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: step.active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  }}>
                    {step.label}
                  </div>
                  <div style={{
                    fontSize: '10px',
                    color: 'var(--text-tertiary)',
                    marginTop: '1px',
                  }}>
                    {step.desc}
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div style={{
                  width: '40px',
                  height: '1px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  marginBottom: '28px',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Connect CTA */}
        <button
          onClick={onConnectClick}
          className="btn btn-primary btn-lg"
          style={{
            padding: '14px 36px',
            fontSize: '15px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 0 30px rgba(124, 58, 237, 0.2)',
            marginBottom: '40px',
          }}
        >
          <Database size={18} />
          Connect Data Source
          <ArrowRight size={16} />
        </button>

        {/* Supported Sources */}
        <div style={{
          padding: '20px 24px',
          borderRadius: '14px',
          background: 'rgba(255, 255, 255, 0.015)',
          border: '1px solid rgba(255, 255, 255, 0.04)',
        }}>
          <div style={{
            fontSize: '10px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '14px',
          }}>
            Supported Sources
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}>
            {sources.map((src) => (
              <div key={src.label} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.04)',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: src.color,
                }} />
                {src.label}
              </div>
            ))}
          </div>
        </div>

        {/* Quick tip */}
        <p style={{
          marginTop: '24px',
          fontSize: '11px',
          color: 'var(--text-tertiary)',
          lineHeight: 1.6,
        }}>
          <Zap size={10} style={{ verticalAlign: 'middle', marginRight: '4px', color: '#FBBF24' }} />
          Tip: Upload a CSV to try Quexy instantly — no database setup required.
        </p>
      </div>
    </div>
  );
}

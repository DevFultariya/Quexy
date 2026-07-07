'use client';

import { useState } from 'react';
import { 
  Database, Sparkles, Shield, Zap, BarChart3, 
  Brain, Lock, ArrowRight, ChevronRight, Layers,
  GitBranch, Terminal
} from 'lucide-react';
import QuexyLogo from './QuexyLogo';

interface Props {
  onGetStarted: () => void;
  onSignIn: () => void;
}

export default function LandingPage({ onGetStarted, onSignIn }: Props) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Brain size={22} />,
      title: 'Natural Language Queries',
      description: 'Ask questions in plain English. Our AI translates your intent into optimized SQL and returns visual analytics instantly.',
      color: '#A78BFA',
      bgColor: 'rgba(167, 139, 250, 0.08)',
      borderColor: 'rgba(167, 139, 250, 0.15)',
    },
    {
      icon: <GitBranch size={22} />,
      title: 'AST Schema Healing',
      description: 'A built-in compiler walks the SQL abstract syntax tree and programmatically corrects column hallucinations before execution.',
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.08)',
      borderColor: 'rgba(52, 211, 153, 0.15)',
    },
    {
      icon: <Shield size={22} />,
      title: 'Query Security Firewall',
      description: 'Every generated query is parsed through a security validator that blocks INSERT, UPDATE, DELETE, and DROP statements.',
      color: '#60A5FA',
      bgColor: 'rgba(96, 165, 250, 0.08)',
      borderColor: 'rgba(96, 165, 250, 0.15)',
    },
    {
      icon: <Zap size={22} />,
      title: 'Execution Plan Advisor',
      description: 'Automatically runs EXPLAIN on queries, detects full table scans, and suggests CREATE INDEX optimizations.',
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.08)',
      borderColor: 'rgba(251, 191, 36, 0.15)',
    },
    {
      icon: <Database size={22} />,
      title: 'Multi-Database Hub',
      description: 'Connect PostgreSQL, MySQL, SQLite, CSV, and Excel sources. Switch between saved profiles with a single click.',
      color: '#F472B6',
      bgColor: 'rgba(244, 114, 182, 0.08)',
      borderColor: 'rgba(244, 114, 182, 0.15)',
    },
    {
      icon: <Layers size={22} />,
      title: 'Adaptive Dashboards',
      description: 'AI dynamically composes KPI cards, charts, data tables, and insights based on the nature of your question.',
      color: '#FB923C',
      bgColor: 'rgba(251, 146, 60, 0.08)',
      borderColor: 'rgba(251, 146, 60, 0.15)',
    },
  ];

  const techStack = [
    { label: 'FastAPI', sub: 'Backend' },
    { label: 'Next.js 15', sub: 'Frontend' },
    { label: 'PostgreSQL', sub: 'System DB' },
    { label: 'Gemini / Groq', sub: 'LLM Providers' },
    { label: 'sqlglot', sub: 'AST Engine' },
    { label: 'Recharts', sub: 'Visualization' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-void)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-family)',
      overflowX: 'hidden',
    }}>
      {/* ===== NAVBAR ===== */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '16px 40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(8, 8, 14, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}>
        <QuexyLogo size="sm" />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onSignIn}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="btn btn-primary"
            style={{ padding: '8px 20px', fontSize: '13px', borderRadius: '8px' }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section style={{
        position: 'relative',
        paddingTop: '160px',
        paddingBottom: '100px',
        textAlign: 'center',
        maxWidth: '900px',
        margin: '0 auto',
        padding: '160px 24px 100px',
      }}>
        {/* Decorative glows */}
        <div style={{
          position: 'absolute', top: '80px', left: '50%', transform: 'translateX(-50%)',
          width: '600px', height: '400px',
          background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: '200px', left: '20%',
          width: '300px', height: '300px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          padding: '6px 16px', borderRadius: '50px',
          background: 'rgba(124, 58, 237, 0.08)',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          fontSize: '12px', fontWeight: 600, color: '#C084FC',
          marginBottom: '28px', position: 'relative',
        }}>
          <Sparkles size={12} />
          AI-Powered Business Intelligence
        </div>

        {/* Headline */}
        <h1 style={{
          fontSize: 'clamp(36px, 5vw, 64px)',
          fontWeight: 800,
          lineHeight: 1.1,
          letterSpacing: '-1.5px',
          marginBottom: '20px',
          position: 'relative',
        }}>
          <span style={{ color: 'var(--text-primary)' }}>Ask your data.</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #A78BFA 0%, #60A5FA 50%, #34D399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Get answers.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '17px',
          lineHeight: 1.7,
          color: 'var(--text-secondary)',
          maxWidth: '560px',
          margin: '0 auto 40px',
          position: 'relative',
        }}>
          Connect any database. Type a question in plain English. Quexy generates SQL,
          validates it through a security firewall, and returns interactive dashboards
          with KPIs, charts, and AI-driven insights.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', position: 'relative' }}>
          <button
            onClick={onGetStarted}
            className="btn btn-primary btn-lg"
            style={{
              padding: '14px 32px',
              fontSize: '15px',
              display: 'flex', alignItems: 'center', gap: '8px',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.25)',
            }}
          >
            Start Analyzing
            <ArrowRight size={16} />
          </button>
          <a
            href="https://github.com/DevFultariya/Quexy"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '14px 28px',
              fontSize: '15px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '8px',
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Terminal size={16} />
            View on GitHub
          </a>
        </div>

        {/* Terminal Preview Mock */}
        <div style={{
          marginTop: '60px',
          maxWidth: '650px',
          margin: '60px auto 0',
          borderRadius: '14px',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'rgba(10, 10, 18, 0.8)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 40px rgba(124, 58, 237, 0.06)',
          position: 'relative',
        }}>
          {/* Title bar */}
          <div style={{
            padding: '10px 16px',
            background: 'rgba(255, 255, 255, 0.02)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            display: 'flex', alignItems: 'center', gap: '7px',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EF4444' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#F59E0B' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22C55E' }} />
            <span style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Quexy Dashboard</span>
          </div>
          {/* Content */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px', fontFamily: 'monospace' }}>
              <span style={{ color: '#A78BFA' }}>user</span>
              <span style={{ color: 'var(--text-tertiary)' }}> › </span>
            </div>
            <p style={{
              fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '20px', lineHeight: 1.5,
            }}>
              &ldquo;Show me monthly revenue trends for 2024 broken down by product category&rdquo;
            </p>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
            }}>
              {[
                { label: 'Total Revenue', value: '$2.4M', color: '#34D399' },
                { label: 'Avg. Monthly', value: '$198K', color: '#60A5FA' },
                { label: 'Top Category', value: 'SaaS', color: '#FBBF24' },
              ].map((kpi) => (
                <div key={kpi.label} style={{
                  padding: '14px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.04)',
                }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.5px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                </div>
              ))}
            </div>
            <div style={{
              marginTop: '14px', height: '4px', borderRadius: '2px',
              background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.3) 0%, rgba(52, 211, 153, 0.3) 50%, rgba(96, 165, 250, 0.3) 100%)',
            }} />
            <div style={{
              marginTop: '6px', height: '3px', borderRadius: '2px', width: '70%',
              background: 'linear-gradient(90deg, rgba(167, 139, 250, 0.15) 0%, rgba(52, 211, 153, 0.15) 100%)',
            }} />
          </div>
        </div>
      </section>

      {/* ===== FEATURES GRID ===== */}
      <section style={{
        maxWidth: '1100px',
        margin: '0 auto',
        padding: '40px 24px 100px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{
            fontSize: '32px', fontWeight: 700, letterSpacing: '-0.8px',
            marginBottom: '12px',
          }}>
            Engineered for Depth
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            Not just an API wrapper. Every layer is purpose-built with compiler-level intelligence.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {features.map((feature, idx) => (
            <div
              key={idx}
              style={{
                padding: '28px',
                borderRadius: '14px',
                background: hoveredFeature === idx ? feature.bgColor : 'rgba(255, 255, 255, 0.015)',
                border: `1px solid ${hoveredFeature === idx ? feature.borderColor : 'rgba(255, 255, 255, 0.04)'}`,
                transition: 'all 0.3s ease',
                cursor: 'default',
              }}
              onMouseEnter={() => setHoveredFeature(idx)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <div style={{
                width: '42px', height: '42px', borderRadius: '10px',
                background: feature.bgColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: feature.color,
                marginBottom: '16px',
                border: `1px solid ${feature.borderColor}`,
              }}>
                {feature.icon}
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: '13px', lineHeight: 1.65, color: 'var(--text-secondary)', margin: 0 }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== TECH STACK BAR ===== */}
      <section style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px',
        }}>
          {techStack.map((tech) => (
            <div key={tech.label} style={{ textAlign: 'center', minWidth: '100px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{tech.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{tech.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== BOTTOM CTA ===== */}
      <section style={{
        textAlign: 'center',
        padding: '80px 24px 60px',
        position: 'relative',
      }}>
        <div style={{
          position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)',
          width: '500px', height: '300px',
          background: 'radial-gradient(ellipse, rgba(124, 58, 237, 0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <h2 style={{
          fontSize: '28px', fontWeight: 700, marginBottom: '14px',
          letterSpacing: '-0.5px', position: 'relative',
        }}>
          Ready to query?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px', position: 'relative' }}>
          Connect your database and start asking questions in seconds.
        </p>
        <button
          onClick={onGetStarted}
          className="btn btn-primary btn-lg"
          style={{
            padding: '14px 36px', fontSize: '15px',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            position: 'relative',
          }}
        >
          Get Started Free
          <ChevronRight size={16} />
        </button>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontSize: '12px', color: 'var(--text-tertiary)',
      }}>
        <span>© 2025 Quexy. Built by Dev Fultariya.</span>
        <a
          href="https://github.com/DevFultariya/Quexy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--text-tertiary)', textDecoration: 'none', fontWeight: 500 }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >
          GitHub Repository
        </a>
      </footer>
    </div>
  );
}

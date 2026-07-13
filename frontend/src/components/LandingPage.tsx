'use client';

import { useState } from 'react';
import { 
  Database, Sparkles, Shield, Zap, BarChart3, 
  Brain, Lock, ArrowRight, ChevronRight, Layers
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
      title: 'Plain-English Questions',
      description: 'Ask questions in normal language. Our system understands what you want, runs the query behind the scenes, and returns clear visual answers.',
      color: '#A78BFA',
      bgColor: 'rgba(167, 139, 250, 0.08)',
      borderColor: 'rgba(167, 139, 250, 0.15)',
    },
    {
      icon: <Sparkles size={22} />,
      title: 'Smart Auto-Correction',
      description: 'Never worry about formatting. The built-in query agent automatically detects and corrects data search issues to ensure your reports load smoothly.',
      color: '#34D399',
      bgColor: 'rgba(52, 211, 153, 0.08)',
      borderColor: 'rgba(52, 211, 153, 0.15)',
    },
    {
      icon: <Shield size={22} />,
      title: '100% Read-Only Safety',
      description: 'Your data integrity is protected. Quexy is strictly read-only and automatically blocks any delete, insert, or write modifications to your database.',
      color: '#60A5FA',
      bgColor: 'rgba(96, 165, 250, 0.08)',
      borderColor: 'rgba(96, 165, 250, 0.15)',
    },
    {
      icon: <Zap size={22} />,
      title: 'Instant Database Reports',
      description: 'Bypass slow loading times. The query engine optimizes database lookups behind the scenes to serve reports and lists without bottlenecks.',
      color: '#FBBF24',
      bgColor: 'rgba(251, 191, 36, 0.08)',
      borderColor: 'rgba(251, 191, 36, 0.15)',
    },
    {
      icon: <Database size={22} />,
      title: 'Centralized Data Hub',
      description: 'Link PostgreSQL, MySQL, Excel sheets, or CSV files. Access and switch between multiple organizational databases with a single click.',
      color: '#F472B6',
      bgColor: 'rgba(244, 114, 182, 0.08)',
      borderColor: 'rgba(244, 114, 182, 0.15)',
    },
    {
      icon: <Layers size={22} />,
      title: 'Interactive Visual Dashboards',
      description: 'Quexy instantly compiles raw search findings into key metrics, graphs, charts, and bullet-point summaries customized to each question.',
      color: '#FB923C',
      bgColor: 'rgba(251, 146, 60, 0.08)',
      borderColor: 'rgba(251, 146, 60, 0.15)',
    },
  ];

  const trustFactors = [
    { label: 'Security First', sub: 'Read-only access limits' },
    { label: 'Fully Private', sub: 'We do not store your databases' },
    { label: 'Standard Protocols', sub: 'SSL-encrypted endpoints' },
    { label: 'No-Code Simplicity', sub: 'Built for business users' },
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
          Intuitive Data Analytics & Visual Reports
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
            Get instant reports.
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
          Unlock instant insights from your data without writing code. Simply connect your database 
          or upload a spreadsheet, ask questions in plain English, and instantly view clear 
          visual charts, trends, and executive summaries.
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
            <span style={{ marginLeft: '12px', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 500 }}>Quexy Reports</span>
          </div>
          {/* Content */}
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '10px', fontFamily: 'var(--font-family)', textAlign: 'left' }}>
              <span>Ask a question: </span>
            </div>
            <p style={{
              fontSize: '15px', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '20px', lineHeight: 1.5, textAlign: 'left'
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
                  textAlign: 'left'
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
            Designed for Deep Insights
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
            A secure analytics platform built to extract maximum value from your metrics, without the technical complexity.
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

      {/* ===== TRUST FACTORS BAR ===== */}
      <section style={{
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        padding: '40px 24px',
      }}>
        <div style={{
          maxWidth: '900px', margin: '0 auto',
          display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '32px',
        }}>
          {trustFactors.map((factor) => (
            <div key={factor.label} style={{ textAlign: 'center', minWidth: '150px' }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)' }}>{factor.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '2px' }}>{factor.sub}</div>
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
          Ready to ask your first question?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '30px', position: 'relative' }}>
          Connect your database securely and load insights in seconds.
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
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '12px', color: 'var(--text-tertiary)',
      }}>
        <span>© 2026 Quexy. Built for business intelligence. All rights reserved.</span>
      </footer>
    </div>
  );
}

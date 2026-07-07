'use client';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export default function QuexyLogo({ size = 'md', showText = true }: Props) {
  const sizes = {
    sm: { height: 26, font: 16, gap: 8 },
    md: { height: 32, font: 20, gap: 10 },
    lg: { height: 42, font: 26, gap: 12 },
  };

  const s = sizes[size];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: `${s.gap}px` }}>
      {/* Import premium font specifically for the logo brand */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .quexy-logo-text {
          font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif !important;
        }
      `}} />

      {/* Modern Tech Icon Mark — The Isometric Data Prism */}
      <svg
        height={s.height}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, overflow: 'visible' }}
      >
        <defs>
          {/* Primary Violet-Indigo Gradient */}
          <linearGradient id="prism-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A78BFA" />
            <stop offset="60%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#4F46E5" />
          </linearGradient>
          
          {/* Cyan/Aqua Secondary Gradient */}
          <linearGradient id="prism-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Isometric Stacked Data Layers (Schemas) */}
        {/* Layer 3 (Bottom) */}
        <path
          d="M20 33L34 26L20 19L6 26L20 33Z"
          fill="url(#prism-grad-1)"
          fillOpacity="0.25"
          stroke="url(#prism-grad-1)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* Layer 2 (Middle) */}
        <path
          d="M20 25L34 18L20 11L6 18L20 25Z"
          fill="url(#prism-grad-1)"
          fillOpacity="0.4"
          stroke="url(#prism-grad-1)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />

        {/* AI Query Core Slicing Through (The vertical column/beam) */}
        <path
          d="M20 5V31"
          stroke="url(#prism-grad-2)"
          strokeWidth="3"
          strokeLinecap="round"
          filter="url(#logo-glow)"
        />

        {/* Layer 1 (Top Floating Layer - Active) */}
        <path
          d="M20 17L34 10L20 3L6 10L20 17Z"
          fill="url(#prism-grad-1)"
          fillOpacity="0.8"
          stroke="#C084FC"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Glowing Query Node (Top intersection point) */}
        <circle
          cx="20"
          cy="10"
          r="3"
          fill="#38BDF8"
          filter="url(#logo-glow)"
        />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span className="quexy-logo-text" style={{
          fontSize: `${s.font}px`,
          letterSpacing: '-0.6px',
          lineHeight: '1.3',
          display: 'flex',
          alignItems: 'baseline',
          userSelect: 'none',
          paddingBottom: '3px',
        }}>
          {/* Part 1: Que (Clean white/gray) */}
          <span style={{
            fontWeight: 500,
            color: '#F1F5F9',
          }}>
            Que
          </span>
          {/* Part 2: xy (Bold neon accent) */}
          <span style={{
            fontWeight: 800,
            background: 'linear-gradient(135deg, #A78BFA 0%, #38BDF8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            display: 'inline-block',
            paddingBottom: '2px',
          }}>
            xy
          </span>
          {/* Stylized geometric dot */}
          <span style={{
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: '#38BDF8',
            marginLeft: '2px',
            display: 'inline-block',
            boxShadow: '0 0 8px #38BDF8',
            transform: 'translateY(-1px)',
          }} />
        </span>
      )}
    </div>
  );
}

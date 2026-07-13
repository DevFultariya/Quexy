'use client';

import { useState, useEffect } from 'react';
import QuexyLogo from './QuexyLogo';
import { Loader2 } from 'lucide-react';

export default function InitialLoader() {
  const [loadingText, setLoadingText] = useState('Initializing console...');

  useEffect(() => {
    const texts = [
      'Securing user session...',
      'Verifying authentication protocols...',
      'Mapping database states...',
      'Connecting analytical engine...',
    ];

    let current = 0;
    const interval = setInterval(() => {
      if (current < texts.length) {
        setLoadingText(texts[current]);
        current++;
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        width: '100%',
        background: 'var(--bg-void)',
        gap: '32px',
        animation: 'fadeIn 0.6s ease-out',
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes pulseLogo {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(0.98); }
        }
        .pulse-container {
          animation: pulseLogo 3s infinite ease-in-out;
        }
      `}} />

      {/* Pulsing Brand Logo */}
      <div className="pulse-container" style={{ display: 'flex', justifyContent: 'center' }}>
        <QuexyLogo size="lg" showText={true} />
      </div>

      {/* Loading feedback block */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Loader2 className="animate-spin" size={14} style={{ color: 'var(--accent-secondary)' }} />
          <span 
            style={{
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              letterSpacing: '0.02em',
              transition: 'all 0.3s ease',
              minWidth: '220px',
              textAlign: 'left',
            }}
          >
            {loadingText}
          </span>
        </div>

        {/* Minimal loading track */}
        <div style={{
          height: '2px',
          width: '160px',
          background: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '1px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            height: '100%',
            width: '60px',
            background: 'var(--gradient-ai)',
            borderRadius: '1px',
            animation: 'slideBar 1.5s infinite ease-in-out',
          }} />
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes slideBar {
              0% { left: -60px; }
              50% { left: 160px; }
              100% { left: 160px; }
            }
          `}} />
        </div>
      </div>
    </div>
  );
}

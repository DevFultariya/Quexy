'use client';

import { useState } from 'react';
import { Loader2, Lock, Mail, User, ShieldCheck, X } from 'lucide-react';
import { loginUser, registerUser, setToken, setUsername } from '@/lib/api';
import QuexyLogo from './QuexyLogo';

interface Props {
  onSuccess: (username: string) => void;
  onClose?: () => void;
  initialMode?: 'register' | 'login';
}

export default function AuthModal({ onSuccess, onClose, initialMode = 'login' }: Props) {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login Flow
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        setToken(res.data.token);
        setUsername(res.data.username);
        onSuccess(res.data.username);
      } else {
        // Register Flow
        const res = await registerUser({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        setToken(res.data.token);
        setUsername(res.data.username);
        onSuccess(res.data.username);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(5, 5, 8, 0.85)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'var(--font-family)'
      }}
    >
      <div 
        className="glass-card animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '40px',
          borderRadius: '24px',
          border: '1px solid rgba(124, 58, 237, 0.15)',
          background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.9), rgba(26, 26, 46, 0.8))',
          boxShadow: 'var(--shadow-lg), 0 0 50px rgba(124, 58, 237, 0.08)',
          position: 'relative'
        }}
      >
        {/* Decorative Top Glow Bar */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'var(--gradient-ai)',
          borderRadius: '24px 24px 0 0'
        }} />

        {/* Full Card Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 10, 15, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: '24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            gap: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-primary)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {isLogin ? 'Authenticating Profile...' : 'Initializing Account...'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 20px' }}>
                Securing data endpoints and routing workspace directories
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px',
              padding: '6px',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <X size={14} />
          </button>
        )}

        {/* Logo and title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <QuexyLogo size="lg" showText={false} />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
            {isLogin ? 'Sign in to access your databases' : 'Register to launch your analytics cockpit'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          background: 'rgba(0, 0, 0, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          padding: '3px',
          borderRadius: '10px',
          marginBottom: '24px'
        }}>
          <button
            onClick={() => { setIsLogin(true); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: isLogin ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
              color: isLogin ? '#C084FC' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Log In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(null); }}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '8px',
              border: 'none',
              background: !isLogin ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
              color: !isLogin ? '#C084FC' : 'var(--text-secondary)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Username (Register Only) */}
          {!isLogin && (
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <User size={12} />
                Username
              </label>
              <input
                className="input"
                required
                placeholder="dev_analyst"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          )}

          {/* Email */}
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Mail size={12} />
              Email Address
            </label>
            <input
              className="input"
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>

          {/* Password */}
          <div className="input-group" style={{ marginBottom: '8px' }}>
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Lock size={12} />
              Password
            </label>
            <input
              className="input"
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              padding: '10px 14px',
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              color: 'var(--color-error)',
              fontSize: '12px',
              lineHeight: 1.4
            }}>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: '8px' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                {isLogin ? 'Logging in...' : 'Registering...'}
              </>
            ) : (
              <>
                {isLogin ? 'Sign In' : 'Create Cockpit'}
              </>
            )}
          </button>
        </form>

        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

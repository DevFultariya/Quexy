'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Database, Server, Loader2, CheckCircle2, FileSpreadsheet, FileText, ChevronRight, HardDrive, X } from 'lucide-react';
import { uploadFile, connectDatabase, getSavedConnections, activateConnection } from '@/lib/api';
import type { ConnectionStatus } from '@/lib/types';
import QuexyLogo from './QuexyLogo';

interface Props {
  onConnected: (status: ConnectionStatus) => void;
  onClose?: () => void;
}

export default function ConnectDataSource({ onConnected, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'database'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Database form state
  const [dbType, setDbType] = useState<'postgresql' | 'mysql'>('postgresql');
  const [dbConfig, setDbConfig] = useState({
    host: 'localhost',
    port: dbType === 'postgresql' ? 5432 : 3306,
    database: '',
    username: '',
    password: '',
  });

  // Load user saved database profiles on mount
  useEffect(() => {
    loadSavedConnections();
  }, []);

  const loadSavedConnections = async () => {
    try {
      const res = await getSavedConnections();
      if (res.success) {
        setSavedConnections(res.data);
      }
    } catch {
      // Failed silently
    }
  };

  const handleActivateSaved = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await activateConnection(id);
      if (res.success) {
        onConnected(res.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to saved database.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, []);

  const handleFileSelect = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowed = ['csv', 'xlsx', 'xls', 'db', 'sqlite', 'sqlite3'];
    if (!ext || !allowed.includes(ext)) {
      setError(`Unsupported file type: .${ext}. Allowed: ${allowed.join(', ')}`);
      return;
    }
    setSelectedFile(file);
    setError(null);

    setIsLoading(true);
    try {
      const res = await uploadFile(file);
      onConnected(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDatabaseConnect = async () => {
    if (!dbConfig.database || !dbConfig.username) {
      setError('Database name and username are required.');
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const res = await connectDatabase({
        db_type: dbType,
        host: dbConfig.host,
        port: dbConfig.port,
        database: dbConfig.database,
        username: dbConfig.username,
        password: dbConfig.password,
      });
      onConnected(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to database');
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
        background: 'rgba(5, 5, 8, 0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: 'var(--font-family)',
        padding: '24px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          width: '100%',
          maxWidth: '520px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          background: 'linear-gradient(135deg, rgba(14, 14, 22, 0.95), rgba(22, 22, 38, 0.9))',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 40px rgba(124, 58, 237, 0.06)',
          position: 'relative',
        }}
      >
        {/* Top glow accent */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
          background: 'var(--gradient-ai)', borderRadius: '20px 20px 0 0',
        }} />

        {/* Full Card Loading Overlay */}
        {isLoading && (
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(10, 10, 15, 0.75)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            gap: '16px',
            animation: 'fadeIn 0.2s ease-out',
          }}>
            <Loader2 className="animate-spin" size={32} style={{ color: 'var(--accent-secondary)' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {activeTab === 'upload' ? 'Uploading & Ingesting Dataset...' : 'Connecting to Database...'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px', padding: '0 20px' }}>
                Establishing secure socket connection and profiling schema caches
              </div>
            </div>
          </div>
        )}

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px', zIndex: 10,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '8px', padding: '6px',
              color: 'var(--text-tertiary)', cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <X size={14} />
          </button>
        )}

        {/* Header */}
        <div style={{ padding: '32px 32px 0', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <QuexyLogo size="md" showText={false} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Connect Data Source
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 24px' }}>
            Upload a file or connect to an existing database
          </p>
        </div>

        <div style={{ padding: '0 32px 28px' }}>
          {/* Tab Selector */}
          <div className="tab-selector" style={{ marginBottom: '20px' }}>
            <button
              className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
              onClick={() => { setActiveTab('upload'); setError(null); }}
            >
              <Upload size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Upload File
            </button>
            <button
              className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
              onClick={() => { setActiveTab('database'); setError(null); }}
            >
              <Database size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
              Database
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div>
              <div
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '28px' }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls,.db,.sqlite,.sqlite3"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                
                {isLoading ? (
                  <>
                    <div className="upload-zone-icon">
                      <Loader2 size={22} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    </div>
                    <p className="upload-zone-text">Uploading & profiling...</p>
                  </>
                ) : selectedFile ? (
                  <>
                    <div className="upload-zone-icon" style={{ background: 'var(--color-success-bg)' }}>
                      <CheckCircle2 size={22} style={{ color: 'var(--color-success)' }} />
                    </div>
                    <p className="upload-zone-text">{selectedFile.name}</p>
                  </>
                ) : (
                  <>
                    <div className="upload-zone-icon">
                      <Upload size={22} />
                    </div>
                    <p className="upload-zone-text">
                      Drop your file here or click to browse
                    </p>
                    <p className="upload-zone-hint">
                      CSV, Excel (.xlsx), SQLite (.db)
                    </p>
                  </>
                )}
              </div>

              {/* File type icons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '16px' }}>
                {[
                  { icon: <FileText size={18} />, label: 'CSV' },
                  { icon: <FileSpreadsheet size={18} />, label: 'Excel' },
                  { icon: <Database size={18} />, label: 'SQLite' },
                ].map(({ icon, label }) => (
                  <div key={label} style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '11px' }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-surface-2)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px'
                    }}>{icon}</div>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Database Tab */}
          {activeTab === 'database' && (
            <div>
              {/* DB Type Selector */}
              <div className="db-type-selector" style={{ marginBottom: '16px' }}>
                {[
                  { type: 'postgresql' as const, label: 'PostgreSQL', port: 5432 },
                  { type: 'mysql' as const, label: 'MySQL', port: 3306 },
                ].map(({ type, label, port }) => (
                  <div
                    key={type}
                    className={`db-type-pill ${dbType === type ? 'active' : ''}`}
                    onClick={() => {
                      setDbType(type);
                      setDbConfig(prev => ({ ...prev, port }));
                    }}
                  >
                    <Server size={20} style={{ color: dbType === type ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                    <div className="db-type-pill-name">{label}</div>
                  </div>
                ))}
              </div>

              {/* Connection Form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Host</label>
                  <input
                    className="input"
                    value={dbConfig.host}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, host: e.target.value }))}
                    placeholder="localhost"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Port</label>
                  <input
                    className="input"
                    type="number"
                    value={dbConfig.port}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, port: parseInt(e.target.value) || 5432 }))}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Database Name</label>
                <input
                  className="input"
                  value={dbConfig.database}
                  onChange={(e) => setDbConfig(prev => ({ ...prev, database: e.target.value }))}
                  placeholder="my_database"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Username</label>
                  <input
                    className="input"
                    value={dbConfig.username}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="postgres"
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={dbConfig.password}
                    onChange={(e) => setDbConfig(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '16px' }}
                onClick={handleDatabaseConnect}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Database size={16} />
                    Connect to {dbType === 'postgresql' ? 'PostgreSQL' : 'MySQL'}
                  </>
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginTop: '16px', padding: '10px 14px',
              background: 'var(--color-error-bg)', border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: 'var(--radius-md)', color: 'var(--color-error)',
              fontSize: '12px', lineHeight: 1.4,
            }}>
              {error}
            </div>
          )}
        </div>

        {/* SAVED CONNECTION PROFILES */}
        {savedConnections.length > 0 && (
          <div style={{
            padding: '0 32px 28px',
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            paddingTop: '20px',
          }}>
            <h3 style={{
              fontSize: '12px', fontWeight: 600, color: 'var(--text-tertiary)',
              marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px',
              textTransform: 'uppercase', letterSpacing: '0.5px',
            }}>
              <HardDrive size={12} style={{ color: 'var(--accent-primary)' }} />
              Saved Profiles
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {savedConnections.map((conn) => (
                <div 
                  key={conn.id}
                  onClick={() => !isLoading && handleActivateSaved(conn.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.04)',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => !isLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                  onMouseLeave={(e) => !isLoading && (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{conn.name}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '1px' }}>{conn.type}</div>
                  </div>
                  <ChevronRight size={14} style={{ color: 'var(--text-tertiary)' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Spin keyframe */}
        <style jsx>{`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </div>
  );
}

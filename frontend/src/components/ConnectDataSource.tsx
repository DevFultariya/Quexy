'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, Database, Server, Loader2, CheckCircle2, FileSpreadsheet, FileText } from 'lucide-react';
import { uploadFile, connectDatabase } from '@/lib/api';
import type { ConnectionStatus } from '@/lib/types';

interface Props {
  onConnected: (status: ConnectionStatus) => void;
}

export default function ConnectDataSource({ onConnected }: Props) {
  const [activeTab, setActiveTab] = useState<'upload' | 'database'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
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
    <div className="connect-container">
      <div className="connect-card animate-scale-in">
        {/* Header */}
        <div className="connect-header">
          <div className="connect-logo">Q</div>
          <h1 className="connect-title">Welcome to Quexy</h1>
          <p className="connect-subtitle">
            Connect your data source to start asking questions
          </p>
        </div>

        {/* Tab Selector */}
        <div className="tab-selector">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => { setActiveTab('upload'); setError(null); }}
          >
            <Upload size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Upload File
          </button>
          <button
            className={`tab-btn ${activeTab === 'database' ? 'active' : ''}`}
            onClick={() => { setActiveTab('database'); setError(null); }}
          >
            <Database size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Connect Database
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
                    <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} />
                  </div>
                  <p className="upload-zone-text">Uploading & analyzing...</p>
                </>
              ) : selectedFile ? (
                <>
                  <div className="upload-zone-icon" style={{ background: 'var(--color-success-bg)' }}>
                    <CheckCircle2 size={24} style={{ color: 'var(--color-success)' }} />
                  </div>
                  <p className="upload-zone-text">{selectedFile.name}</p>
                </>
              ) : (
                <>
                  <div className="upload-zone-icon">
                    <Upload size={24} />
                  </div>
                  <p className="upload-zone-text">
                    Drop your file here or click to browse
                  </p>
                  <p className="upload-zone-hint">
                    Supports CSV, Excel (.xlsx), SQLite (.db)
                  </p>
                </>
              )}
            </div>

            {/* File type icons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '20px' }}>
              {[
                { icon: <FileText size={20} />, label: 'CSV' },
                { icon: <FileSpreadsheet size={20} />, label: 'Excel' },
                { icon: <Database size={20} />, label: 'SQLite' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '12px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-2)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', margin: '0 auto 6px'
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
            <div className="db-type-selector">
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
                  <Server size={24} style={{ color: dbType === type ? 'var(--accent-primary)' : 'var(--text-tertiary)' }} />
                  <div className="db-type-pill-name">{label}</div>
                </div>
              ))}
            </div>

            {/* Connection Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
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
              style={{ width: '100%', marginTop: 'var(--space-4)' }}
              onClick={handleDatabaseConnect}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                  Connecting...
                </>
              ) : (
                <>
                  <Database size={18} />
                  Connect to {dbType === 'postgresql' ? 'PostgreSQL' : 'MySQL'}
                </>
              )}
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)',
            background: 'var(--color-error-bg)', border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)', color: 'var(--color-error)',
            fontSize: 'var(--text-sm)',
          }}>
            {error}
          </div>
        )}
      </div>

      {/* Spin keyframe */}
      <style jsx>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

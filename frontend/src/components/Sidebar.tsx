'use client';

import {
  Database,
  History,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Table,
  LayoutDashboard,
  MessageSquare,
  Clock
} from 'lucide-react';
import type { ConnectionStatus, QueryHistoryItem } from '@/lib/types';
import { disconnectDataSource } from '@/lib/api';
import { useState } from 'react';

interface Props {
  connectionStatus: ConnectionStatus | null;
  queryHistory: QueryHistoryItem[];
  onHistoryClick: (item: QueryHistoryItem) => void;
  onDisconnect: () => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({
  connectionStatus,
  queryHistory,
  onHistoryClick,
  onDisconnect,
  collapsed,
  onToggle,
}: Props) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleDisconnectClick = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectDataSource();
      onDisconnect();
    } catch (err) {
      console.error('Failed to disconnect:', err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const formatTimestamp = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">Q</div>
          {!collapsed && <span className="sidebar-logo-text">Quexy</span>}
        </div>
      </div>

      {/* Connection Status Section */}
      {!collapsed && connectionStatus && (
        <div className="sidebar-connection-status">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
            <span className="sidebar-status-dot connected" />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-primary)' }}>
              Connected
            </span>
          </div>
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-secondary)',
            wordBreak: 'break-all',
            marginBottom: '12px'
          }}>
            {connectionStatus.source_name}
          </p>
          <button
            className="btn btn-secondary btn-ghost"
            style={{
              width: '100%',
              padding: '6px 12px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
            onClick={handleDisconnectClick}
            disabled={isDisconnecting}
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      )}

      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
          <span className="sidebar-status-dot connected" title="Connected to data source" />
        </div>
      )}

      {/* Navigation / Actions */}
      <div className="sidebar-section">
        <div className="sidebar-section-title">{!collapsed && 'Navigation'}</div>
        <div className="sidebar-nav-item active">
          <LayoutDashboard size={18} />
          {!collapsed && <span>Dashboard</span>}
        </div>
      </div>

      {/* Tables Explorer Section */}
      {!collapsed && connectionStatus && connectionStatus.tables && connectionStatus.tables.length > 0 && (
        <div className="sidebar-tables-section" style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="sidebar-section-title" style={{ paddingLeft: '24px' }}>Tables</div>
          <div className="sidebar-tables">
            {connectionStatus.tables.map((table) => (
              <div key={table.name} className="sidebar-table-item" title={`${table.rows} rows, ${table.columns} columns`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                  <Table size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    fontSize: '13px'
                  }}>
                    {table.name}
                  </span>
                </div>
                <span className="sidebar-table-badge">{table.rows}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Query History Section */}
      {!collapsed && queryHistory && queryHistory.length > 0 && (
        <div className="sidebar-history-section" style={{ display: 'flex', flexDirection: 'column', height: '240px', borderTop: 'var(--glass-border)' }}>
          <div className="sidebar-section-title" style={{ paddingLeft: '24px', paddingTop: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <History size={12} />
              History
            </div>
          </div>
          <div className="history-panel" style={{ overflowY: 'auto', flex: 1, padding: '8px 16px' }}>
            {queryHistory.map((item) => (
              <div
                key={item.query_id}
                className="history-item"
                onClick={() => onHistoryClick(item)}
              >
                <div className="history-question">{item.question}</div>
                <div className="history-meta">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={10} />
                    {formatTimestamp(item.timestamp)}
                  </span>
                  {item.has_charts && <span className="history-badge">Chart</span>}
                  {item.has_kpis && <span className="history-badge">KPI</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Collapsible toggle */}
      <div className="sidebar-toggle">
        <button
          className="btn btn-secondary"
          style={{ width: '100%', padding: '8px', display: 'flex', justifyContent: 'center' }}
          onClick={onToggle}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </aside>
  );
}

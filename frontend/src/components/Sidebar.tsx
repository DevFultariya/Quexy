'use client';

import { 
  Database, 
  History, 
  LogOut, 
  ChevronLeft, 
  ChevronRight, 
  Table, 
  LayoutDashboard,
  Clock,
  User,
  Plus,
  Plug,
  Server,
  ArrowLeftRight,
  Search
} from 'lucide-react';
import type { ConnectionStatus, QueryHistoryItem } from '@/lib/types';
import { disconnectDataSource, getSavedConnections, activateConnection, getUsername } from '@/lib/api';
import { useState, useEffect } from 'react';
import QuexyLogo from './QuexyLogo';

interface Props {
  connectionStatus: ConnectionStatus | null;
  queryHistory: QueryHistoryItem[];
  onHistoryClick: (item: QueryHistoryItem) => void;
  onDisconnect: () => void;
  collapsed: boolean;
  onToggle: () => void;
  onConnected: (status: ConnectionStatus) => void;
  onLogout: () => void;
  onOpenConnect: () => void;
}

export default function Sidebar({
  connectionStatus,
  queryHistory,
  onHistoryClick,
  onDisconnect,
  collapsed,
  onToggle,
  onConnected,
  onLogout,
  onOpenConnect,
}: Props) {
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [username, setUsername] = useState('');
  const [savedConnections, setSavedConnections] = useState<any[]>([]);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const isConnected = !!connectionStatus;

  useEffect(() => {
    const savedName = getUsername();
    if (savedName) setUsername(savedName);
    loadSavedConnections();
  }, [connectionStatus]);

  const loadSavedConnections = async () => {
    try {
      const res = await getSavedConnections();
      if (res.success) setSavedConnections(res.data);
    } catch { /* silent */ }
  };

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

  const handleActivateConnection = async (id: string) => {
    setIsDisconnecting(true);
    try {
      const res = await activateConnection(id);
      if (res.success) {
        onConnected(res.data);
        setShowProfileSwitcher(false);
      }
    } catch (err) {
      console.error('Failed to switch database connection:', err);
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

  // Shared style helpers
  const sectionLabel = (text: string) => (
    <div style={{
      fontSize: '10px',
      fontWeight: 700,
      color: 'rgba(255, 255, 255, 0.25)',
      textTransform: 'uppercase' as const,
      letterSpacing: '1.2px',
      padding: '0 20px',
      marginBottom: '8px',
      marginTop: '4px',
    }}>
      {text}
    </div>
  );

  return (
    <aside
      className={`sidebar ${collapsed ? 'collapsed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(12, 12, 18, 0.98) 0%, rgba(8, 8, 14, 0.99) 100%)',
        borderRight: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* ===== HEADER: Logo + Collapse ===== */}
      <div style={{
        padding: collapsed ? '12px' : '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        minHeight: '56px',
        position: 'relative',
      }}>
        {!collapsed ? (
          <>
            <QuexyLogo size="sm" showText={true} />
            <button
              onClick={onToggle}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.2)'; e.currentTarget.style.background = 'transparent'; }}
              title="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={onToggle}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s',
              width: '100%',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#C084FC'; e.currentTarget.style.background = 'rgba(124, 58, 237, 0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255, 255, 255, 0.3)'; e.currentTarget.style.background = 'transparent'; }}
            title="Expand sidebar"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* ===== CONNECTION STATUS ===== */}
      {!collapsed && (
        <div style={{ padding: '12px 12px 8px' }}>
          {isConnected ? (
            <div style={{
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(52, 211, 153, 0.04)',
              border: '1px solid rgba(52, 211, 153, 0.1)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: '#34D399',
                    boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
                  }} />
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#6EE7B7' }}>Connected</span>
                </div>
                <button
                  onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                  style={{
                    background: 'transparent', border: 'none',
                    color: 'rgba(255, 255, 255, 0.3)', fontSize: '10px',
                    cursor: 'pointer', fontWeight: 600, padding: 0,
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.6)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {showProfileSwitcher ? '← Back' : <ArrowLeftRight size={12} />}
                </button>
              </div>

              {!showProfileSwitcher ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '140px',
                  }}>
                    {connectionStatus.source_name}
                  </div>
                  <button
                    onClick={handleDisconnectClick}
                    disabled={isDisconnecting}
                    style={{
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.15)',
                      borderRadius: '6px', padding: '3px 8px',
                      color: '#F87171', fontSize: '10px', fontWeight: 600,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', maxHeight: '100px', overflowY: 'auto' }}>
                  {savedConnections
                    .filter(c => c.name !== connectionStatus.source_name)
                    .map((conn) => (
                      <button
                        key={conn.id}
                        onClick={() => handleActivateConnection(conn.id)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px', padding: '5px 8px',
                          color: 'var(--text-secondary)', fontSize: '11px',
                          textAlign: 'left', cursor: 'pointer', width: '100%',
                          fontWeight: 500, transition: 'all 0.15s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      >
                        {conn.name}
                      </button>
                    ))}
                  <button
                    onClick={onOpenConnect}
                    style={{
                      background: 'rgba(124, 58, 237, 0.08)',
                      border: '1px dashed rgba(124, 58, 237, 0.25)',
                      borderRadius: '6px', padding: '5px 8px',
                      color: '#A78BFA', fontSize: '11px',
                      cursor: 'pointer', width: '100%', fontWeight: 600,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                    }}
                  >
                    <Plus size={10} /> New Source
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Disconnected — prominent connect CTA */
            <button
              onClick={onOpenConnect}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)',
                border: '1px dashed rgba(124, 58, 237, 0.3)',
                color: '#C084FC',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(99,102,241,0.12) 100%)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(99,102,241,0.08) 100%)'; e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)'; }}
            >
              <Plug size={14} />
              Connect Data Source
            </button>
          )}
        </div>
      )}

      {/* Collapsed: connection indicator */}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
          {isConnected ? (
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 8px rgba(52, 211, 153, 0.5)',
            }} title="Connected" />
          ) : (
            <button
              onClick={onOpenConnect}
              title="Connect Database"
              style={{
                background: 'rgba(124, 58, 237, 0.12)',
                border: '1px solid rgba(124, 58, 237, 0.25)',
                borderRadius: '8px', padding: '6px',
                color: '#A78BFA', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Plug size={14} />
            </button>
          )}
        </div>
      )}

      {/* ===== NAVIGATION ===== */}
      <div style={{ padding: '8px 0 4px' }}>
        {!collapsed && sectionLabel('Navigate')}
        <div style={{
          margin: collapsed ? '0 8px' : '0 12px',
          padding: '7px 10px',
          borderRadius: '8px',
          background: 'rgba(124, 58, 237, 0.08)',
          color: '#C084FC',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'default',
          justifyContent: collapsed ? 'center' : 'flex-start',
        }}>
          <LayoutDashboard size={16} />
          {!collapsed && 'Dashboard'}
        </div>
      </div>

      {/* ===== TABLES EXPLORER ===== */}
      {isConnected && connectionStatus.tables && connectionStatus.tables.length > 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingTop: '8px',
        }}>
          {!collapsed && sectionLabel(`Tables · ${connectionStatus.tables.length}`)}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 12px',
          }}>
            {connectionStatus.tables.map((table) => (
              <div
                key={table.name}
                title={`${table.name} — ${table.rows} rows, ${table.columns} cols`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: collapsed ? 'center' : 'space-between',
                  padding: collapsed ? '6px' : '5px 10px',
                  borderRadius: '7px',
                  marginBottom: '1px',
                  cursor: 'default',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {!collapsed ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', flex: 1 }}>
                      <Table size={13} style={{ color: 'rgba(255, 255, 255, 0.2)', flexShrink: 0 }} />
                      <span style={{
                        fontSize: '12px',
                        fontWeight: 500,
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {table.name}
                      </span>
                    </div>
                    {table.rows !== undefined && table.rows !== null && table.rows !== 'unknown' && table.rows !== -1 && (
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        color: 'rgba(255, 255, 255, 0.15)',
                        flexShrink: 0,
                        marginLeft: '8px',
                      }}>
                        {table.rows}
                      </span>
                    )}
                  </>
                ) : (
                  <span title={table.name} style={{ display: 'inline-flex' }}>
                    <Table size={14} style={{ color: 'rgba(255, 255, 255, 0.2)' }} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== QUERY HISTORY ===== */}
      {!collapsed && queryHistory && queryHistory.length > 0 && (
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '220px',
          paddingTop: '8px',
        }}>
          {sectionLabel('Recent Queries')}
          <div style={{ overflowY: 'auto', padding: '0 12px 8px' }}>
            {queryHistory.slice(0, 15).map((item) => (
              <div
                key={item.query_id}
                onClick={() => onHistoryClick(item)}
                style={{
                  padding: '8px 10px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  marginBottom: '2px',
                  transition: 'background 0.12s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  marginBottom: '3px',
                }}>
                  {item.question}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.2)',
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={9} />
                    {formatTimestamp(item.timestamp)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== FOOTER: User + Logout ===== */}
      <div style={{
        marginTop: 'auto',
        borderTop: '1px solid rgba(255, 255, 255, 0.04)',
        padding: collapsed ? '12px 8px' : '10px 12px',
      }}>
        {!collapsed ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 8px',
            borderRadius: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {/* Avatar circle */}
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.2), rgba(99, 102, 241, 0.15))',
                border: '1px solid rgba(124, 58, 237, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 700,
                color: '#C084FC',
                flexShrink: 0,
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span style={{
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {username}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.2)',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.2)'; e.currentTarget.style.background = 'transparent'; }}
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(99,102,241,0.15))',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 700, color: '#C084FC',
            }}>
              {username.charAt(0).toUpperCase()}
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              style={{
                background: 'transparent', border: 'none',
                color: 'rgba(255,255,255,0.2)', cursor: 'pointer',
                padding: '4px', borderRadius: '6px',
                display: 'flex', alignItems: 'center',
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#F87171'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.2)'}
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

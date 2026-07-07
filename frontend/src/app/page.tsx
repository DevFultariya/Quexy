'use client';

import { useState, useEffect } from 'react';
import ConnectDataSource from '@/components/ConnectDataSource';
import Sidebar from '@/components/Sidebar';
import QueryInterface from '@/components/QueryInterface';
import AdaptiveResponse from '@/components/AdaptiveResponse';
import LoadingState from '@/components/LoadingState';
import { getConnectionStatus, submitQuery, getQueryHistory, getQueryById } from '@/lib/api';
import type { ConnectionStatus, QueryResponse, QueryHistoryItem } from '@/lib/types';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function Home() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check connection status on mount
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await getConnectionStatus();
      if (res.data.connected) {
        setConnectionStatus(res.data);
        setIsConnected(true);
        refreshHistory();
      }
    } catch {
      // Not connected yet — that's fine
    }
  };

  const handleConnected = (status: ConnectionStatus) => {
    setConnectionStatus(status);
    setIsConnected(true);
    setError(null);
  };

  const handleDisconnect = () => {
    setConnectionStatus(null);
    setIsConnected(false);
    setCurrentResponse(null);
    setQueryHistory([]);
  };

  const handleQuery = async (question: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentResponse(null);

    try {
      const res = await submitQuery(question);
      setCurrentResponse(res.data);
      refreshHistory();
    } catch (err: any) {
      setError(err.message || 'Failed to process query');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistoryClick = async (item: QueryHistoryItem) => {
    try {
      const res = await getQueryById(item.query_id);
      setCurrentResponse(res.data);
    } catch {
      // Failed to load history item
    }
  };

  const refreshHistory = async () => {
    try {
      const res = await getQueryHistory();
      setQueryHistory(res.data);
    } catch {
      // History fetch failed — non-critical
    }
  };

  // --- Not Connected: Show Connect Screen ---
  if (!isConnected) {
    return <ConnectDataSource onConnected={handleConnected} />;
  }

  // --- Connected: Show Dashboard ---
  return (
    <div className="app-layout">
      <Sidebar
        connectionStatus={connectionStatus}
        queryHistory={queryHistory}
        onHistoryClick={handleHistoryClick}
        onDisconnect={handleDisconnect}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* Query Input */}
        <QueryInterface
          onSubmit={handleQuery}
          isLoading={isLoading}
          tables={connectionStatus?.tables || []}
        />

        {/* Loading State */}
        {isLoading && <LoadingState />}

        {/* Error State */}
        {error && !isLoading && (
          <div className="error-container animate-fade-in-up">
            <div className="error-icon">
              <MessageSquare size={24} />
            </div>
            <h3 className="error-title">Something went wrong</h3>
            <p className="error-message">{error}</p>
          </div>
        )}

        {/* Response */}
        {currentResponse && !isLoading && (
          <AdaptiveResponse response={currentResponse} />
        )}

        {/* Empty State */}
        {!currentResponse && !isLoading && !error && (
          <div className="empty-state animate-fade-in">
            <div className="empty-state-icon">
              <Sparkles size={32} />
            </div>
            <h3 className="empty-state-title">Ask Quexy anything</h3>
            <p className="empty-state-text">
              Type a question about your data above. Quexy will analyze it
              and present intelligent, interactive results.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import ConnectDataSource from '@/components/ConnectDataSource';
import Sidebar from '@/components/Sidebar';
import QueryInterface from '@/components/QueryInterface';
import AdaptiveResponse from '@/components/AdaptiveResponse';
import LoadingState from '@/components/LoadingState';
import AuthModal from '@/components/AuthModal';
import LandingPage from '@/components/LandingPage';
import OnboardingWelcome from '@/components/OnboardingWelcome';
import { 
  getConnectionStatus, 
  submitQuery, 
  getQueryHistory, 
  getQueryById,
  getMe,
  removeToken,
  removeUsername,
  getUsername
} from '@/lib/api';
import type { ConnectionStatus, QueryResponse, QueryHistoryItem } from '@/lib/types';
import { MessageSquare, Sparkles } from 'lucide-react';

export default function Home() {
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [showConnectModal, setShowConnectModal] = useState(false);

  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [queryHistory, setQueryHistory] = useState<QueryHistoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeQuestionText, setActiveQuestionText] = useState('');

  // Check auth and connection on mount
  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    const savedName = getUsername();
    if (savedName) {
      try {
        const res = await getMe();
        if (res.success) {
          setUser({ username: res.data.username });
          await checkConnection();
        } else {
          logout();
        }
      } catch {
        logout();
      }
    }
    setAuthChecked(true);
  };

  const checkConnection = async () => {
    try {
      const res = await getConnectionStatus();
      if (res.data.connected) {
        setConnectionStatus(res.data);
        setIsConnected(true);
        refreshHistory();
      }
    } catch {
      // Not connected yet — normal flow
    }
  };

  const handleAuthSuccess = (username: string) => {
    setUser({ username });
    setShowAuth(false);
    checkConnection();
  };

  const logout = () => {
    removeToken();
    removeUsername();
    setUser(null);
    handleDisconnect();
  };

  const handleConnected = (status: ConnectionStatus) => {
    setConnectionStatus(status);
    setIsConnected(true);
    setError(null);
    setShowConnectModal(false);
    refreshHistory();
  };

  const handleDisconnect = () => {
    setConnectionStatus(null);
    setIsConnected(false);
    setCurrentResponse(null);
    setQueryHistory([]);
  };

  const handleQuery = async (question: string) => {
    setActiveQuestionText(question);
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
    setActiveQuestionText(item.question);
    setIsLoading(true);
    setCurrentResponse(null);
    setError(null);
    try {
      const res = await getQueryById(item.query_id);
      setCurrentResponse(res.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load history query data.');
    } finally {
      setIsLoading(false);
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

  // --- Show Loading spinner while verifying auth token ---
  if (!authChecked) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-void)', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState />
      </div>
    );
  }

  // --- Show Landing Page + optional Auth overlay when not logged in ---
  if (!user) {
    return (
      <>
        <LandingPage
          onGetStarted={() => { setAuthMode('register'); setShowAuth(true); }}
          onSignIn={() => { setAuthMode('login'); setShowAuth(true); }}
        />
        {showAuth && (
          <AuthModal
            onSuccess={handleAuthSuccess}
            onClose={() => setShowAuth(false)}
            initialMode={authMode}
          />
        )}
      </>
    );
  }

  // --- UNIFIED APP SHELL (always visible after login) ---
  return (
    <div className="app-layout">
      <Sidebar
        connectionStatus={connectionStatus}
        queryHistory={queryHistory}
        onHistoryClick={handleHistoryClick}
        onDisconnect={handleDisconnect}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onConnected={handleConnected}
        onLogout={logout}
        onOpenConnect={() => setShowConnectModal(true)}
      />

      <main className={`main-content ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        {/* STATE 1: No database connected → Onboarding welcome */}
        {!isConnected && (
          <OnboardingWelcome
            username={user.username}
            onConnectClick={() => setShowConnectModal(true)}
          />
        )}

        {/* STATE 2 & 3: Database connected → Query interface + results */}
        {isConnected && (
          <>
            {/* Query Input */}
            <QueryInterface
              onSubmit={handleQuery}
              isLoading={isLoading}
              tables={connectionStatus?.tables || []}
              initialValue={activeQuestionText}
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

            {/* Empty State (connected but no query yet) */}
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
          </>
        )}
      </main>

      {/* Connect Data Source Modal (opens on demand) */}
      {showConnectModal && (
        <ConnectDataSource
          onConnected={handleConnected}
          onClose={() => setShowConnectModal(false)}
        />
      )}
    </div>
  );
}

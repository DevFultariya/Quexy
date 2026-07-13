'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles } from 'lucide-react';
import type { TableInfo } from '@/lib/types';

interface Props {
  onSubmit: (question: string) => void;
  isLoading: boolean;
  tables: TableInfo[];
  initialValue?: string;
}

const SUGGESTIONS = [
  'Show me total revenue',
  'Monthly sales trends',
  'Top 10 products by profit',
  'Compare revenue by region',
  'Analyze my business',
  'Which category performs best?',
  'Show customers with highest orders',
  'Revenue distribution by state',
];

export default function QueryInterface({ onSubmit, isLoading, tables, initialValue }: Props) {
  const [question, setQuestion] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with initialValue (e.g. from query history click)
  useEffect(() => {
    if (initialValue !== undefined) {
      setQuestion(initialValue);
    }
  }, [initialValue]);

  // Rotate placeholder suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!question.trim() || isLoading) return;
    onSubmit(question.trim());
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
    onSubmit(suggestion);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Pick 4 random suggestions based on table context
  const displaySuggestions = SUGGESTIONS.slice(0, 5);

  return (
    <div className="query-container">
      <form onSubmit={handleSubmit}>
        <div className="query-bar">
          <Sparkles size={20} style={{ color: 'var(--accent-primary)', flexShrink: 0, marginLeft: 4 }} />
          <input
            ref={inputRef}
            className="query-input"
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={SUGGESTIONS[placeholderIndex]}
            disabled={isLoading}
            autoFocus
            id="query-input"
          />
          <button
            type="submit"
            className="query-submit-btn"
            disabled={!question.trim() || isLoading}
            id="query-submit"
          >
            {isLoading ? (
              <div className="loading-dots" style={{ gap: 3 }}>
                <div className="loading-dot" style={{ width: 4, height: 4 }} />
                <div className="loading-dot" style={{ width: 4, height: 4 }} />
                <div className="loading-dot" style={{ width: 4, height: 4 }} />
              </div>
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </form>

      {/* Suggestion chips */}
      <div className="query-suggestions">
        {displaySuggestions.map((suggestion) => (
          <button
            key={suggestion}
            className="query-suggestion-chip"
            onClick={() => handleSuggestionClick(suggestion)}
            disabled={isLoading}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

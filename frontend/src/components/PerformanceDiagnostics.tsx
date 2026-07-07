'use client';

import { useState } from 'react';
import { Cpu, Sparkles, Copy, Check, ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { PerformanceReport } from '@/lib/types';

interface Props {
  report: PerformanceReport;
}

export default function PerformanceDiagnostics({ report }: Props) {
  const [showPlan, setShowPlan] = useState(false);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  const handleCopy = (sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedSql(sql);
    setTimeout(() => setCopiedSql(null), 2000);
  };

  return (
    <div 
      className="glass-card animate-fade-in-up" 
      style={{ 
        marginTop: 'var(--space-8)',
        border: '1px solid rgba(124, 58, 237, 0.15)',
        background: 'linear-gradient(135deg, rgba(18, 18, 26, 0.8), rgba(26, 26, 46, 0.5))',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative top gradient bar indicating DBA diagnostics */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)'
      }} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '8px', 
            background: 'rgba(124, 58, 237, 0.15)', 
            color: 'var(--accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Cpu size={16} />
          </div>
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
              Performance & Execution Diagnostics
            </h3>
            <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
              Automated Compiler Analysis & Query Plan Tuning
            </span>
          </div>
        </div>

        {report.ast_corrected && (
          <span style={{
            fontSize: '11px',
            fontWeight: 600,
            background: 'rgba(139, 92, 246, 0.15)',
            color: '#A78BFA',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            marginLeft: 'auto'
          }}>
            <Sparkles size={10} />
            AST Corrected
          </span>
        )}
      </div>

      {/* AST Correction SQL Comparison Diff Box */}
      {report.ast_corrected && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Programmatic Schema Correction:
          </span>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
            {/* Original AI generated SQL */}
            <div style={{
              background: 'rgba(239, 68, 68, 0.03)',
              border: '1px solid rgba(239, 68, 68, 0.15)',
              borderRadius: '8px',
              padding: '12px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute', top: '8px', right: '12px', fontSize: '9px', fontWeight: 600, color: '#EF4444',
                background: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase'
              }}>Original Prompt SQL (Hallucinated)</span>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: '#FCA5A5', display: 'block', wordBreak: 'break-all', marginTop: '12px' }}>
                {report.original_sql}
              </code>
            </div>

            {/* Programmatically Corrected SQL */}
            <div style={{
              background: 'rgba(16, 185, 129, 0.03)',
              border: '1px solid rgba(16, 185, 129, 0.15)',
              borderRadius: '8px',
              padding: '12px',
              position: 'relative'
            }}>
              <span style={{
                position: 'absolute', top: '8px', right: '12px', fontSize: '9px', fontWeight: 600, color: '#10B981',
                background: 'rgba(16, 185, 129, 0.1)', padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase'
              }}>Rewritten SQL (Compiled & Executed)</span>
              <code style={{ fontFamily: 'monospace', fontSize: '12px', color: '#34D399', display: 'block', wordBreak: 'break-all', marginTop: '12px' }}>
                {report.corrected_sql}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* SQL View if not AST Corrected */}
      {!report.ast_corrected && (
        <div style={{ marginBottom: '20px' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '6px' }}>Executed SQL Statement:</span>
          <div style={{ 
            background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: '8px', 
            border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <code style={{ fontFamily: 'monospace', fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1, marginRight: '16px' }}>
              {report.original_sql}
            </code>
            <button 
              onClick={() => handleCopy(report.original_sql)}
              style={{
                background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0
              }}
              title="Copy SQL Query"
            >
              {copiedSql === report.original_sql ? <Check size={14} style={{ color: 'var(--color-success)' }} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      )}

      {/* DBA Advice / Performance Recommendations */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
        {report.advice.map((item, idx) => {
          const isWarning = item.type === 'warning';
          const isSuccess = item.type === 'success';
          
          return (
            <div 
              key={idx}
              style={{
                display: 'flex',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isWarning 
                  ? 'rgba(245, 158, 11, 0.03)' 
                  : isSuccess 
                    ? 'rgba(16, 185, 129, 0.03)' 
                    : 'rgba(59, 130, 246, 0.03)',
                border: `1px solid ${
                  isWarning 
                    ? 'rgba(245, 158, 11, 0.15)' 
                    : isSuccess 
                      ? 'rgba(16, 185, 129, 0.15)' 
                      : 'rgba(59, 130, 246, 0.15)'
                }`
              }}
            >
              <div style={{ 
                color: isWarning ? 'var(--color-warning)' : isSuccess ? 'var(--color-success)' : 'var(--color-info)',
                flexShrink: 0,
                marginTop: '1px'
              }}>
                {isWarning ? <AlertTriangle size={16} /> : isSuccess ? <CheckCircle2 size={16} /> : <Info size={16} />}
              </div>
              
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '13px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.5 }}>
                  {item.message}
                </p>
                {item.action_sql && (
                  <div style={{ 
                    marginTop: '10px', 
                    background: 'rgba(10, 10, 15, 0.6)', 
                    padding: '8px 12px', 
                    borderRadius: '6px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <code style={{ fontFamily: 'monospace', fontSize: '11px', color: 'var(--accent-secondary)', wordBreak: 'break-all', flex: 1, marginRight: '16px' }}>
                      {item.action_sql}
                    </code>
                    <button 
                      onClick={() => handleCopy(item.action_sql!)}
                      style={{
                        background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', display: 'flex', alignItems: 'center'
                      }}
                      title="Copy Optimization Statement"
                    >
                      {copiedSql === item.action_sql ? <Check size={12} style={{ color: 'var(--color-success)' }} /> : <Copy size={12} />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Explain Plan */}
      {report.explain_plan && report.explain_plan.length > 0 && (
        <div>
          <button
            onClick={() => setShowPlan(!showPlan)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 0'
            }}
          >
            {showPlan ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showPlan ? 'Hide Raw Database Execution Plan' : 'Inspect Raw Database Execution Plan'}
          </button>
          
          {showPlan && (
            <div className="animate-fade-in-up" style={{
              marginTop: '10px',
              background: 'rgba(10, 10, 15, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              padding: '14px',
              overflowX: 'auto'
            }}>
              <pre style={{ 
                fontFamily: 'monospace', 
                fontSize: '11px', 
                color: 'var(--text-secondary)', 
                margin: 0,
                lineHeight: 1.6
              }}>
                {report.explain_plan.join('\n')}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

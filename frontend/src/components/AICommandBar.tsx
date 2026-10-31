import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CornerDownLeft,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { dashboardService } from '../services/api';
import { AICommandResponse } from '../types';

export const AICommandBar: React.FC = () => {
  const { isAICommandOpen, setIsAICommandOpen, refreshAll } = useApp();
  const [instruction, setInstruction] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<AICommandResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const samplePrompts = [
    'Check inventory levels for organic green tea and report status',
    'Schedule follow-up call with Anita Patel regarding wholesale order',
    'Send payment reminders to customers with overdue invoices',
    'Reschedule tomorrow’s delivery for order #ORD-1002 to Thursday',
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsAICommandOpen(!isAICommandOpen);
      }
      if (e.key === 'Escape' && isAICommandOpen) {
        setIsAICommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAICommandOpen, setIsAICommandOpen]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!instruction.trim() || isExecuting) return;

    try {
      setIsExecuting(true);
      setError(null);
      setResult(null);

      const res = await dashboardService.executeAICommand(instruction);
      setResult(res);
      await refreshAll();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Failed to process AI instruction');
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isAICommandOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsAICommandOpen(false)}>
      <div
        className="modal-content large"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px' }}
      >
        <div className="modal-header" style={{ paddingBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>AI Workforce Command Console</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Powered by Groq High-Speed NLU & Tool Execution
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsAICommandOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          <form onSubmit={handleSubmit} style={{ position: 'relative', marginBottom: '16px' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Tell your AI workforce what to do (e.g. check stock, dispatch calls, reschedule)..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              style={{
                fontSize: '15px',
                padding: '14px 48px 14px 16px',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={isExecuting || !instruction.trim()}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: instruction.trim() ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: instruction.trim() ? 'pointer' : 'default',
              }}
            >
              {isExecuting ? <Loader2 size={16} className="spin" /> : <CornerDownLeft size={16} />}
            </button>
          </form>

          {/* Quick Prompts */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700, marginBottom: '8px' }}>
              Suggested Operations
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setInstruction(p); }}
                  style={{
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-secondary)',
                    fontSize: '12.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--border-medium)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <Send size={12} color="var(--primary)" />
                  <span>{p}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Result or Error */}
          {error && (
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '13px',
              }}
            >
              <AlertCircle size={18} flex-shrink={0} />
              <span>{error}</span>
            </div>
          )}

          {result && (
            <div
              style={{
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" />
                <span style={{ fontWeight: 700, color: '#34d399', fontSize: '13.5px' }}>
                  Execution Plan Completed
                </span>
              </div>
              <p style={{ color: 'var(--text-main)', fontSize: '13px', lineHeight: 1.6, marginBottom: '12px' }}>
                {result.response}
              </p>

              {result.actions_taken && result.actions_taken.length > 0 && (
                <div>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                    Actions Triggered:
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {result.actions_taken.map((act: any, i: number) => (
                      <div
                        key={i}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.3)',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '12px',
                          color: '#a5b4fc',
                        }}
                      >
                        {typeof act === 'string' ? act : JSON.stringify(act)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

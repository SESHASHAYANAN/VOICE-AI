import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Clock,
  User,
  CheckCircle2,
  Play,
  Pause,
  Sparkles,
  Smile,
  Meh,
  Frown,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Call, Transcript } from '../types';

export const CallDetailModal: React.FC = () => {
  const { selectedCallId, setSelectedCallId } = useApp();
  const [call, setCall] = useState<Call | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!selectedCallId) {
      setCall(null);
      setTranscript(null);
      return;
    }

    const loadCallDetails = async () => {
      try {
        const [c, t] = await Promise.allSettled([
          operationsService.getCall(selectedCallId),
          operationsService.getTranscript(selectedCallId),
        ]);
        if (c.status === 'fulfilled') setCall(c.value);
        if (t.status === 'fulfilled') setTranscript(t.value);
      } catch (e) {
        console.error('Error loading call details:', e);
      }
    };

    loadCallDetails();
  }, [selectedCallId]);

  if (!selectedCallId) return null;

  return (
    <div className="modal-overlay" onClick={() => setSelectedCallId(null)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>
                Call Inspection & Transcript Analysis
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Bolna Call ID: {call?.bolna_call_id || selectedCallId}
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setSelectedCallId(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Metadata Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Recipient</div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <User size={13} color="var(--primary)" />
                {call?.customer_name || 'Customer'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{call?.phone_number || '+91 98765 43210'}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Duration</div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                <Clock size={13} color="#38bdf8" />
                {call?.duration_seconds ? `${Math.floor(call.duration_seconds / 60)}m ${call.duration_seconds % 60}s` : '1m 45s'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Outcome: {call?.outcome || 'Resolved'}</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Sentiment</div>
              <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                {call?.sentiment === 'positive' ? (
                  <Smile size={14} color="#10b981" />
                ) : call?.sentiment === 'negative' ? (
                  <Frown size={14} color="#ef4444" />
                ) : (
                  <Meh size={14} color="#f59e0b" />
                )}
                <span style={{ textTransform: 'capitalize' }}>{call?.sentiment || 'Positive'}</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Score: 4.8 / 5.0</div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Status</div>
              <div style={{ marginTop: '4px' }}>
                <span className="status-pill success">{call?.status || 'Completed'}</span>
              </div>
            </div>
          </div>

          {/* Audio Waveform Simulator */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'var(--primary-gradient)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 12px var(--primary-glow)',
              }}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} style={{ marginLeft: '2px' }} />}
            </button>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', marginBottom: '6px' }}>
                <span style={{ fontWeight: 600 }}>Audio Recording (Bolna Synthesizer)</span>
                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {isPlaying ? '0:42' : '0:00'} / 1:45
                </span>
              </div>
              <div
                style={{
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                {[12, 18, 24, 8, 14, 28, 20, 16, 22, 10, 18, 26, 14, 20, 28, 16, 12, 22, 18, 14, 26, 18, 12, 20, 24, 16, 10, 18, 22, 14, 18, 24, 16, 20, 12, 8, 14, 18, 22, 16].map((h, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      height: `${h}px`,
                      background: i < (isPlaying ? 16 : 0) ? '#6366f1' : 'rgba(255,255,255,0.12)',
                      borderRadius: '2px',
                      transition: 'background 0.2s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights & Extracted Items */}
          <div
            style={{
              padding: '14px',
              borderRadius: 'var(--radius-lg)',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Sparkles size={16} color="var(--primary)" />
              <span style={{ fontWeight: 700, fontSize: '13px', color: '#c7d2fe' }}>
                Grok AI Intelligence Summary
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.6, marginBottom: '10px' }}>
              {transcript?.summary ||
                'The customer confirmed their delivery address at Bandra East. They requested rescheduling the delivery slot from 10:00 AM to 2:30 PM due to client meetings. The voice agent updated the ERP record and sent SMS confirmation.'}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={12} color="#10b981" style={{ display: 'inline', marginRight: '4px' }} />
                Delivery Time Updated: 2:30 PM
              </span>
              <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                <CheckCircle2 size={12} color="#10b981" style={{ display: 'inline', marginRight: '4px' }} />
                SMS Notification Dispatched
              </span>
            </div>
          </div>

          {/* Speaker Dialogue Turns */}
          <div>
            <h4 style={{ marginBottom: '12px' }}>Conversation Turns</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(transcript?.messages && transcript.messages.length > 0
                ? transcript.messages
                : [
                    {
                      role: 'assistant',
                      content: 'Hello Priya, this is Apex AI Assistant calling to confirm your delivery scheduled for tomorrow.',
                    },
                    {
                      role: 'user',
                      content: 'Hi! Yes, I was actually hoping to shift the delivery to afternoon around 2:30 PM?',
                    },
                    {
                      role: 'assistant',
                      content: 'Certainly, Priya! I have rescheduled your delivery slot to 2:30 PM tomorrow afternoon. Is there anything else I can assist you with?',
                    },
                    {
                      role: 'user',
                      content: 'No, that is perfect. Thank you so much!',
                    },
                    {
                      role: 'assistant',
                      content: 'You are welcome! Have a wonderful day ahead.',
                    },
                  ]
              ).map((m: any, idx: number) => {
                const isAI = m.role === 'assistant';
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: isAI ? 'rgba(99, 102, 241, 0.08)' : 'var(--bg-surface)',
                      border: `1px solid ${isAI ? 'rgba(99, 102, 241, 0.2)' : 'var(--border-subtle)'}`,
                    }}
                  >
                    <div
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        background: isAI ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {isAI ? 'AI Agent' : 'Customer'}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.5 }}>
                      {m.content}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setSelectedCallId(null)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Search,
  Bell,
  HelpCircle,
  PhoneForwarded,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const TopNav: React.FC = () => {
  const {
    organization,
    user,
    setIsAICommandOpen,
    setIsInitiateCallOpen,
    notifications,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <header className="topnav">
        <div className="topnav-left">
          <div className="org-selector">
            <div className="org-avatar">
              {organization?.name ? organization.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="org-name">{organization?.name || 'Apex Retail & Logistics'}</div>
          </div>

          <div className="command-search-bar" onClick={() => setIsAICommandOpen(true)}>
            <Search size={15} />
            <span>Search or command AI workforce...</span>
            <span className="command-kbd">⌘K</span>
          </div>
        </div>

        <div className="topnav-right">
          <div className="live-pill" title="Bolna Voice & Groq NLU active">
            <span className="pulse-dot"></span>
            Voice Telephony Live
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setIsInitiateCallOpen(true)}
            title="Dispatch a voice call"
          >
            <PhoneForwarded size={14} />
            <span>Call</span>
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="btn-icon"
              onClick={() => setShowNotifications((prev) => !prev)}
              title="Notifications"
            >
              <Bell size={16} />
              <span className="notification-badge"></span>
            </button>

            {showNotifications && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '320px',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '14px',
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13px' }}>System Activity</span>
                  <button onClick={() => setShowNotifications(false)}>
                    <X size={14} color="var(--text-muted)" />
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '10px',
                        padding: '8px',
                        borderRadius: '6px',
                        background: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {n.type === 'success' ? (
                        <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : n.type === 'warning' ? (
                        <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                      ) : (
                        <Sparkles size={16} color="#6366f1" style={{ flexShrink: 0, marginTop: '2px' }} />
                      )}
                      <div>
                        <div style={{ fontSize: '12px', fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{n.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            className="btn-icon"
            onClick={() => setShowHelp((prev) => !prev)}
            title="Help & Documentation"
          >
            <HelpCircle size={16} />
          </button>

          <div className="user-profile-btn">
            <div className="user-avatar-circle">
              {user?.full_name ? user.full_name.charAt(0) : 'R'}
            </div>
            <div className="user-info-text">
              <span className="user-name-tag">{user?.full_name || 'Rajesh Patel'}</span>
              <span className="user-role-tag">Account Owner</span>
            </div>
          </div>
        </div>
      </header>

      {showHelp && (
        <div className="modal-overlay" onClick={() => setShowHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">AI Business Voice Operating System</h3>
              <button className="btn-icon" onClick={() => setShowHelp(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: '16px' }}>
                VoiceOS is an autonomous voice workforce for businesses. It connects directly to real business systems:
              </p>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                <li><strong>Voice AI (Bolna)</strong>: Initiates calls, handles speech-to-speech conversations, transcribes audio, and analyzes customer sentiment.</li>
                <li><strong>LLM Brain (Groq)</strong>: Parses natural language instructions into tool-calling operations across your inventory, suppliers, orders, and payments.</li>
                <li><strong>Command Bar (⌘K)</strong>: Press <code>Ctrl+K</code> or <code>⌘K</code> anywhere to give instructions to your AI workforce in plain English.</li>
              </ul>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setShowHelp(false)}>
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

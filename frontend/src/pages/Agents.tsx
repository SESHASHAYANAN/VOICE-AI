import React, { useState } from 'react';
import {
  Bot,
  Plus,
  Play,
  Volume2,
  Globe,
  Clock,
  Sparkles,
  PhoneCall,
  CheckCircle2,
  Trash2,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { agentService } from '../services/api';

export const Agents: React.FC = () => {
  const { agents, setIsCreateAgentOpen, refreshAll } = useApp();
  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [testPrompt, setTestPrompt] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isLoadingTest, setIsLoadingTest] = useState(false);
  const [deployingId, setDeployingId] = useState<string | null>(null);

  const handleDeploy = async (agentId: string) => {
    try {
      setDeployingId(agentId);
      await agentService.deployAgent(agentId);
      await refreshAll();
      alert('Agent successfully deployed to Bolna Voice Platform!');
    } catch (e: any) {
      alert('Deployment error: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setDeployingId(null);
    }
  };

  const handleTest = async (agentId: string) => {
    if (!testPrompt.trim()) return;
    try {
      setIsLoadingTest(true);
      const res = await agentService.testAgent(agentId, testPrompt);
      setTestResponse(res.response || 'Agent verified.');
    } catch (e: any) {
      setTestResponse('Test failed: ' + (e?.response?.data?.detail || e.message));
    } finally {
      setIsLoadingTest(false);
    }
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">AI Agent Studio</h1>
          <p className="page-desc">
            Design, test, and deploy specialized autonomous voice employees powered by Bolna & Groq.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsCreateAgentOpen(true)}>
          <Plus size={16} /> Create AI Agent
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--primary-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      boxShadow: '0 0 12px var(--primary-glow)',
                    }}
                  >
                    <Bot size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '15px' }}>{agent.name}</h3>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                      Type: <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{agent.agent_type}</span>
                    </div>
                  </div>
                </div>

                <span className="status-pill success">
                  <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                  Active
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {agent.description || agent.personality || 'Handles customer operations, orders, and inquiries.'}
              </p>

              {/* Specs & Capabilities */}
              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px',
                  fontSize: '12px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Volume2 size={14} color="var(--primary)" />
                  <span>{agent.voice_id || 'Ananya'} (Bolna)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Globe size={14} color="#06b6d4" />
                  <span>{agent.language?.toUpperCase() || 'EN'} &bull; Multilingual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <Clock size={14} color="#f59e0b" />
                  <span>{agent.working_hours_start || '09:00'} - {agent.working_hours_end || '19:00'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                  <CheckCircle2 size={14} color="#10b981" />
                  <span>95% Resolution Rate</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                className="btn btn-secondary btn-sm"
                style={{ flex: 1 }}
                onClick={() => {
                  setTestingAgentId(testingAgentId === agent.id ? null : agent.id);
                  setTestPrompt('');
                  setTestResponse(null);
                }}
              >
                <MessageSquare size={13} />
                <span>Test NLU</span>
              </button>

              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1 }}
                onClick={() => handleDeploy(agent.id)}
                disabled={deployingId === agent.id}
              >
                {deployingId === agent.id ? <Loader2 size={13} className="spin" /> : <Play size={13} />}
                <span>Deploy Bolna</span>
              </button>
            </div>

            {/* Test Drawer */}
            {testingAgentId === agent.id && (
              <div
                style={{
                  marginTop: '14px',
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Live Test against Groq Brain
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. Can you check if my order was shipped?"
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                    value={testPrompt}
                    onChange={(e) => setTestPrompt(e.target.value)}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleTest(agent.id)}
                    disabled={isLoadingTest}
                  >
                    {isLoadingTest ? <Loader2 size={13} className="spin" /> : 'Run'}
                  </button>
                </div>
                {testResponse && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#c7d2fe', lineHeight: 1.4 }}>
                    {testResponse}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

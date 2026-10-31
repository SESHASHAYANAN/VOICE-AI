import React from 'react';
import {
  Plug,
  CheckCircle2,
  ExternalLink,
  Wallet,
  Cpu,
  Phone,
  Webhook,
  ShoppingBag,
  Database,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Integrations: React.FC = () => {
  const { bolnaBalance, bolnaAccount } = useApp();

  const integrations = [
    {
      id: 'bolna',
      name: 'Bolna AI Voice Platform',
      category: 'Telephony & Voice Synthesis',
      desc: 'Speech-to-speech voice pipeline, Indian language acoustic models, and PSTN outbound dialer.',
      status: 'Connected',
      active: true,
      details: [
        { label: 'Account Email', val: bolnaAccount },
        { label: 'Wallet Balance', val: `$${bolnaBalance.toFixed(2)}` },
        { label: 'Base URL', val: 'https://api.bolna.ai' },
        { label: 'API Key', val: 'bn-0c40...1ac' },
      ],
    },
    {
      id: 'groq',
      name: 'Groq Cloud LPU Inference',
      category: 'Intelligence & Function Calling',
      desc: 'Ultra-low latency natural language understanding and structured tool calling.',
      status: 'Connected',
      active: true,
      details: [
        { label: 'Model', val: 'openai/gpt-oss-120b' },
        { label: 'Latency', val: '~180ms TTFT' },
        { label: 'Tools Configured', val: '5 Business APIs' },
        { label: 'API Key', val: 'gsk_dbyM...jAk' },
      ],
    },
    {
      id: 'webhooks',
      name: 'Real-Time Webhook Streamer',
      category: 'Event Callbacks',
      desc: 'Receives call recordings, speech transcriptions, and customer intent signals.',
      status: 'Active',
      active: true,
      details: [
        { label: 'Endpoint', val: '/api/webhooks/bolna' },
        { label: 'Secret Token', val: 'Configured in .env' },
      ],
    },
    {
      id: 'erp',
      name: 'ERP & Tally / Zoho Books',
      category: 'Accounting & Procurement',
      desc: 'Synchronizes purchase orders, invoice payment records, and ledger balances.',
      status: 'Available',
      active: false,
      details: [
        { label: 'Sync Mode', val: 'Bidirectional' },
        { label: 'Status', val: 'Ready to pair' },
      ],
    },
    {
      id: 'shopify',
      name: 'Shopify / WooCommerce',
      category: 'E-commerce & Orders',
      desc: 'Real-time order synchronization for automated delivery tracking and address validation.',
      status: 'Available',
      active: false,
      details: [
        { label: 'Webhooks', val: 'orders/create, fulfillments' },
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp Business API',
      category: 'Omnichannel Messaging',
      desc: 'Send follow-up WhatsApp summaries and invoice PDFs immediately after voice calls.',
      status: 'Available',
      active: false,
      details: [
        { label: 'Provider', val: 'Meta Cloud API' },
      ],
    },
  ];

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Connected Integrations & Platforms</h1>
          <p className="page-desc">
            Manage your AI telephony engines, inference models, ERP bridges, and messaging connectors.
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
        {integrations.map((item) => (
          <div
            key={item.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border: item.active ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid var(--border-subtle)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span className={`status-pill ${item.active ? 'success' : 'info'}`}>
                  {item.active && <CheckCircle2 size={12} />}
                  {item.status}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.category}</span>
              </div>

              <h3 style={{ fontSize: '16px', marginBottom: '6px' }}>{item.name}</h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                {item.desc}
              </p>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  marginBottom: '16px',
                }}
              >
                {item.details.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{d.label}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-main)' }}>
                      {d.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <button
                className={`btn btn-sm ${item.active ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%' }}
              >
                {item.active ? 'Configure Settings' : 'Connect Integration'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

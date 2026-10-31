import React, { useState, useEffect } from 'react';
import {
  GitBranch,
  Play,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bot,
  PhoneCall,
  ShieldCheck,
  Package,
  Clock,
  Sparkles,
} from 'lucide-react';
import { operationsService } from '../services/api';
import { Workflow } from '../types';

export const Workflows: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('wf-1');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationLogs, setSimulationLogs] = useState<string[]>([]);

  const defaultWorkflows: Workflow[] = [
    {
      id: 'wf-1',
      name: 'Automated Supplier Stock Replenishment',
      description: 'Triggered when product inventory falls below safety reorder threshold',
      trigger_type: 'inventory_low_stock',
      is_active: true,
      require_approval: true,
      execution_count: 14,
      last_triggered_at: '2 hours ago',
      created_at: new Date().toISOString(),
    },
    {
      id: 'wf-2',
      name: 'High-Value Customer Delivery Reschedule',
      description: 'Triggered when a delivery slot is missed or customer requests time change',
      trigger_type: 'order_reschedule_request',
      is_active: true,
      require_approval: false,
      execution_count: 29,
      last_triggered_at: '25m ago',
      created_at: new Date().toISOString(),
    },
    {
      id: 'wf-3',
      name: 'Overdue Receivable Polite Voice Follow-Up',
      description: 'Triggered when invoice exceeds due date by 3 days',
      trigger_type: 'invoice_overdue_3_days',
      is_active: true,
      require_approval: true,
      execution_count: 8,
      last_triggered_at: '1 day ago',
      created_at: new Date().toISOString(),
    },
  ];

  useEffect(() => {
    operationsService.listWorkflows().then((res) => {
      if (res && res.length > 0) setWorkflows(res);
      else setWorkflows(defaultWorkflows);
    }).catch(() => setWorkflows(defaultWorkflows));
  }, []);

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationLogs([]);

    const steps = [
      'Trigger event received: [Product SKU-104 Organic Green Tea] stock dropped to 8 units (Threshold: 15)',
      'Groq Brain NLU: Analyzed historical sales velocity and identified preferred supplier [Metro Supplies Pvt Ltd]',
      'Drafted Purchase Order #PO-2026-94 for 50 units (₹40,000)',
      'Owner Approval: Verified and granted via human-in-the-loop dashboard',
      'Bolna AI Voice Platform: Dispatched outbound voice call to Metro Supplies (+919876543220)',
      'Call Outcome: Supplier voice acknowledged stock availability; confirmed dispatch by Wednesday 11:00 AM',
      'ERP Updated: Purchase order marked Confirmed; inventory expected stock updated.',
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSimulationLogs((prev) => [...prev, step]);
        if (idx === steps.length - 1) setIsSimulating(false);
      }, (idx + 1) * 700);
    });
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Autonomous Workflow Builder</h1>
          <p className="page-desc">
            Orchestrate multi-step pipelines connecting business triggers, Groq NLU analysis, and Bolna voice actions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleSimulate} disabled={isSimulating}>
          <Play size={16} />
          <span>{isSimulating ? 'Simulating Pipeline...' : 'Test Run Active Workflow'}</span>
        </button>
      </div>

      {/* Visual Workflow Pipeline Graphic */}
      <div
        className="card"
        style={{
          marginBottom: '24px',
          background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.08) 0%, var(--bg-surface) 100%)',
        }}
      >
        <div className="card-header">
          <div>
            <div className="card-title">
              <GitBranch size={18} color="var(--primary)" />
              Active Pipeline: Automated Supplier Stock Replenishment
            </div>
            <div className="card-subtitle">End-to-end execution path</div>
          </div>
          <span className="status-pill success">
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            Active & Running
          </span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            overflowX: 'auto',
            padding: '16px 8px',
          }}
        >
          {/* Step 1 */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <Package size={16} /> 1. TRIGGER
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Low Stock Alert</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Stock &le; Reorder level</div>
          </div>

          <ArrowRight size={20} color="var(--primary)" style={{ flexShrink: 0 }} />

          {/* Step 2 */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <Sparkles size={16} /> 2. GROQ AI
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Compute Quantity</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Draft Purchase Order</div>
          </div>

          <ArrowRight size={20} color="var(--primary)" style={{ flexShrink: 0 }} />

          {/* Step 3 */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#06b6d4', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <ShieldCheck size={16} /> 3. APPROVAL
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Owner Sign-Off</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>1-Click Approval</div>
          </div>

          <ArrowRight size={20} color="var(--primary)" style={{ flexShrink: 0 }} />

          {/* Step 4 */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <PhoneCall size={16} /> 4. BOLNA VOICE
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Call Supplier</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Verify Quotation</div>
          </div>

          <ArrowRight size={20} color="var(--primary)" style={{ flexShrink: 0 }} />

          {/* Step 5 */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: 'var(--radius-lg)',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-medium)',
              minWidth: '170px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a855f7', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle2 size={16} /> 5. FINAL ACTION
            </div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>Update Database</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Notify Stakeholders</div>
          </div>
        </div>

        {/* Live Simulation Trace */}
        {simulationLogs.length > 0 && (
          <div
            style={{
              marginTop: '18px',
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(0,0,0,0.4)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', marginBottom: '8px' }}>
              Simulation Execution Trace:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {simulationLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: i === simulationLogs.length - 1 ? '#a5b4fc' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={13} color="#10b981" />
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Available Workflows List */}
      <h3 style={{ marginBottom: '16px' }}>Configured Business Workflows</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {workflows.map((wf) => (
          <div
            key={wf.id}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span className="status-pill success">
                  <CheckCircle2 size={12} /> Active
                </span>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  Executed {wf.execution_count} times
                </span>
              </div>
              <h4 style={{ fontSize: '14.5px', marginBottom: '6px' }}>{wf.name}</h4>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                {wf.description}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={12} /> Last run: {wf.last_triggered_at || 'Recently'}
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleSimulate}
              >
                <Play size={12} /> Run Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

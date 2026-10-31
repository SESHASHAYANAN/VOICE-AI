import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PhoneCall,
  CheckCircle2,
  Bot,
  ListTodo,
  AlertCircle,
  HeartHandshake,
  TrendingUp,
  Sparkles,
  PhoneForwarded,
  ArrowRight,
  Clock,
  Check,
  X as CloseIcon,
  ShieldAlert,
  ShoppingBag,
  Truck,
  CreditCard,
  Users,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const Overview: React.FC = () => {
  const navigate = useNavigate();
  const {
    organization,
    metrics,
    insights,
    recentCalls,
    agents,
    setIsCreateAgentOpen,
    setIsInitiateCallOpen,
    setSelectedCallId,
  } = useApp();

  const [pendingApprovals, setPendingApprovals] = useState([
    {
      id: 'app-1',
      title: 'Approve Supplier Purchase Order',
      desc: 'Reorder 60 units of Basmati Rice from Metro Supplies Pvt Ltd (₹48,000)',
      category: 'Procurement',
      impact: 'High Priority',
    },
    {
      id: 'app-2',
      title: 'Confirm Customer Delivery Reschedule',
      desc: 'Priya Sharma requested delivery window change to Thursday 2:30 PM',
      category: 'Orders',
      impact: 'Normal',
    },
    {
      id: 'app-3',
      title: 'Overdue Payment Follow-Up Dispatch',
      desc: 'Send voice payment reminder to Anita Patel for Invoice #INV-2024-88 (₹12,400)',
      category: 'Finance',
      impact: 'Medium',
    },
  ]);

  const handleApprove = (id: string) => {
    setPendingApprovals((prev) => prev.filter((item) => item.id !== id));
  };

  const callChartData = [
    { time: '09:00', calls: 3, resolved: 3 },
    { time: '11:00', calls: 8, resolved: 7 },
    { time: '13:00', calls: 14, resolved: 12 },
    { time: '15:00', calls: 19, resolved: 17 },
    { time: '17:00', calls: 24, resolved: 22 },
    { time: '19:00', calls: 16, resolved: 15 },
    { time: '21:00', calls: 6, resolved: 6 },
  ];

  return (
    <div className="content-container">
      {/* Greeting Banner */}
      <div className="page-header" style={{ marginBottom: '28px' }}>
        <div className="page-title-wrap">
          <h1 className="page-title">
            Good morning, {organization?.name || 'Apex Retail & Logistics'}
          </h1>
          <p className="page-desc">
            Here's what's happening across your autonomous AI voice workforce today.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => setIsInitiateCallOpen(true)}
          >
            <PhoneForwarded size={16} />
            <span>Dispatch Voice Call</span>
          </button>

          <button
            className="btn btn-primary"
            onClick={() => setIsCreateAgentOpen(true)}
          >
            <Sparkles size={16} />
            <span>+ Create AI Agent</span>
          </button>
        </div>
      </div>

      {/* 6 Core KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card" onClick={() => navigate('/calls')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Total AI Calls</span>
            <div className="kpi-icon-wrap" style={{ color: 'var(--primary)' }}>
              <PhoneCall size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.total_calls || 5}</div>
          <div className="kpi-footer">
            <span className="trend-badge up">
              <TrendingUp size={12} /> +18.4%
            </span>
            <span className="trend-caption">vs last week</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/calls')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Successful Outcomes</span>
            <div className="kpi-icon-wrap" style={{ color: '#10b981' }}>
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.successful_calls || 4}</div>
          <div className="kpi-footer">
            <span className="trend-badge up">
              <TrendingUp size={12} /> 92.5%
            </span>
            <span className="trend-caption">resolution rate</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/agents')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Active AI Agents</span>
            <div className="kpi-icon-wrap" style={{ color: '#8b5cf6' }}>
              <Bot size={18} />
            </div>
          </div>
          <div className="kpi-value">{metrics?.active_agents || agents.length || 1}</div>
          <div className="kpi-footer">
            <span className="trend-badge up">100% Online</span>
            <span className="trend-caption">Bolna Voice active</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Tasks Completed</span>
            <div className="kpi-icon-wrap" style={{ color: '#06b6d4' }}>
              <ListTodo size={18} />
            </div>
          </div>
          <div className="kpi-value">48</div>
          <div className="kpi-footer">
            <span className="trend-badge up">
              <TrendingUp size={12} /> +12 today
            </span>
            <span className="trend-caption">inventory & orders</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/orders')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Pending Approvals</span>
            <div className="kpi-icon-wrap" style={{ color: '#f59e0b' }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div className="kpi-value">{pendingApprovals.length}</div>
          <div className="kpi-footer">
            <span className="trend-badge down">Requires Review</span>
            <span className="trend-caption">actions pending</span>
          </div>
        </div>

        <div className="kpi-card" onClick={() => navigate('/customers')} style={{ cursor: 'pointer' }}>
          <div className="kpi-header">
            <span className="kpi-title">Customer CSAT</span>
            <div className="kpi-icon-wrap" style={{ color: '#ec4899' }}>
              <HeartHandshake size={18} />
            </div>
          </div>
          <div className="kpi-value">
            {metrics?.customer_satisfaction ? `${metrics.customer_satisfaction} / 5` : '4.6 / 5'}
          </div>
          <div className="kpi-footer">
            <span className="trend-badge up">
              <TrendingUp size={12} /> +0.3
            </span>
            <span className="trend-caption">high positive sentiment</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Call Analytics Chart & AI Workforce Status */}
      <div className="grid-2">
        {/* Call Analytics Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <PhoneCall size={18} color="var(--primary)" />
                AI Call Volume & Resolution
              </div>
              <div className="card-subtitle">Real-time daily telephony throughput</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/analytics')}>
              View Analytics <ArrowRight size={13} />
            </button>
          </div>

          <div style={{ height: '240px', width: '100%', marginTop: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={callChartData}>
                <defs>
                  <linearGradient id="callGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="resGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a22',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="calls" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#callGradient)" name="Total Calls" />
                <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#resGradient)" name="Resolved" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Workforce Activity */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Bot size={18} color="#8b5cf6" />
                Active AI Workforce
              </div>
              <div className="card-subtitle">Autonomous agents currently deployed</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/agents')}>
              Studio
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(agents && agents.length > 0 ? agents : [
              {
                id: 'ag-1',
                name: 'Apex Voice Operations Agent',
                agent_type: 'General Ops',
                language: 'en',
                is_active: true,
              },
            ]).map((agent) => (
              <div
                key={agent.id}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'rgba(99,102,241,0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Bot size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{agent.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Bolna Voice &bull; {agent.language?.toUpperCase() || 'EN'} &bull; Inbound & Outbound
                    </div>
                  </div>
                </div>

                <span className="status-pill success">
                  <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
                  Live
                </span>
              </div>
            ))}

            <div
              onClick={() => setIsCreateAgentOpen(true)}
              style={{
                padding: '12px',
                borderRadius: 'var(--radius-md)',
                border: '1px dashed var(--border-medium)',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: '12.5px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              + Deploy Specialized Voice Agent
            </div>
          </div>
        </div>
      </div>

      {/* Groq AI Intelligence Insights */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, var(--bg-surface) 100%)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">
              <Sparkles size={18} color="var(--primary)" />
              AI Intelligence & Operational Insights
            </div>
            <div className="card-subtitle">Automated recommendations computed by Groq</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {(insights && insights.length > 0 ? insights : [
            {
              title: 'Delivery Confirmation Dispatch',
              description: '2 customers have pending delivery confirmations for tomorrow. Scheduling automated follow-up calls is recommended.',
              category: 'customer' as const,
              priority: 'high' as const,
              suggested_action: 'Dispatch Voice Confirmations',
            },
            {
              title: 'Low Stock Threshold Warning',
              description: 'Organic Green Tea and Basmati Rice have fallen below safety reorder stock. Trigger supplier purchase order.',
              category: 'inventory' as const,
              priority: 'high' as const,
              suggested_action: 'Order from Metro Supplies',
            },
            {
              title: 'Overdue Invoice Follow-Up',
              description: '₹46,220 in pending receivables due this week. Automated voice reminders have historically recovered 88% within 24h.',
              category: 'financial' as const,
              priority: 'medium' as const,
              suggested_action: 'Send Voice Reminders',
            },
          ]).map((ins, i) => (
            <div
              key={i}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 700, fontSize: '13.5px' }}>{ins.title}</span>
                  <span className={`status-pill ${ins.priority === 'high' ? 'danger' : 'warning'}`}>
                    {ins.priority}
                  </span>
                </div>
                <p style={{ fontSize: '12px', lineHeight: 1.5, marginBottom: '12px' }}>
                  {ins.description}
                </p>
              </div>

              {ins.suggested_action && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setIsInitiateCallOpen(true)}
                  style={{ alignSelf: 'flex-start' }}
                >
                  <PhoneForwarded size={12} />
                  <span>{ins.suggested_action}</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Two Column Section: Pending Approvals & Chronological Activity Feed */}
      <div className="grid-equal-2">
        {/* Pending Actions Requiring Owner Approval */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <ShieldAlert size={18} color="#f59e0b" />
                Human-in-the-Loop Approvals
              </div>
              <div className="card-subtitle">Consequential operations held for owner sign-off</div>
            </div>
            <span className="status-pill warning">{pendingApprovals.length} Pending</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingApprovals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
                No pending approvals. All operations in sync!
              </div>
            ) : (
              pendingApprovals.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>{item.title}</span>
                      <span className="status-pill info" style={{ fontSize: '10px', padding: '1px 6px' }}>
                        {item.category}
                      </span>
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {item.desc}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleApprove(item.id)}
                      title="Reject"
                    >
                      <CloseIcon size={14} color="#f87171" />
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleApprove(item.id)}
                      style={{ background: '#10b981' }}
                    >
                      <Check size={14} /> Approve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Call & Business Activity Feed */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                <Clock size={18} color="#06b6d4" />
                Live Chronological Feed
              </div>
              <div className="card-subtitle">Real-time calls, orders, and agent events</div>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate('/calls')}>
              All Calls
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {(recentCalls && recentCalls.length > 0 ? recentCalls.slice(0, 4) : [
              {
                id: 'call-1',
                customer_name: 'Priya Sharma',
                purpose: 'Confirmed delivery address & rescheduled slot to 2:30 PM',
                status: 'completed' as const,
                sentiment: 'positive' as const,
                created_at: '10m ago',
              },
              {
                id: 'call-2',
                customer_name: 'Metro Supplies Pvt Ltd',
                purpose: 'Inquired stock availability for Organic Green Tea',
                status: 'completed' as const,
                sentiment: 'positive' as const,
                created_at: '25m ago',
              },
              {
                id: 'call-3',
                customer_name: 'Anita Patel',
                purpose: 'Payment reminder for invoice #INV-2024-88',
                status: 'completed' as const,
                sentiment: 'neutral' as const,
                created_at: '1h ago',
              },
            ]).map((call) => (
              <div
                key={call.id}
                onClick={() => setSelectedCallId(call.id)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'rgba(16,185,129,0.15)',
                      color: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhoneCall size={14} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>
                      {call.customer_name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      {call.purpose || 'Call completed successfully'}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span className="status-pill success" style={{ fontSize: '10px', padding: '1px 6px' }}>
                    {call.sentiment || 'Positive'}
                  </span>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {call.created_at ? new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

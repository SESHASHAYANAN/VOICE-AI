import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Smile,
  Clock,
  CheckCircle2,
  PhoneCall,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export const Analytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');

  const dailyCallsData = [
    { day: 'Mon', calls: 32, resolved: 30, missed: 2 },
    { day: 'Tue', calls: 45, resolved: 42, missed: 3 },
    { day: 'Wed', calls: 58, resolved: 54, missed: 4 },
    { day: 'Thu', calls: 52, resolved: 49, missed: 3 },
    { day: 'Fri', calls: 64, resolved: 60, missed: 4 },
    { day: 'Sat', calls: 38, resolved: 36, missed: 2 },
    { day: 'Sun', calls: 20, resolved: 19, missed: 1 },
  ];

  const sentimentData = [
    { name: 'Positive', value: 72, color: '#10b981' },
    { name: 'Neutral', value: 22, color: '#f59e0b' },
    { name: 'Negative', value: 6, color: '#ef4444' },
  ];

  const revenueData = [
    { date: 'Oct 24', revenue: 14200 },
    { date: 'Oct 25', revenue: 18500 },
    { date: 'Oct 26', revenue: 22400 },
    { date: 'Oct 27', revenue: 19800 },
    { date: 'Oct 28', revenue: 31200 },
    { date: 'Oct 29', revenue: 28400 },
    { date: 'Oct 30', revenue: 35900 },
  ];

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8,Day,Total Calls,Resolved,Missed\n"
      + dailyCallsData.map(e => `${e.day},${e.calls},${e.resolved},${e.missed}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voiceos_analytics_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Analytics & Intelligence Reports</h1>
          <p className="page-desc">
            Deep-dive operational metrics across your voice telephony throughput, customer sentiment, and revenue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ display: 'flex', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '2px' }}>
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  background: timeRange === r ? 'var(--primary)' : 'transparent',
                  color: timeRange === r ? '#fff' : 'var(--text-secondary)',
                }}
              >
                {r.toUpperCase()}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary" onClick={handleExport}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* Highlights */}
      <div className="kpi-grid" style={{ marginBottom: '24px' }}>
        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Weekly Voice Volume</span>
            <PhoneCall size={18} color="var(--primary)" />
          </div>
          <div className="kpi-value">309</div>
          <div className="kpi-footer">
            <span className="trend-badge up">+24% volume</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">First-Call Resolution</span>
            <CheckCircle2 size={18} color="#10b981" />
          </div>
          <div className="kpi-value">93.8%</div>
          <div className="kpi-footer">
            <span className="trend-badge up">+2.1% improvement</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Avg Call Duration</span>
            <Clock size={18} color="#06b6d4" />
          </div>
          <div className="kpi-value">1m 42s</div>
          <div className="kpi-footer">
            <span className="trend-badge up">High efficiency</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">Positive Sentiment</span>
            <Smile size={18} color="#f59e0b" />
          </div>
          <div className="kpi-value">72%</div>
          <div className="kpi-footer">
            <span className="trend-badge up">High customer delight</span>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid-2">
        {/* Daily Throughput Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Daily Call Volumes & Resolutions</div>
              <div className="card-subtitle">Throughput handled autonomously by Bolna voice agents</div>
            </div>
          </div>
          <div style={{ height: '260px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyCallsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a22',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="calls" fill="#6366f1" radius={[4, 4, 0, 0]} name="Total Calls" />
                <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentiment Breakdown */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Customer Sentiment Breakdown</div>
              <div className="card-subtitle">Voice tone & response satisfaction</div>
            </div>
          </div>
          <div style={{ height: '200px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161a22',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '10px' }}>
            {sentimentData.map((s) => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: s.color }} />
                <span>{s.name} ({s.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Recovered & Processed Chart */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Business Revenue Facilitated by AI Operations</div>
            <div className="card-subtitle">Orders confirmed & receivables collected via voice interactions</div>
          </div>
        </div>
        <div style={{ height: '220px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#161a22',
                  borderColor: 'rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="revenue" stroke="#34d399" strokeWidth={3} dot={{ r: 4 }} name="Revenue (₹)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

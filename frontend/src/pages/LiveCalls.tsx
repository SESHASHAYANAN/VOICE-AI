import React, { useState, useEffect } from 'react';
import {
  PhoneCall,
  PhoneForwarded,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  User,
  Bot,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Call } from '../types';

export const LiveCalls: React.FC = () => {
  const { setSelectedCallId, setIsInitiateCallOpen } = useApp();
  const [calls, setCalls] = useState<Call[]>([]);
  const [search, setSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState<'all' | 'inbound' | 'outbound'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadCalls = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listCalls();
      setCalls(data);
    } catch (e) {
      console.error('Error fetching calls:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCalls();
    const interval = setInterval(loadCalls, 10000); // Polling every 10s for live calls
    return () => clearInterval(interval);
  }, []);

  const filtered = calls.filter((c) => {
    const matchesSearch =
      !search ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone_number?.includes(search) ||
      c.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchesDirection = filterDirection === 'all' || c.direction === filterDirection;
    return matchesSearch && matchesDirection;
  });

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Live Call Center & Telephony</h1>
          <p className="page-desc">
            Monitor active voice conversations, transcript histories, and sentiment analysis.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadCalls} title="Refresh calls">
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn btn-primary" onClick={() => setIsInitiateCallOpen(true)}>
            <PhoneForwarded size={16} /> Dispatch Call
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="form-control search-input-inside"
            placeholder="Search by customer, phone, purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${filterDirection === 'all' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterDirection('all')}
          >
            All Calls ({calls.length})
          </button>
          <button
            className={`btn btn-sm ${filterDirection === 'inbound' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterDirection('inbound')}
          >
            <ArrowDownLeft size={13} /> Inbound
          </button>
          <button
            className={`btn btn-sm ${filterDirection === 'outbound' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterDirection('outbound')}
          >
            <ArrowUpRight size={13} /> Outbound
          </button>
        </div>
      </div>

      {/* Calls Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Direction</th>
              <th>Customer / Phone</th>
              <th>Agent</th>
              <th>Purpose & Details</th>
              <th>Duration</th>
              <th>Sentiment</th>
              <th>Status</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No calls found matching the criteria.
                </td>
              </tr>
            ) : (
              filtered.map((call) => (
                <tr
                  key={call.id}
                  onClick={() => setSelectedCallId(call.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {call.direction === 'inbound' ? (
                        <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <ArrowDownLeft size={14} /> Inbound
                        </span>
                      ) : (
                        <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600 }}>
                          <ArrowUpRight size={14} /> Outbound
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                      {call.customer_name || 'Customer'}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {call.phone_number || '+91 98765 43210'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Bot size={14} color="var(--primary)" />
                      <span>{call.agent_name || 'Apex Voice Agent'}</span>
                    </div>
                  </td>
                  <td style={{ maxWidth: '280px' }}>
                    <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {call.purpose || 'Business inquiry & confirmation'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      {call.duration_seconds
                        ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, '0')}`
                        : '1:45'}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        call.sentiment === 'positive'
                          ? 'success'
                          : call.sentiment === 'negative'
                          ? 'danger'
                          : 'warning'
                      }`}
                    >
                      {call.sentiment || 'Positive'}
                    </span>
                  </td>
                  <td>
                    <span className="status-pill success">{call.status || 'Completed'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      {call.created_at ? new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

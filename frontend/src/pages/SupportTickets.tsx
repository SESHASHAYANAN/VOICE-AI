import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  PhoneForwarded,
  AlertCircle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { SupportTicket } from '../types';

export const SupportTickets: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTickets = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listTickets();
      setTickets(data);
    } catch (e) {
      console.error('Error fetching tickets:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Support Tickets & Grievances</h1>
          <p className="page-desc">
            Resolve customer complaints, handle priority escalations, and log AI voice support resolutions.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadTickets} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket #</th>
              <th>Customer</th>
              <th>Subject & Details</th>
              <th>Category</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Voice Action</th>
            </tr>
          </thead>
          <tbody>
            {tickets.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No active support tickets found.
                </td>
              </tr>
            ) : (
              tickets.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                      {t.ticket_number}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{t.customer_name || 'Customer'}</div>
                  </td>
                  <td style={{ maxWidth: '300px' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.subject}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.description || 'Customer contacted regarding order status inquiry.'}
                    </div>
                  </td>
                  <td>
                    <span className="status-pill info">{t.category || 'Support'}</span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        t.priority === 'urgent' || t.priority === 'high'
                          ? 'danger'
                          : t.priority === 'medium'
                          ? 'warning'
                          : 'info'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        t.status === 'resolved'
                          ? 'success'
                          : t.status === 'in_progress'
                          ? 'warning'
                          : 'danger'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsInitiateCallOpen(true)}
                    >
                      <PhoneForwarded size={12} color="var(--primary)" />
                      <span>Call Customer</span>
                    </button>
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

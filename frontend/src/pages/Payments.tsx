import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  PhoneForwarded,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Payment } from '../types';

export const Payments: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listPayments();
      setPayments(data);
    } catch (e) {
      console.error('Error fetching payments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Payments & Receivables</h1>
          <p className="page-desc">
            Track invoice statuses, overdue receivables, and deploy polite autonomous voice payment collection calls.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadPayments} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Payment Status</th>
              <th>Reminders Sent</th>
              <th>AI Voice Follow-Up</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No payment records found.
                </td>
              </tr>
            ) : (
              payments.map((p) => {
                const isOverdue = p.status === 'overdue';
                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                        {p.invoice_number || `INV-${p.id.slice(0, 6).toUpperCase()}`}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {p.payment_method || 'UPI / Bank Transfer'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{p.customer_name || 'Customer'}</div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '14px', color: isOverdue ? '#f87171' : '#34d399' }}>
                        ₹{p.amount?.toLocaleString('en-IN') || '0'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: isOverdue ? '#f87171' : 'var(--text-secondary)' }}>
                        {p.due_date ? new Date(p.due_date).toLocaleDateString() : 'Due today'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          p.status === 'completed'
                            ? 'success'
                            : isOverdue
                            ? 'danger'
                            : 'warning'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {p.reminder_count || 1} calls
                      </span>
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${isOverdue ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setIsInitiateCallOpen(true)}
                        style={isOverdue ? { background: '#f59e0b' } : {}}
                      >
                        <PhoneForwarded size={12} />
                        <span>Send Voice Reminder</span>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

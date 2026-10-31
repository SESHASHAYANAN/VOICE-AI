import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  PhoneForwarded,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Appointment } from '../types';

export const Bookings: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listAppointments();
      setAppointments(data);
    } catch (e) {
      console.error('Error fetching appointments:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Bookings & Appointments</h1>
          <p className="page-desc">
            Manage consultations, service visits, and automated AI voice confirmation calls.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadAppointments} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Title & Type</th>
              <th>Customer</th>
              <th>Scheduled Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Voice Reminder</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No scheduled bookings found.
                </td>
              </tr>
            ) : (
              appointments.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="var(--primary)" />
                      {app.title}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {app.appointment_type || 'Consultation'}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{app.customer_name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {app.customer_phone || '+91 98765 43210'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      {new Date(app.scheduled_at).toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                      {new Date(app.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                      {app.duration_minutes || 30} mins
                    </span>
                  </td>
                  <td>
                    <span className="status-pill success">{app.status}</span>
                  </td>
                  <td>
                    <span className="status-pill info">
                      <CheckCircle2 size={12} /> Dispatched
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsInitiateCallOpen(true)}
                    >
                      <PhoneForwarded size={12} color="var(--primary)" />
                      <span>Call to Confirm</span>
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

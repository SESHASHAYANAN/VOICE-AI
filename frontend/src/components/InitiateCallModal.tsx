import React, { useState } from 'react';
import {
  X,
  PhoneCall,
  Loader2,
  CheckCircle2,
  User,
  Phone,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';

export const InitiateCallModal: React.FC = () => {
  const { isInitiateCallOpen, setIsInitiateCallOpen, agents, refreshAll } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('+919876543210');
  const [customerName, setCustomerName] = useState('Priya Sharma');
  const [agentId, setAgentId] = useState(agents[0]?.id || '');
  const [purpose, setPurpose] = useState('Delivery confirmation and reschedule inquiry');
  const [isCalling, setIsCalling] = useState(false);
  const [callResult, setCallResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    try {
      setIsCalling(true);
      setError(null);
      setCallResult(null);

      const res = await operationsService.initiateCall({
        phone_number: phoneNumber,
        agent_id: agentId || undefined,
        purpose,
        context: {
          customer_name: customerName,
          priority: 'high',
        },
      });

      setCallResult(res);
      await refreshAll();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err.message || 'Call failed to initiate');
    } finally {
      setIsCalling(false);
    }
  };

  if (!isInitiateCallOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsInitiateCallOpen(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PhoneCall size={18} />
            </div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700 }}>Dispatch Voice Call</div>
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                Bolna Telephony Network &bull; Live Real-Time Outbound
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsInitiateCallOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCall}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">
                <span>Select Voice Agent</span>
              </label>
              <select
                className="form-control"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
              >
                {agents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.language.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Recipient Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (E.164)</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="form-control"
                    style={{ paddingLeft: '36px' }}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+919876543210"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Call Purpose & Talking Points</label>
              <div style={{ position: 'relative' }}>
                <FileText size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
                <textarea
                  className="form-control"
                  style={{ paddingLeft: '36px', minHeight: '80px' }}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. Inquire about payment for invoice #INV-2024 or confirm rescheduled delivery..."
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '6px',
                  background: 'var(--danger-bg)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                  fontSize: '12.5px',
                  marginBottom: '12px',
                }}
              >
                {error}
              </div>
            )}

            {callResult && (
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '13px',
                }}
              >
                <CheckCircle2 size={18} />
                <div>
                  <div style={{ fontWeight: 700 }}>Call Dispatched Successfully!</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                    Call ID: {callResult.call_id || callResult.execution_id || 'CALL-ACTIVE'}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setIsInitiateCallOpen(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCalling || !phoneNumber.trim()}
              style={{ background: '#10b981' }}
            >
              {isCalling ? <Loader2 size={16} className="spin" /> : <PhoneCall size={16} />}
              Initiate Call Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Building,
  Clock,
  Shield,
  Users,
  Key,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Settings: React.FC = () => {
  const { organization, user } = useApp();
  const [saved, setSaved] = useState(false);

  const [formData, setFormData] = useState({
    orgName: organization?.name || 'Apex Retail & Logistics',
    businessType: organization?.business_type || 'Omnichannel D2C & Logistics',
    phone: organization?.phone || '+91 98765 43200',
    address: organization?.address || 'BKC Complex, Bandra East, Mumbai, Maharashtra, India',
    startHour: '09:00',
    endHour: '19:00',
    silenceTimeout: 10,
    maxDuration: 600,
    escalationEmail: user?.email || 'rajesh@apexlogistics.in',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Workforce & Organization Settings</h1>
          <p className="page-desc">
            Configure business identity, operating hours, team permissions, and call guardrails.
          </p>
        </div>

        {saved && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>
            <CheckCircle2 size={16} /> Changes saved successfully!
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Organization Details */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Building size={18} color="var(--primary)" />
                Organization Profile
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Business / Organization Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.orgName}
                onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Industry & Segment</label>
              <input
                type="text"
                className="form-control"
                value={formData.businessType}
                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Business Phone</label>
              <input
                type="text"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Headquarters Address</label>
              <textarea
                className="form-control"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
          </div>

          {/* Voice Calling Guardrails */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Clock size={18} color="#06b6d4" />
                Telephony & Calling Guardrails
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Earliest Outbound Call</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.startHour}
                  onChange={(e) => setFormData({ ...formData, startHour: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Latest Outbound Call</label>
                <input
                  type="time"
                  className="form-control"
                  value={formData.endHour}
                  onChange={(e) => setFormData({ ...formData, endHour: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Max Call Duration (Seconds)</label>
              <input
                type="number"
                className="form-control"
                value={formData.maxDuration}
                onChange={(e) => setFormData({ ...formData, maxDuration: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Hangup After Silence (Seconds)</label>
              <input
                type="number"
                className="form-control"
                value={formData.silenceTimeout}
                onChange={(e) => setFormData({ ...formData, silenceTimeout: Number(e.target.value) })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Escalation Notification Email</label>
              <input
                type="email"
                className="form-control"
                value={formData.escalationEmail}
                onChange={(e) => setFormData({ ...formData, escalationEmail: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="submit" className="btn btn-primary btn-lg">
            <Save size={16} /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
};

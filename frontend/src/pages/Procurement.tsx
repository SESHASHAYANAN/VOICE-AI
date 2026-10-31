import React, { useState, useEffect } from 'react';
import {
  Truck,
  PhoneForwarded,
  Search,
  Star,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Building,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Supplier } from '../types';

export const Procurement: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuppliers = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listSuppliers();
      setSuppliers(data);
    } catch (e) {
      console.error('Error fetching suppliers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Procurement & Supplier Network</h1>
          <p className="page-desc">
            Automate reorder inquiries, quotation confirmations, and stock availability calls with suppliers.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadSuppliers} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>City</th>
              <th>Category</th>
              <th>Rating</th>
              <th>Payment Terms</th>
              <th>AI Reorder Action</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No supplier records found.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Building size={14} color="var(--primary)" />
                      {s.name}
                    </div>
                    {s.is_preferred && (
                      <span className="status-pill success" style={{ fontSize: '10px', marginTop: '4px' }}>
                        Preferred Supplier
                      </span>
                    )}
                  </td>
                  <td>{s.contact_person || 'N/A'}</td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px' }}>
                      {s.phone || '+91 98765 43220'}
                    </span>
                  </td>
                  <td>{s.city || 'Mumbai'}</td>
                  <td>
                    <span className="status-pill info">{s.category || 'General'}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 600 }}>
                      <Star size={13} fill="#fbbf24" />
                      {s.rating || 4.5}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {s.payment_terms || 'Net 30'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsInitiateCallOpen(true)}
                    >
                      <PhoneForwarded size={12} color="#10b981" />
                      <span>Order Stock via AI</span>
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

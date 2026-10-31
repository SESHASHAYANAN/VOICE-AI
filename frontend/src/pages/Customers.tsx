import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  PhoneForwarded,
  Plus,
  Mail,
  MapPin,
  IndianRupee,
  Star,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Customer } from '../types';

export const Customers: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadCustomers = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listCustomers(search);
      setCustomers(data);
    } catch (e) {
      console.error('Error fetching customers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const filtered = customers.filter(
    (c) => filterType === 'all' || c.customer_type?.toLowerCase() === filterType.toLowerCase()
  );

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Customers Directory</h1>
          <p className="page-desc">
            Manage customer contacts, purchase analytics, and trigger automated voice interactions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadCustomers} title="Refresh">
            <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
          </button>
          <button className="btn btn-primary" onClick={() => setIsInitiateCallOpen(true)}>
            <PhoneForwarded size={16} /> Call Customer
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="form-control search-input-inside"
            placeholder="Search customers by name, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'premium', 'regular', 'wholesale'].map((t) => (
            <button
              key={t}
              className={`btn btn-sm ${filterType === t ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterType(t)}
              style={{ textTransform: 'capitalize' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Contact Details</th>
              <th>Location</th>
              <th>Segment</th>
              <th>Orders</th>
              <th>Total Spent</th>
              <th>CSAT</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No customer records found.
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ID: {c.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px' }}>
                      {c.phone || '+91 98765 43210'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <Mail size={11} /> {c.email || 'customer@example.com'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={12} color="var(--text-muted)" />
                      <span>{c.city || 'Mumbai'}, {c.state || 'Maharashtra'}</span>
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        c.customer_type === 'premium'
                          ? 'success'
                          : c.customer_type === 'wholesale'
                          ? 'info'
                          : 'warning'
                      }`}
                    >
                      {c.customer_type || 'Regular'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{c.total_orders || 0}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      ₹{c.total_spent?.toLocaleString('en-IN') || '0'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 600 }}>
                      <Star size={13} fill="#fbbf24" />
                      {c.satisfaction_score || 4.5}
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsInitiateCallOpen(true)}
                      title="Dispatch voice call"
                    >
                      <PhoneForwarded size={13} color="var(--primary)" /> Call
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

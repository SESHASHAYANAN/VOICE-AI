import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  PhoneForwarded,
  CheckCircle2,
  Clock,
  Truck,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Order } from '../types';

export const Orders: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listOrders(filterStatus === 'all' ? undefined : filterStatus);
      setOrders(data);
    } catch (e) {
      console.error('Error fetching orders:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus]);

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.order_number?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Orders & Fulfillment</h1>
          <p className="page-desc">
            Track order delivery schedules, automate address confirmations, and resolve rescheduling via voice AI.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadOrders} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="form-control search-input-inside"
            placeholder="Search orders by #ORD or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'pending', 'confirmed', 'processing', 'shipped', 'delivered'].map((st) => (
            <button
              key={st}
              className={`btn btn-sm ${filterStatus === st ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setFilterStatus(st)}
              style={{ textTransform: 'capitalize' }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Total Amount</th>
              <th>Delivery Schedule</th>
              <th>Confirmation Status</th>
              <th>Fulfillment Status</th>
              <th>AI Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No orders found for this criteria.
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-main)' }}>
                      {order.order_number}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(order.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{order.customer_name || 'Customer'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {order.delivery_address || 'Mumbai, Maharashtra'}
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#34d399' }}>
                      ₹{order.total_amount?.toLocaleString('en-IN') || '0'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12.5px' }}>
                      <Clock size={13} color="var(--text-muted)" />
                      <span>
                        {order.delivery_date
                          ? new Date(order.delivery_date).toLocaleDateString([], { month: 'short', day: 'numeric' })
                          : 'Tomorrow'}
                        {order.delivery_time_slot && ` (${order.delivery_time_slot})`}
                      </span>
                    </div>
                    {order.delivery_rescheduled && (
                      <span className="status-pill warning" style={{ fontSize: '10px', marginTop: '4px' }}>
                        Rescheduled by AI
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="status-pill success">
                      <CheckCircle2 size={12} />
                      Voice Confirmed
                    </span>
                  </td>
                  <td>
                    <span
                      className={`status-pill ${
                        order.status === 'delivered'
                          ? 'success'
                          : order.status === 'shipped'
                          ? 'info'
                          : 'warning'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setIsInitiateCallOpen(true)}
                      title="Dispatch voice confirmation call"
                    >
                      <PhoneForwarded size={12} color="var(--primary)" />
                      <span>Confirm Delivery</span>
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

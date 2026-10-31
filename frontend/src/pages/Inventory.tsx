import React, { useState, useEffect } from 'react';
import {
  Package,
  AlertTriangle,
  PhoneForwarded,
  Search,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { operationsService } from '../services/api';
import { Product } from '../types';

export const Inventory: React.FC = () => {
  const { setIsInitiateCallOpen } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await operationsService.listProducts(lowStockOnly);
      setProducts(data);
    } catch (e) {
      console.error('Error fetching products:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [lowStockOnly]);

  const filtered = products.filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-container">
      <div className="page-header">
        <div className="page-title-wrap">
          <h1 className="page-title">Inventory & Stock Automation</h1>
          <p className="page-desc">
            Monitor real-time warehouse stock, track reorder levels, and trigger autonomous AI voice procurement.
          </p>
        </div>

        <button className="btn btn-secondary" onClick={loadProducts} title="Refresh">
          <RefreshCw size={15} className={isLoading ? 'spin' : ''} />
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrap">
          <Search className="search-icon-inside" />
          <input
            type="text"
            className="form-control search-input-inside"
            placeholder="Search products by SKU or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn btn-sm ${!lowStockOnly ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setLowStockOnly(false)}
          >
            All Products ({products.length})
          </button>
          <button
            className={`btn btn-sm ${lowStockOnly ? 'btn-danger' : 'btn-secondary'}`}
            onClick={() => setLowStockOnly(true)}
          >
            <AlertTriangle size={13} />
            <span>Low Stock Warnings</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Unit Price</th>
              <th>Current Stock</th>
              <th>Reorder Threshold</th>
              <th>Status</th>
              <th>AI Reorder Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '36px', color: 'var(--text-muted)' }}>
                  No inventory items found.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isLow = item.stock_quantity <= item.reorder_level;
                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Package size={14} color="var(--primary)" />
                        {item.name}
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                        SKU: {item.sku}
                      </div>
                    </td>
                    <td>
                      <span className="status-pill info">{item.category || 'General'}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                        ₹{item.price?.toLocaleString('en-IN') || '0'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          fontSize: '14px',
                          color: isLow ? '#f87171' : '#34d399',
                        }}
                      >
                        {item.stock_quantity} {item.unit || 'units'}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                        Min {item.reorder_level} {item.unit || 'units'}
                      </span>
                    </td>
                    <td>
                      {isLow ? (
                        <span className="status-pill danger">
                          <AlertTriangle size={12} /> Low Stock
                        </span>
                      ) : (
                        <span className="status-pill success">
                          <CheckCircle2 size={12} /> Healthy
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${isLow ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setIsInitiateCallOpen(true)}
                        style={isLow ? { background: '#f59e0b' } : {}}
                      >
                        <PhoneForwarded size={12} />
                        <span>Reorder via Voice</span>
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

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  PhoneCall,
  Users,
  ShoppingBag,
  Truck,
  Package,
  Calendar,
  CreditCard,
  LifeBuoy,
  GitBranch,
  BarChart3,
  Plug,
  Settings,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, setSidebarCollapsed, bolnaBalance, metrics } = useApp();

  const navItems = [
    { to: '/', label: 'Overview', icon: LayoutDashboard },
    { to: '/agents', label: 'AI Agents', icon: Bot, count: metrics?.active_agents },
    { to: '/calls', label: 'Live Calls', icon: PhoneCall, count: metrics?.calls_today },
    { to: '/customers', label: 'Customers', icon: Users },
    { to: '/orders', label: 'Orders', icon: ShoppingBag, count: metrics?.pending_orders, urgent: (metrics?.pending_orders || 0) > 0 },
    { to: '/procurement', label: 'Procurement', icon: Truck },
    { to: '/inventory', label: 'Inventory', icon: Package, count: metrics?.low_stock_products, urgent: (metrics?.low_stock_products || 0) > 0 },
    { to: '/bookings', label: 'Bookings', icon: Calendar, count: metrics?.upcoming_appointments },
    { to: '/payments', label: 'Payments', icon: CreditCard },
    { to: '/tickets', label: 'Support Tickets', icon: LifeBuoy, count: metrics?.open_tickets },
    { to: '/workflows', label: 'Workflows', icon: GitBranch },
    { to: '/analytics', label: 'Analytics', icon: BarChart3 },
    { to: '/integrations', label: 'Integrations', icon: Plug },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="brand-container">
          <div className="brand-logo-icon">
            <Sparkles size={20} />
          </div>
          {!sidebarCollapsed && (
            <div className="brand-title">
              VoiceOS
              <span className="brand-badge">Enterprise</span>
            </div>
          )}
        </div>
        <button
          className="btn-icon"
          onClick={() => setSidebarCollapsed((prev) => !prev)}
          title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {!sidebarCollapsed && <div className="nav-section-title">Core Operations</div>}
        {navItems.slice(0, 3).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="nav-icon" />
            {!sidebarCollapsed && <span>{item.label}</span>}
            {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
              <span className={`nav-badge ${item.urgent ? 'urgent' : ''}`}>{item.count}</span>
            )}
          </NavLink>
        ))}

        {!sidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '8px' }}>Business Management</div>}
        {navItems.slice(3, 10).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="nav-icon" />
            {!sidebarCollapsed && <span>{item.label}</span>}
            {!sidebarCollapsed && item.count !== undefined && item.count > 0 && (
              <span className={`nav-badge ${item.urgent ? 'urgent' : ''}`}>{item.count}</span>
            )}
          </NavLink>
        ))}

        {!sidebarCollapsed && <div className="nav-section-title" style={{ marginTop: '8px' }}>System</div>}
        {navItems.slice(10).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            title={sidebarCollapsed ? item.label : undefined}
          >
            <item.icon className="nav-icon" />
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!sidebarCollapsed ? (
          <div className="wallet-badge-card">
            <span className="wallet-badge-label">
              <Wallet size={14} /> Bolna Wallet
            </span>
            <span className="wallet-badge-val">${bolnaBalance.toFixed(2)}</span>
          </div>
        ) : (
          <button className="btn-icon" title={`Bolna Wallet: $${bolnaBalance.toFixed(2)}`}>
            <Wallet size={16} color="#10b981" />
          </button>
        )}
      </div>
    </aside>
  );
};

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { AICommandBar } from './components/AICommandBar';
import { CreateAgentModal } from './components/CreateAgentModal';
import { InitiateCallModal } from './components/InitiateCallModal';
import { CallDetailModal } from './components/CallDetailModal';

// Pages
import { Overview } from './pages/Overview';
import { Agents } from './pages/Agents';
import { LiveCalls } from './pages/LiveCalls';
import { Customers } from './pages/Customers';
import { Orders } from './pages/Orders';
import { Procurement } from './pages/Procurement';
import { Inventory } from './pages/Inventory';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { SupportTickets } from './pages/SupportTickets';
import { Workflows } from './pages/Workflows';
import { Analytics } from './pages/Analytics';
import { Integrations } from './pages/Integrations';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="app-layout">
          <Sidebar />

          <div className="main-wrapper">
            <TopNav />

            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Overview />} />
                <Route path="/agents" element={<Agents />} />
                <Route path="/calls" element={<LiveCalls />} />
                <Route path="/customers" element={<Customers />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/procurement" element={<Procurement />} />
                <Route path="/inventory" element={<Inventory />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/payments" element={<Payments />} />
                <Route path="/tickets" element={<SupportTickets />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>

          {/* Global Interactive Modals */}
          <AICommandBar />
          <CreateAgentModal />
          <InitiateCallModal />
          <CallDetailModal />
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;

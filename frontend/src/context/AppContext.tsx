import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Organization, Agent, DashboardMetrics, BusinessInsight, Call } from '../types';
import { authService, dashboardService, agentService } from '../services/api';

interface AppContextType {
  user: User | null;
  organization: Organization | null;
  agents: Agent[];
  metrics: DashboardMetrics | null;
  insights: BusinessInsight[];
  recentCalls: Call[];
  isLoading: boolean;
  bolnaBalance: number;
  bolnaAccount: string;
  isCreateAgentOpen: boolean;
  setIsCreateAgentOpen: (open: boolean) => void;
  isInitiateCallOpen: boolean;
  setIsInitiateCallOpen: (open: boolean) => void;
  isAICommandOpen: boolean;
  setIsAICommandOpen: (open: boolean) => void;
  selectedCallId: string | null;
  setSelectedCallId: (id: string | null) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  refreshAll: () => Promise<void>;
  notifications: Array<{ id: string; title: string; time: string; type: 'info' | 'success' | 'warning' }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [insights, setInsights] = useState<BusinessInsight[]>([]);
  const [recentCalls, setRecentCalls] = useState<Call[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Modals
  const [isCreateAgentOpen, setIsCreateAgentOpen] = useState<boolean>(false);
  const [isInitiateCallOpen, setIsInitiateCallOpen] = useState<boolean>(false);
  const [isAICommandOpen, setIsAICommandOpen] = useState<boolean>(false);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  // Bolna live stats
  const [bolnaBalance] = useState<number>(230.65);
  const [bolnaAccount] = useState<string>('msseshashayanan2005@gmail.com');

  const notifications = [
    { id: '1', title: 'Bolna Voice engine connected (Wallet: $230.65)', time: 'Just now', type: 'success' as const },
    { id: '2', title: 'Groq LLM brain active (openai/gpt-oss-120b)', time: '2m ago', type: 'info' as const },
    { id: '3', title: '2 customer delivery confirmations pending', time: '10m ago', type: 'warning' as const },
  ];

  const refreshAll = async () => {
    try {
      setIsLoading(true);
      // Auto login if no access token
      let token = localStorage.getItem('access_token');
      if (!token) {
        const loginData = await authService.demoLogin();
        token = loginData.access_token;
      }

      // Fetch user and org
      try {
        const [me, org] = await Promise.all([
          authService.getMe(),
          authService.getOrganization(),
        ]);
        setUser(me);
        setOrganization(org);
      } catch (err) {
        // Fallback demo user
        const loginData = await authService.demoLogin();
        setUser(loginData.user);
        setOrganization({
          id: 'org-demo',
          name: 'Apex Retail & Logistics',
          slug: 'apex-retail',
          industry: 'Omnichannel D2C',
          business_type: 'retail',
          is_active: true,
          created_at: new Date().toISOString(),
        });
      }

      // Fetch metrics, insights, agents, recent calls in parallel
      const [m, ins, agList, calls] = await Promise.allSettled([
        dashboardService.getMetrics(),
        dashboardService.getInsights(),
        agentService.listAgents(),
        dashboardService.getRecentCalls(10),
      ]);

      if (m.status === 'fulfilled') setMetrics(m.value);
      if (ins.status === 'fulfilled') setInsights(ins.value);
      if (agList.status === 'fulfilled') setAgents(agList.value);
      if (calls.status === 'fulfilled') setRecentCalls(calls.value);
    } catch (e) {
      console.error('Error refreshing app state:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  return (
    <AppContext.Provider
      value={{
        user,
        organization,
        agents,
        metrics,
        insights,
        recentCalls,
        isLoading,
        bolnaBalance,
        bolnaAccount,
        isCreateAgentOpen,
        setIsCreateAgentOpen,
        isInitiateCallOpen,
        setIsInitiateCallOpen,
        isAICommandOpen,
        setIsAICommandOpen,
        selectedCallId,
        setSelectedCallId,
        sidebarCollapsed,
        setSidebarCollapsed,
        refreshAll,
        notifications,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

import axios from 'axios';
import {
  User, Organization, Agent, Call, Customer, Order, Supplier, Product,
  Payment, Appointment, SupportTicket, Workflow, DashboardMetrics, BusinessInsight, AICommandResponse
} from '../types';

const API_BASE = '/api';

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-fallback / retry on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/')) {
      originalRequest._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/demo-login`, {});
        localStorage.setItem('access_token', data.access_token);
        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (e) {
        localStorage.removeItem('access_token');
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async demoLogin() {
    const res = await axios.post(`${API_BASE}/auth/demo-login`, {});
    if (res.data.access_token) {
      localStorage.setItem('access_token', res.data.access_token);
    }
    return res.data;
  },
  async getMe(): Promise<User> {
    const res = await api.get('/auth/me');
    return res.data;
  },
  async getOrganization(): Promise<Organization> {
    const res = await api.get('/auth/organization');
    return res.data;
  },
};

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    const res = await api.get('/dashboard/metrics');
    return res.data;
  },
  async getInsights(): Promise<BusinessInsight[]> {
    const res = await api.get('/dashboard/insights');
    return res.data;
  },
  async getRecentCalls(limit = 10): Promise<Call[]> {
    const res = await api.get(`/dashboard/recent-calls?limit=${limit}`);
    return res.data;
  },
  async executeAICommand(instruction: string): Promise<AICommandResponse> {
    const res = await api.post('/ai/command', { instruction });
    return res.data;
  },
};

export const agentService = {
  async listAgents(): Promise<Agent[]> {
    const res = await api.get('/agents/');
    return res.data;
  },
  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const res = await api.post('/agents/', data);
    return res.data;
  },
  async getAgent(id: string): Promise<Agent> {
    const res = await api.get(`/agents/${id}`);
    return res.data;
  },
  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    const res = await api.put(`/agents/${id}`, data);
    return res.data;
  },
  async deleteAgent(id: string): Promise<{ success: boolean }> {
    const res = await api.delete(`/agents/${id}`);
    return res.data;
  },
  async deployAgent(id: string): Promise<any> {
    const res = await api.post(`/agents/${id}/deploy`);
    return res.data;
  },
  async testAgent(id: string, message: string): Promise<any> {
    const res = await api.post(`/agents/${id}/test`, { message });
    return res.data;
  },
};

export const operationsService = {
  // Calls
  async listCalls(): Promise<Call[]> {
    const res = await api.get('/calls');
    return res.data;
  },
  async getCall(id: string): Promise<Call> {
    const res = await api.get(`/calls/${id}`);
    return res.data;
  },
  async getTranscript(callId: string): Promise<any> {
    const res = await api.get(`/calls/${callId}/transcript`);
    return res.data;
  },
  async initiateCall(payload: {
    phone_number: string;
    agent_id?: string;
    customer_id?: string;
    purpose?: string;
    context?: any;
  }): Promise<any> {
    const res = await api.post('/calls/initiate', payload);
    return res.data;
  },

  // Customers
  async listCustomers(search?: string): Promise<Customer[]> {
    const res = await api.get(`/customers${search ? `?search=${encodeURIComponent(search)}` : ''}`);
    return res.data;
  },
  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const res = await api.post('/customers', data);
    return res.data;
  },

  // Orders
  async listOrders(status?: string): Promise<Order[]> {
    const res = await api.get(`/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`);
    return res.data;
  },
  async updateOrder(id: string, data: Partial<Order>): Promise<Order> {
    const res = await api.put(`/orders/${id}`, data);
    return res.data;
  },

  // Suppliers & Procurement
  async listSuppliers(): Promise<Supplier[]> {
    const res = await api.get('/suppliers');
    return res.data;
  },
  async createSupplier(data: Partial<Supplier>): Promise<Supplier> {
    const res = await api.post('/suppliers', data);
    return res.data;
  },

  // Products & Inventory
  async listProducts(lowStockOnly = false): Promise<Product[]> {
    const res = await api.get(`/products${lowStockOnly ? '?low_stock=true' : ''}`);
    return res.data;
  },
  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },

  // Payments
  async listPayments(): Promise<Payment[]> {
    const res = await api.get('/payments');
    return res.data;
  },
  async updatePayment(id: string, data: Partial<Payment>): Promise<Payment> {
    const res = await api.put(`/payments/${id}`, data);
    return res.data;
  },

  // Appointments
  async listAppointments(): Promise<Appointment[]> {
    const res = await api.get('/appointments');
    return res.data;
  },
  async updateAppointment(id: string, data: Partial<Appointment>): Promise<Appointment> {
    const res = await api.put(`/appointments/${id}`, data);
    return res.data;
  },

  // Support Tickets
  async listTickets(): Promise<SupportTicket[]> {
    const res = await api.get('/tickets');
    return res.data;
  },
  async updateTicket(id: string, data: Partial<SupportTicket>): Promise<SupportTicket> {
    const res = await api.put(`/tickets/${id}`, data);
    return res.data;
  },

  // Workflows
  async listWorkflows(): Promise<Workflow[]> {
    const res = await api.get('/workflows');
    return res.data;
  },
  async updateWorkflow(id: string, data: Partial<Workflow>): Promise<Workflow> {
    const res = await api.put(`/workflows/${id}`, data);
    return res.data;
  },
};

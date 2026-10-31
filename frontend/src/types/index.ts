export type UserRole = 'owner' | 'admin' | 'manager' | 'member';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  business_type?: string;
  industry?: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  website?: string;
  is_active: boolean;
  created_at: string;
}

export interface Agent {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  agent_type: string;
  personality?: string;
  voice_id?: string;
  voice_provider?: string;
  language: string;
  languages_supported?: string[];
  system_prompt?: string;
  greeting_message?: string;
  bolna_agent_id?: string;
  inbound_enabled: boolean;
  outbound_enabled: boolean;
  phone_number?: string;
  max_call_duration?: number;
  working_hours_start?: string;
  working_hours_end?: string;
  escalation_enabled?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Call {
  id: string;
  organization_id: string;
  agent_id?: string;
  agent_name?: string;
  customer_id?: string;
  customer_name?: string;
  bolna_call_id?: string;
  direction: 'inbound' | 'outbound';
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'busy' | 'no_answer';
  phone_number?: string;
  purpose?: string;
  duration_seconds?: number;
  outcome?: string;
  outcome_details?: any;
  sentiment?: 'positive' | 'neutral' | 'negative';
  sentiment_score?: number;
  recording_url?: string;
  human_handoff?: boolean;
  handoff_reason?: string;
  error_message?: string;
  created_at: string;
}

export interface TranscriptMessage {
  role: 'assistant' | 'user' | 'system';
  content: string;
  timestamp?: string;
}

export interface Transcript {
  id: string;
  call_id: string;
  messages: TranscriptMessage[];
  summary?: string;
  key_points?: string[];
  action_items?: string[];
  entities_extracted?: Record<string, any>;
  language?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company_name?: string;
  customer_type?: string;
  city?: string;
  state?: string;
  total_orders: number;
  total_spent: number;
  satisfaction_score?: number;
  notes?: string;
  created_at: string;
}

export interface OrderItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';
  total_amount: number;
  currency: string;
  delivery_date?: string;
  delivery_address?: string;
  delivery_time_slot?: string;
  delivery_rescheduled?: boolean;
  confirmation_call_status?: string;
  items?: OrderItem[];
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  email?: string;
  phone?: string;
  city?: string;
  category?: string;
  rating?: number;
  total_orders: number;
  is_preferred: boolean;
  payment_terms?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category?: string;
  description?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  reorder_level: number;
  reorder_quantity: number;
  supplier_id?: string;
  supplier_name?: string;
  unit?: string;
  is_active: boolean;
  created_at: string;
}

export interface Payment {
  id: string;
  customer_id?: string;
  customer_name?: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'overdue';
  payment_method?: string;
  due_date?: string;
  paid_at?: string;
  invoice_number?: string;
  reminder_count: number;
  last_reminder_at?: string;
  notes?: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  title: string;
  description?: string;
  appointment_type?: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'scheduled' | 'confirmed' | 'rescheduled' | 'cancelled' | 'completed' | 'no_show';
  location?: string;
  assigned_to?: string;
  reminder_sent: boolean;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  customer_id?: string;
  customer_name?: string;
  subject: string;
  description?: string;
  category?: string;
  status: 'open' | 'in_progress' | 'pending_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigned_to?: string;
  resolution?: string;
  resolved_at?: string;
  created_at: string;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger_type: string;
  trigger_config?: any;
  actions?: any[];
  is_active: boolean;
  require_approval: boolean;
  execution_count: number;
  last_triggered_at?: string;
  created_at: string;
}

export interface DashboardMetrics {
  total_calls: number;
  successful_calls: number;
  active_agents: number;
  pending_orders: number;
  pending_payments: number;
  open_tickets: number;
  upcoming_appointments: number;
  low_stock_products: number;
  customer_satisfaction: number;
  revenue_this_month: number;
  calls_today: number;
  is_demo: boolean;
}

export interface BusinessInsight {
  title: string;
  description: string;
  category: 'inventory' | 'customer' | 'financial' | 'operations';
  priority: 'low' | 'medium' | 'high';
  suggested_action?: string;
  impact?: string;
  action_type?: string;
  action_payload?: any;
}

export interface AICommandResponse {
  success: boolean;
  instruction: string;
  response: string;
  actions_taken: any[];
  requires_approval: boolean;
  approval_details?: any;
}

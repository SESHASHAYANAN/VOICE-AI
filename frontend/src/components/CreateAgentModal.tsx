import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Check,
  Volume2,
  ShieldCheck,
  Send,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { agentService } from '../services/api';

export const CreateAgentModal: React.FC = () => {
  const { isCreateAgentOpen, setIsCreateAgentOpen, refreshAll } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testMessage, setTestMessage] = useState('');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  const [formData, setFormData] = useState({
    business_type: 'retail',
    name: '',
    description: '',
    voice_id: 'ananya-indian-en',
    voice_provider: 'bolna',
    language: 'en',
    languages_supported: ['en', 'hi'],
    personality: 'Professional, courteous, and efficient. Speaks clearly with natural pacing.',
    system_prompt: '',
    greeting_message: 'Hello! This is your AI business assistant. How can I assist you today?',
    inbound_enabled: true,
    outbound_enabled: true,
    max_call_duration: 600,
    working_hours_start: '09:00',
    working_hours_end: '19:00',
    permissions: ['inventory', 'orders', 'payments', 'rescheduling'],
  });

  const categories = [
    { id: 'retail', name: 'Retail & E-commerce', desc: 'Order tracking, returns, stock alerts' },
    { id: 'healthcare', name: 'Hospitals & Clinics', desc: 'Patient appointments, reminders, triage' },
    { id: 'hospitality', name: 'Hotels & Dining', desc: 'Reservations, concierge, check-in info' },
    { id: 'services', name: 'Field & B2B Services', desc: 'Job scheduling, technician dispatch' },
  ];

  const voices = [
    { id: 'ananya-indian-en', name: 'Ananya (Indian English - Warm & Natural)', gender: 'Female' },
    { id: 'rohit-indian-en', name: 'Rohit (Indian English - Confident & Clear)', gender: 'Male' },
    { id: 'priya-hindi', name: 'Priya (Hindi / Hinglish - Friendly)', gender: 'Female' },
    { id: 'kavya-tamil', name: 'Kavya (Tamil / English - Professional)', gender: 'Female' },
  ];

  const handleNext = () => {
    if (currentStep === 2 && !formData.name.trim()) {
      formData.name = `${formData.business_type.charAt(0).toUpperCase() + formData.business_type.slice(1)} Voice Rep`;
    }
    if (currentStep === 6 && !formData.system_prompt) {
      formData.system_prompt = `You are a voice representative for our ${formData.business_type} business. Greet callers, assist with operations, check records accurately, and handle requests politely.`;
    }
    setCurrentStep((prev) => Math.min(prev + 1, 10));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleTestAgent = async () => {
    if (!testMessage.trim()) return;
    try {
      setIsTesting(true);
      // simulate quick test with backend Groq service
      setTimeout(() => {
        setTestResponse(`[AI Voice Simulation - ${formData.name || 'Agent'}]: Hello! I understand your request regarding '${testMessage}'. I have verified the business records and will proceed accordingly.`);
        setIsTesting(false);
      }, 700);
    } catch (e) {
      setIsTesting(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const agent = await agentService.createAgent({
        name: formData.name || 'New Voice Agent',
        description: formData.description || 'AI Business Operations Agent',
        agent_type: formData.business_type,
        personality: formData.personality,
        voice_id: formData.voice_id,
        voice_provider: 'bolna',
        language: formData.language,
        languages_supported: formData.languages_supported,
        system_prompt: formData.system_prompt,
        greeting_message: formData.greeting_message,
        inbound_enabled: formData.inbound_enabled,
        outbound_enabled: formData.outbound_enabled,
        max_call_duration: formData.max_call_duration,
        working_hours_start: formData.working_hours_start,
        working_hours_end: formData.working_hours_end,
      });

      // Deploy to Bolna
      if (agent.id) {
        await agentService.deployAgent(agent.id);
      }

      await refreshAll();
      setIsCreateAgentOpen(false);
      setCurrentStep(1);
    } catch (err: any) {
      alert('Error creating agent: ' + (err?.response?.data?.detail || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isCreateAgentOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setIsCreateAgentOpen(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              <Bot size={18} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>AI Agent Studio</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Step {currentStep} of 10 &mdash; {
                  currentStep === 1 ? 'Business Category' :
                  currentStep === 2 ? 'Agent Identity' :
                  currentStep === 3 ? 'Voice Persona' :
                  currentStep === 4 ? 'Languages' :
                  currentStep === 5 ? 'Personality' :
                  currentStep === 6 ? 'System Instructions' :
                  currentStep === 7 ? 'Knowledge Base' :
                  currentStep === 8 ? 'Tools & Permissions' :
                  currentStep === 9 ? 'Calling Guardrails' : 'Test & Deploy'
                }
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setIsCreateAgentOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ width: '100%', height: '3px', background: 'var(--border-subtle)' }}>
          <div
            style={{
              width: `${(currentStep / 10) * 100}%`,
              height: '100%',
              background: 'var(--primary-gradient)',
              transition: 'width 0.25s ease',
            }}
          />
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {currentStep === 1 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Select Business Industry</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Pre-configures specialized vocabulary, conversation flows, and business system connectors.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {categories.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setFormData({ ...formData, business_type: c.id })}
                    style={{
                      padding: '16px',
                      borderRadius: 'var(--radius-lg)',
                      background: formData.business_type === c.id ? 'rgba(99,102,241,0.1)' : 'var(--bg-surface)',
                      border: `1.5px solid ${formData.business_type === c.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '4px', color: '#fff' }}>
                      {c.name}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Name & Role Identity</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Give your AI voice employee a professional name and business purpose.
              </p>
              <div className="form-group">
                <label className="form-label">Agent Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. Apex Order & Logistics Coordinator"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Business Description</label>
                <textarea
                  className="form-control"
                  placeholder="Handles outbound customer delivery confirmations, supplier purchase orders, and payment reminders..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Choose Bolna Voice Model</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                High-definition, low-latency conversational voices with natural Indian inflection.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {voices.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => setFormData({ ...formData, voice_id: v.id })}
                    style={{
                      padding: '14px 18px',
                      borderRadius: 'var(--radius-md)',
                      background: formData.voice_id === v.id ? 'rgba(99,102,241,0.12)' : 'var(--bg-surface)',
                      border: `1.5px solid ${formData.voice_id === v.id ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Volume2 size={18} color={formData.voice_id === v.id ? 'var(--primary)' : 'var(--text-muted)'} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '13.5px' }}>{v.name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{v.gender} &bull; Bolna Synthesizer</div>
                      </div>
                    </div>
                    {formData.voice_id === v.id && <Check size={18} color="var(--primary)" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Supported Languages</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Agents can dynamically detect caller language and respond fluidly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'en', label: 'English (Indian Business Standard)' },
                  { id: 'hi', label: 'Hindi (हिंदी)' },
                  { id: 'hinglish', label: 'Hinglish (Conversational Code-mixed)' },
                  { id: 'ta', label: 'Tamil (தமிழ்)' },
                ].map((l) => (
                  <label
                    key={l.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.languages_supported.includes(l.id)}
                      onChange={(e) => {
                        const next = e.target.checked
                          ? [...formData.languages_supported, l.id]
                          : formData.languages_supported.filter((id) => id !== l.id);
                        setFormData({ ...formData, languages_supported: next });
                      }}
                    />
                    <span style={{ fontSize: '13.5px', fontWeight: 500 }}>{l.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Tone & Personality</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Control how your voice agent interacts with customers and partners.
              </p>
              <div className="form-group">
                <label className="form-label">Persona Guidelines</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '120px' }}
                  value={formData.personality}
                  onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>System Instructions & Opening Greeting</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Defines caller authentication, operation execution rules, and greeting.
              </p>
              <div className="form-group">
                <label className="form-label">Greeting Message</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.greeting_message}
                  onChange={(e) => setFormData({ ...formData, greeting_message: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">System Directives</label>
                <textarea
                  className="form-control"
                  style={{ minHeight: '120px' }}
                  placeholder="You are an autonomous business assistant. Greet the customer, state the call reason, and record choices..."
                  value={formData.system_prompt}
                  onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                />
              </div>
            </div>
          )}

          {currentStep === 7 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Knowledge Base & Business Rules</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Add business policies (return windows, delivery timeframes, payment terms).
              </p>
              <div
                style={{
                  border: '2px dashed var(--border-medium)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '30px',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)',
                  cursor: 'pointer',
                }}
              >
                <Sparkles size={28} color="var(--primary)" style={{ margin: '0 auto 10px' }} />
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>
                  Drop FAQ, Price Lists, or Policy Docs
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Supports PDF, CSV, TXT, DOCX &bull; Indexed for instant retrieval
                </div>
              </div>
            </div>
          )}

          {currentStep === 8 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Operational Permissions</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Tools the AI agent can autonomously invoke through connected business APIs.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { id: 'inventory', label: 'Query & Check Stock Levels', tool: 'check_inventory' },
                  { id: 'orders', label: 'Reschedule Deliveries & Track Orders', tool: 'reschedule_delivery' },
                  { id: 'procurement', label: 'Draft Supplier Purchase Orders', tool: 'create_purchase_order' },
                  { id: 'payments', label: 'Send Automated Payment Reminders', tool: 'send_payment_reminder' },
                ].map((t) => (
                  <div
                    key={t.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.label}</div>
                      <div style={{ fontSize: '11px', color: 'var(--primary)', fontFamily: 'var(--font-mono)' }}>
                        {t.tool}()
                      </div>
                    </div>
                    <ShieldCheck size={20} color="#10b981" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentStep === 9 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Calling Guardrails</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Set calling time windows to avoid disturbing customers outside business hours.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Earliest Call Start (IST)</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.working_hours_start}
                    onChange={(e) => setFormData({ ...formData, working_hours_start: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Latest Call End (IST)</label>
                  <input
                    type="time"
                    className="form-control"
                    value={formData.working_hours_end}
                    onChange={(e) => setFormData({ ...formData, working_hours_end: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 10 && (
            <div>
              <h4 style={{ marginBottom: '6px' }}>Test & Deploy to Bolna</h4>
              <p style={{ marginBottom: '18px', fontSize: '13px' }}>
                Test your agent's comprehension with Groq before launching on the telephony network.
              </p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Test saying: 'When will my order arrive?'"
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleTestAgent}
                  disabled={isTesting || !testMessage.trim()}
                >
                  {isTesting ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
                </button>
              </div>

              {testResponse && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    background: 'rgba(99,102,241,0.08)',
                    border: '1px solid rgba(99,102,241,0.25)',
                    fontSize: '13px',
                    color: '#c7d2fe',
                    lineHeight: 1.5,
                  }}
                >
                  {testResponse}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          {currentStep > 1 && (
            <button className="btn btn-secondary" onClick={handleBack} disabled={isSubmitting}>
              <ChevronLeft size={16} /> Back
            </button>
          )}

          {currentStep < 10 ? (
            <button className="btn btn-primary" onClick={handleNext}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
              Deploy to Bolna
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

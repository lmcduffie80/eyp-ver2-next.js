'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Template {
  id: number;
  template_name: string;
  service_type: string;
  template_content: string;
  variables: any[];
  is_active: boolean;
  is_default: boolean;
  created_by_username: string;
  created_at: string;
}

export default function ContractTemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    template_name: '',
    service_type: 'All Services',
    template_content: '',
    is_active: true,
    is_default: false
  });

  useEffect(() => {
    checkAuth();
    fetchTemplates();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/crm-admin/verify');
      const data = await response.json();
      
      if (!data.authenticated) {
        router.push('/crm-admin/login');
      }
    } catch (error) {
      router.push('/crm-admin/login');
    }
  };

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/crm/contracts/templates');
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingTemplate(null);
    setFormData({
      template_name: '',
      service_type: 'All Services',
      template_content: getDefaultTemplateContent(),
      is_active: true,
      is_default: false
    });
    setShowModal(true);
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      template_name: template.template_name,
      service_type: template.service_type || 'All Services',
      template_content: template.template_content,
      is_active: template.is_active,
      is_default: template.is_default
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingTemplate
        ? `/api/crm/contracts/templates/${editingTemplate.id}`
        : '/api/crm/contracts/templates';

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setShowModal(false);
        fetchTemplates();
      } else {
        alert(data.error || 'Failed to save template');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
      alert('An error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      const response = await fetch(`/api/crm/contracts/templates/${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchTemplates();
      } else {
        alert(data.error || 'Failed to delete template');
      }
    } catch (error) {
      console.error('Failed to delete template:', error);
      alert('An error occurred');
    }
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('template_content') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const text = formData.template_content;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      setFormData({
        ...formData,
        template_content: before + `{{${variable}}}` + after
      });

      // Set cursor position after inserted variable
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length + 4, start + variable.length + 4);
      }, 0);
    }
  };

  const getDefaultTemplateContent = () => {
    return `EVENT SERVICES AGREEMENT

This Agreement is made on {{current_date}} between:

SERVICE PROVIDER:
Externally Yours Productions
[Contact Information]

CLIENT:
{{client_name}}
{{client_email}}
{{client_phone}}

EVENT DETAILS:
Event Type: {{event_type}}
Event Date: {{event_date}}
Event Location: {{event_location}}
Expected Guest Count: {{guest_count}}

SERVICES PROVIDED:
{{service_list}}

PAYMENT TERMS:
Total Amount: {{total_amount}}
Deposit Amount: {{deposit_amount}} (Due upon signing)
Final Payment: {{final_payment_amount}} (Due {{payment_due_date}})

{{payment_schedule}}

TERMS AND CONDITIONS:

1. DEPOSIT
A non-refundable deposit of {{deposit_amount}} is required to secure the date. This deposit will be applied to the total contract amount.

2. CANCELLATION POLICY
- More than 90 days before event: Full refund minus deposit
- 60-89 days before event: 50% refund
- Less than 60 days before event: No refund

3. SERVICES
The service provider agrees to provide the services outlined above. Any additional services requested will be quoted separately.

4. CLIENT RESPONSIBILITIES
The client agrees to:
- Provide accurate event information
- Communicate any changes promptly
- Ensure adequate space and facilities for services

5. LIABILITY
The service provider carries appropriate insurance and will conduct services professionally.

SIGNATURES:

Client Signature: _________________________
Date: __________

Service Provider: _________________________
Date: __________

{{terms_and_conditions}}`;
  };

  const availableVariables = [
    'client_name',
    'client_email',
    'client_phone',
    'client_company',
    'event_type',
    'event_date',
    'event_location',
    'guest_count',
    'service_list',
    'total_amount',
    'deposit_amount',
    'final_payment_amount',
    'payment_due_date',
    'payment_schedule',
    'terms_and_conditions',
    'current_date'
  ];

  const handleLogout = async () => {
    await fetch('/api/crm-admin/logout', { method: 'POST' });
    router.push('/crm-admin/login');
  };

  return (
    <div className="templates-page">
      <div className="top-bar">
        <div className="top-bar-content">
          <h1>Contract Templates</h1>
          <div className="actions">
            <button onClick={() => router.push('/crm-admin/dashboard')} className="nav-button">
              Dashboard
            </button>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="controls">
          <button className="add-button" onClick={handleAddNew}>
            + Create New Template
          </button>
        </div>

        {loading ? (
          <div className="loading">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <p>No contract templates found</p>
            <button onClick={handleAddNew} className="create-first-button">
              Create Your First Template
            </button>
          </div>
        ) : (
          <div className="templates-list">
            {templates.map((template) => (
              <div key={template.id} className="template-card">
                <div className="card-header">
                  <div>
                    <h3>{template.template_name}</h3>
                    <p className="service-type">{template.service_type}</p>
                  </div>
                  <div className="badges">
                    {template.is_default && (
                      <span className="default-badge">Default</span>
                    )}
                    <span className={`status-badge ${template.is_active ? 'active' : 'inactive'}`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div className="card-body">
                  <p className="preview">{template.template_content.substring(0, 200)}...</p>
                  <div className="meta">
                    <span>Created by {template.created_by_username || 'Unknown'}</span>
                    <span>•</span>
                    <span>{new Date(template.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="card-footer">
                  <button onClick={() => handleEdit(template)} className="edit-btn">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(template.id)} className="delete-btn">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setShowModal(false)}>×</button>
            
            <h2>{editingTemplate ? 'Edit Template' : 'Create New Template'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  value={formData.template_name}
                  onChange={(e) => setFormData({ ...formData, template_name: e.target.value })}
                  required
                  placeholder="e.g., Standard DJ Contract"
                />
              </div>

              <div className="form-group">
                <label>Service Type</label>
                <select
                  value={formData.service_type}
                  onChange={(e) => setFormData({ ...formData, service_type: e.target.value })}
                >
                  <option value="All Services">All Services</option>
                  <option value="DJ">DJ</option>
                  <option value="Photography">Photography</option>
                  <option value="Videography">Videography</option>
                </select>
              </div>

              <div className="form-group">
                <label>Available Variables (click to insert)</label>
                <div className="variables-grid">
                  {availableVariables.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      className="variable-btn"
                      onClick={() => insertVariable(variable)}
                    >
                      {`{{${variable}}}`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Template Content *</label>
                <textarea
                  id="template_content"
                  value={formData.template_content}
                  onChange={(e) => setFormData({ ...formData, template_content: e.target.value })}
                  required
                  rows={20}
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              <div className="form-group checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  <span>Active</span>
                </label>

                <label>
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  />
                  <span>Set as default template for this service type</span>
                </label>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(false)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  {editingTemplate ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .templates-page {
          min-height: 100vh;
          background: #f8f9fa;
        }

        .top-bar {
          background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
          color: white;
          padding: 20px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .top-bar-content {
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .top-bar h1 {
          margin: 0;
          font-size: 1.8rem;
        }

        .actions {
          display: flex;
          gap: 10px;
        }

        .nav-button,
        .logout-button {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-button {
          background: #ff6b35;
          color: white;
        }

        .nav-button:hover {
          background: #e55a2b;
        }

        .logout-button {
          background: rgba(255, 255, 255, 0.1);
          color: white;
        }

        .logout-button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 30px 20px;
        }

        .controls {
          margin-bottom: 30px;
        }

        .add-button {
          padding: 12px 30px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .add-button:hover {
          background: #e55a2b;
          transform: translateY(-2px);
        }

        .loading {
          text-align: center;
          padding: 60px 20px;
          color: #666;
          font-size: 1.1rem;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-state p {
          color: #666;
          font-size: 1.1rem;
          margin-bottom: 20px;
        }

        .create-first-button {
          padding: 14px 35px;
          background: #ff6b35;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          transition: all 0.2s ease;
        }

        .create-first-button:hover {
          background: #e55a2b;
        }

        .templates-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
          gap: 20px;
        }

        .template-card {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .template-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        }

        .card-header {
          padding: 20px;
          background: #f8f9fa;
          border-bottom: 2px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-header h3 {
          margin: 0 0 8px 0;
          color: #1a1a1a;
          font-size: 1.3rem;
        }

        .service-type {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .badges {
          display: flex;
          gap: 8px;
          flex-direction: column;
        }

        .default-badge,
        .status-badge {
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-align: center;
        }

        .default-badge {
          background: #8b5cf6;
          color: white;
        }

        .status-badge.active {
          background: #10b981;
          color: white;
        }

        .status-badge.inactive {
          background: #6b7280;
          color: white;
        }

        .card-body {
          padding: 20px;
        }

        .preview {
          color: #555;
          font-size: 0.9rem;
          line-height: 1.6;
          margin: 0 0 15px 0;
          font-family: monospace;
          background: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
        }

        .meta {
          font-size: 0.85rem;
          color: #999;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .card-footer {
          padding: 15px 20px;
          background: #f8f9fa;
          border-top: 2px solid #e0e0e0;
          display: flex;
          gap: 10px;
        }

        .edit-btn,
        .delete-btn {
          flex: 1;
          padding: 10px;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .edit-btn {
          background: #ff6b35;
          color: white;
        }

        .edit-btn:hover {
          background: #e55a2b;
        }

        .delete-btn {
          background: #fee;
          color: #dc2626;
        }

        .delete-btn:hover {
          background: #dc2626;
          color: white;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 30px;
          position: relative;
        }

        .close-button {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          border: none;
          background: #f0f0f0;
          border-radius: 50%;
          font-size: 1.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .close-button:hover {
          background: #e0e0e0;
        }

        .modal h2 {
          margin: 0 0 25px 0;
          color: #1a1a1a;
          font-size: 1.8rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input[type="text"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .variables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 8px;
          margin-top: 10px;
        }

        .variable-btn {
          padding: 8px 12px;
          background: #f8f9fa;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-family: monospace;
          transition: all 0.2s ease;
        }

        .variable-btn:hover {
          background: #ffe8de;
          border-color: #ff6b35;
          color: #ff6b35;
        }

        .form-group.checkboxes {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .form-group.checkboxes label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .form-group.checkboxes input[type="checkbox"] {
          width: auto;
          cursor: pointer;
          accent-color: #ff6b35;
        }

        .form-actions {
          display: flex;
          gap: 15px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 2px solid #e0e0e0;
        }

        .cancel-btn,
        .save-btn {
          padding: 12px 30px;
          border-radius: 10px;
          border: none;
          cursor: pointer;
          font-weight: 600;
          font-size: 1rem;
          transition: all 0.2s ease;
        }

        .cancel-btn {
          background: #f0f0f0;
          color: #666;
        }

        .cancel-btn:hover {
          background: #e0e0e0;
        }

        .save-btn {
          background: #ff6b35;
          color: white;
        }

        .save-btn:hover {
          background: #e55a2b;
        }

        @media (max-width: 768px) {
          .templates-list {
            grid-template-columns: 1fr;
          }

          .variables-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .form-actions {
            flex-direction: column;
          }

          .cancel-btn,
          .save-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

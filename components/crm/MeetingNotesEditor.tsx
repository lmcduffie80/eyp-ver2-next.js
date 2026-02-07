'use client';

import React, { useState } from 'react';

interface ActionItem {
  item: string;
  assigned_to: string;
  due_date: string;
  completed: boolean;
}

interface MeetingNotesEditorProps {
  projectId: number;
  onSave: () => void;
  onCancel: () => void;
}

export default function MeetingNotesEditor({ projectId, onSave, onCancel }: MeetingNotesEditorProps) {
  const [formData, setFormData] = useState({
    meeting_title: '',
    meeting_date: new Date().toISOString().split('T')[0],
    meeting_type: 'video',
    attendees: [''],
    notes: '',
    action_items: [] as ActionItem[],
    visible_to_client: false
  });
  const [saving, setSaving] = useState(false);

  const addAttendee = () => {
    setFormData({
      ...formData,
      attendees: [...formData.attendees, '']
    });
  };

  const updateAttendee = (index: number, value: string) => {
    const newAttendees = [...formData.attendees];
    newAttendees[index] = value;
    setFormData({ ...formData, attendees: newAttendees });
  };

  const removeAttendee = (index: number) => {
    const newAttendees = formData.attendees.filter((_, i) => i !== index);
    setFormData({ ...formData, attendees: newAttendees });
  };

  const addActionItem = () => {
    setFormData({
      ...formData,
      action_items: [
        ...formData.action_items,
        { item: '', assigned_to: '', due_date: '', completed: false }
      ]
    });
  };

  const updateActionItem = (index: number, field: keyof ActionItem, value: any) => {
    const newActionItems = [...formData.action_items];
    newActionItems[index] = { ...newActionItems[index], [field]: value };
    setFormData({ ...formData, action_items: newActionItems });
  };

  const removeActionItem = (index: number) => {
    const newActionItems = formData.action_items.filter((_, i) => i !== index);
    setFormData({ ...formData, action_items: newActionItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Filter out empty attendees
      const cleanAttendees = formData.attendees.filter(a => a.trim() !== '');

      const response = await fetch(`/api/crm/projects/${projectId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          attendees: cleanAttendees
        })
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        alert(data.error || 'Failed to save note');
        setSaving(false);
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('An error occurred');
      setSaving(false);
    }
  };

  return (
    <div className="notes-editor">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Meeting Title *</label>
          <input
            type="text"
            value={formData.meeting_title}
            onChange={(e) => setFormData({ ...formData, meeting_title: e.target.value })}
            required
            placeholder="e.g., Initial Consultation"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Meeting Date *</label>
            <input
              type="date"
              value={formData.meeting_date}
              onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label>Meeting Type</label>
            <select
              value={formData.meeting_type}
              onChange={(e) => setFormData({ ...formData, meeting_type: e.target.value })}
            >
              <option value="phone">Phone Call</option>
              <option value="video">Video Call</option>
              <option value="in-person">In-Person</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Attendees</label>
          {formData.attendees.map((attendee, index) => (
            <div key={index} className="attendee-row">
              <input
                type="text"
                value={attendee}
                onChange={(e) => updateAttendee(index, e.target.value)}
                placeholder="Name"
              />
              {formData.attendees.length > 1 && (
                <button type="button" onClick={() => removeAttendee(index)} className="remove-btn">
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={addAttendee} className="add-btn">
            + Add Attendee
          </button>
        </div>

        <div className="form-group">
          <label>Notes *</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            required
            rows={8}
            placeholder="Write meeting notes here..."
          />
        </div>

        <div className="form-group">
          <label>Action Items</label>
          {formData.action_items.map((item, index) => (
            <div key={index} className="action-item">
              <input
                type="text"
                value={item.item}
                onChange={(e) => updateActionItem(index, 'item', e.target.value)}
                placeholder="Action item description"
              />
              <input
                type="text"
                value={item.assigned_to}
                onChange={(e) => updateActionItem(index, 'assigned_to', e.target.value)}
                placeholder="Assigned to"
              />
              <input
                type="date"
                value={item.due_date}
                onChange={(e) => updateActionItem(index, 'due_date', e.target.value)}
              />
              <button type="button" onClick={() => removeActionItem(index)} className="remove-btn">
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addActionItem} className="add-btn">
            + Add Action Item
          </button>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.visible_to_client}
              onChange={(e) => setFormData({ ...formData, visible_to_client: e.target.checked })}
            />
            <span>Visible to client in portal</span>
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} className="cancel-btn" disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Meeting Notes'}
          </button>
        </div>
      </form>

      <style jsx>{`
        .notes-editor {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
        .form-group input[type="date"],
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff6b35;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .attendee-row {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .attendee-row input {
          flex: 1;
        }

        .action-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr auto;
          gap: 10px;
          margin-bottom: 10px;
        }

        .add-btn {
          padding: 10px 20px;
          background: #f0f0f0;
          border: 2px dashed #ccc;
          border-radius: 8px;
          cursor: pointer;
          color: #666;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .add-btn:hover {
          background: #e8e8e8;
          border-color: #ff6b35;
          color: #ff6b35;
        }

        .remove-btn {
          padding: 10px 16px;
          background: #fee;
          color: #dc2626;
          border: 1px solid #dc2626;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .remove-btn:hover {
          background: #dc2626;
          color: white;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }

        .checkbox-label input[type="checkbox"] {
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

        .cancel-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .save-btn {
          background: #ff6b35;
          color: white;
        }

        .save-btn:hover:not(:disabled) {
          background: #e55a2b;
        }

        .cancel-btn:disabled,
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }

          .action-item {
            grid-template-columns: 1fr;
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

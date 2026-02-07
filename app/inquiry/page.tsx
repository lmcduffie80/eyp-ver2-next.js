'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function InquiryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    client_company: '',
    event_type: '',
    event_date: '',
    event_location: '',
    guest_count: '',
    services_requested: [] as string[],
    budget_range: '',
    message: '',
    referral_source: ''
  });

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_requested: prev.services_requested.includes(service)
        ? prev.services_requested.filter(s => s !== service)
        : [...prev.services_requested, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/public/inquiry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          guest_count: formData.guest_count ? parseInt(formData.guest_count) : null
        })
      });

      const data = await response.json();

      if (data.success) {
        // Redirect to success page
        router.push(`/inquiry/success?ref=${data.inquiry_number}`);
      } else {
        setError(data.error || 'Failed to submit inquiry');
        setLoading(false);
      }
    } catch (err) {
      console.error('Inquiry submission error:', err);
      setError('An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="inquiry-page">
      <div className="inquiry-container">
        <div className="inquiry-header">
          <Image 
            src="/EYP Logo_New.png" 
            alt="Externally Yours Productions" 
            width={507}
            height={135}
            className="inquiry-logo"
            priority
          />
          <h1>Start Your Event Journey</h1>
          <p>Tell us about your vision, and we'll bring it to life</p>
        </div>

        {error && (
          <div className="error-message show">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="inquiry-form">
          <div className="form-section">
            <h2>Contact Information</h2>
            
            <div className="form-group">
              <label htmlFor="client_name">Full Name *</label>
              <input
                type="text"
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                required
                disabled={loading}
                placeholder="John Smith"
              />
            </div>

            <div className="form-group">
              <label htmlFor="client_email">Email Address *</label>
              <input
                type="email"
                id="client_email"
                value={formData.client_email}
                onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                required
                disabled={loading}
                placeholder="john@example.com"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="client_phone">Phone Number</label>
                <input
                  type="tel"
                  id="client_phone"
                  value={formData.client_phone}
                  onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                  disabled={loading}
                  placeholder="(555) 123-4567"
                />
              </div>

              <div className="form-group">
                <label htmlFor="client_company">Company (Optional)</label>
                <input
                  type="text"
                  id="client_company"
                  value={formData.client_company}
                  onChange={(e) => setFormData({ ...formData, client_company: e.target.value })}
                  disabled={loading}
                  placeholder="Company name"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Event Details</h2>
            
            <div className="form-group">
              <label htmlFor="event_type">Event Type</label>
              <select
                id="event_type"
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                disabled={loading}
              >
                <option value="">Select event type...</option>
                <option value="Wedding">Wedding</option>
                <option value="Corporate Event">Corporate Event</option>
                <option value="Birthday Party">Birthday Party</option>
                <option value="Anniversary">Anniversary</option>
                <option value="School Event">School Event</option>
                <option value="Graduation">Graduation</option>
                <option value="Holiday Party">Holiday Party</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="event_date">Event Date</label>
                <input
                  type="date"
                  id="event_date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="guest_count">Expected Guest Count</label>
                <input
                  type="number"
                  id="guest_count"
                  value={formData.guest_count}
                  onChange={(e) => setFormData({ ...formData, guest_count: e.target.value })}
                  disabled={loading}
                  placeholder="100"
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="event_location">Event Location</label>
              <input
                type="text"
                id="event_location"
                value={formData.event_location}
                onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                disabled={loading}
                placeholder="City, State or Venue Name"
              />
            </div>
          </div>

          <div className="form-section">
            <h2>Services & Budget</h2>
            
            <div className="form-group">
              <label>Services Requested</label>
              <div className="checkbox-group">
                {['DJ Entertainment', 'Photography', 'Videography', 'Event Coordination'].map(service => (
                  <label key={service} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.services_requested.includes(service)}
                      onChange={() => handleServiceToggle(service)}
                      disabled={loading}
                    />
                    <span>{service}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="budget_range">Budget Range</label>
              <select
                id="budget_range"
                value={formData.budget_range}
                onChange={(e) => setFormData({ ...formData, budget_range: e.target.value })}
                disabled={loading}
              >
                <option value="">Select budget range...</option>
                <option value="Under $1,000">Under $1,000</option>
                <option value="$1,000 - $2,500">$1,000 - $2,500</option>
                <option value="$2,500 - $5,000">$2,500 - $5,000</option>
                <option value="$5,000 - $10,000">$5,000 - $10,000</option>
                <option value="$10,000+">$10,000+</option>
                <option value="Flexible">Flexible</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="referral_source">How did you hear about us?</label>
              <select
                id="referral_source"
                value={formData.referral_source}
                onChange={(e) => setFormData({ ...formData, referral_source: e.target.value })}
                disabled={loading}
              >
                <option value="">Select source...</option>
                <option value="Website">Website/Google Search</option>
                <option value="Instagram">Instagram</option>
                <option value="Facebook">Facebook</option>
                <option value="Referral">Referral from Friend/Family</option>
                <option value="Wedding Venue">Wedding Venue</option>
                <option value="Wedding Planner">Wedding Planner</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <h2>Tell Us More</h2>
            
            <div className="form-group">
              <label htmlFor="message">Message / Special Requests</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                disabled={loading}
                rows={6}
                placeholder="Tell us about your event vision, any special requirements, or questions you have..."
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Inquiry'}
          </button>
          
          <p className="privacy-notice">
            By submitting this form, you agree to be contacted about your inquiry. We respect your privacy and will never share your information.
          </p>
        </form>

        <div className="back-link">
          <a href="/">← Back to Website</a>
        </div>
      </div>

      <style jsx>{`
        .inquiry-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          padding: 40px 20px;
        }

        .inquiry-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          padding: 40px;
        }

        .inquiry-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .inquiry-logo {
          margin-bottom: 20px;
          height: auto;
          width: auto;
          max-width: 100%;
        }

        .inquiry-header h1 {
          color: #1a1a1a;
          font-size: 2.5rem;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .inquiry-header p {
          color: #666;
          font-size: 1.1rem;
        }

        .inquiry-form {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .form-section {
          padding: 25px;
          background: #f8f9fa;
          border-radius: 12px;
          border: 1px solid #e0e0e0;
        }

        .form-section h2 {
          color: #1a1a1a;
          font-size: 1.4rem;
          margin: 0 0 20px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #ff6b35;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: #333;
          font-weight: 600;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 1rem;
          font-family: inherit;
          transition: all 0.2s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #ff6b35;
          box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled,
        .form-group textarea:disabled {
          background: #f5f5f5;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }

        .checkbox-group {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 10px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          padding: 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .checkbox-label:hover {
          border-color: #ff6b35;
          background: #fff8f5;
        }

        .checkbox-label input[type="checkbox"] {
          width: auto;
          margin-right: 10px;
          cursor: pointer;
          accent-color: #ff6b35;
        }

        .checkbox-label input[type="checkbox"]:checked + span {
          color: #ff6b35;
        }

        .submit-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #ff6b35 0%, #f41b1b 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1.2rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 20px;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(255, 107, 53, 0.3);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }

        .error-message {
          background: #fee;
          color: #dc3545;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: none;
          border: 1px solid #dc3545;
        }

        .error-message.show {
          display: block;
        }

        .privacy-notice {
          text-align: center;
          color: #999;
          font-size: 0.85rem;
          margin: 20px 0 0 0;
        }

        .back-link {
          text-align: center;
          margin-top: 30px;
        }

        .back-link a {
          color: #666;
          text-decoration: none;
          font-size: 1rem;
          transition: color 0.2s ease;
        }

        .back-link a:hover {
          color: #ff6b35;
        }

        @media (max-width: 768px) {
          .inquiry-page {
            padding: 20px 10px;
          }

          .inquiry-container {
            padding: 25px;
            border-radius: 15px;
          }

          .inquiry-header h1 {
            font-size: 1.8rem;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .checkbox-group {
            grid-template-columns: 1fr;
          }

          .form-section {
            padding: 20px;
          }

          .submit-button {
            font-size: 1rem;
            padding: 14px;
          }
        }
      `}</style>
    </div>
  );
}

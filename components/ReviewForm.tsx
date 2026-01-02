'use client';

import { useState, FormEvent } from 'react';

export default function ReviewForm() {
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      clientName: formData.get('review-client-name') as string,
      serviceType: formData.get('review-service-type') as string,
      djUsername: formData.get('review-dj-name') as string || null,
      rating: formData.get('review-rating') ? parseInt(formData.get('review-rating') as string) : null,
      comment: formData.get('review-comment') as string,
      eventDate: formData.get('review-event-date') as string || null,
    };

    if (!data.clientName || !data.serviceType || !data.comment) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ 
          text: 'Thank you for your review! It has been submitted and will be reviewed before being published.', 
          type: 'success' 
        });
        e.currentTarget.reset();
      } else {
        setMessage({ text: result.error || 'Failed to submit review. Please try again.', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'An error occurred while submitting your review. Please try again later.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="submit-review" style={{ background: 'var(--bg-light)', padding: '4rem 0' }}>
      <div className="container">
        <h2 className="section-title">Share Your Experience</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '2rem' }}>
          We&apos;d love to hear about your experience with Externally Yours Productions!
        </p>
        <div style={{ maxWidth: '700px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '10px', boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>
          <form id="review-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-client-name" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Your Name *
              </label>
              <input
                type="text"
                id="review-client-name"
                name="review-client-name"
                required
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-service-type" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Service Type *
              </label>
              <select
                id="review-service-type"
                name="review-service-type"
                required
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
              >
                <option value="">Select a service...</option>
                <option value="Photography Services">Photography Services</option>
                <option value="Videography Services">Videography Services</option>
                <option value="DJ Entertainment">DJ Entertainment</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-dj-name" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                DJ Name (Optional)
              </label>
              <input
                type="text"
                id="review-dj-name"
                name="review-dj-name"
                placeholder="Leave blank if not applicable"
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-rating" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Rating (1-5 stars)
              </label>
              <select
                id="review-rating"
                name="review-rating"
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
              >
                <option value="">Select rating...</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-comment" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Your Review *
              </label>
              <textarea
                id="review-comment"
                name="review-comment"
                required
                rows={5}
                placeholder="Share your experience with us..."
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <label htmlFor="review-event-date" style={{ marginBottom: '0.5rem', fontWeight: 500, color: 'var(--text-dark)' }}>
                Event Date (Optional)
              </label>
              <input
                type="date"
                id="review-event-date"
                name="review-event-date"
                style={{ padding: '0.75rem', border: '2px solid #e0e0e0', borderRadius: '5px', fontSize: '1rem', fontFamily: 'inherit' }}
              />
            </div>
            <div 
              id="review-message" 
              style={{ 
                display: message ? 'block' : 'none', 
                padding: '1rem', 
                borderRadius: '5px', 
                marginTop: '1rem',
                background: message?.type === 'success' ? '#d4edda' : message?.type === 'error' ? '#f8d7da' : 'transparent',
                color: message?.type === 'success' ? '#155724' : message?.type === 'error' ? '#721c24' : 'inherit',
                border: message?.type === 'success' ? '1px solid #c3e6cb' : message?.type === 'error' ? '1px solid #f5c6cb' : 'none'
              }}
            >
              {message?.text}
            </div>
            <button
              type="submit"
              disabled={submitting}
              style={{ 
                padding: '1rem 2rem', 
                background: 'var(--accent-color)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '5px', 
                fontSize: '1rem', 
                fontWeight: 'bold', 
                cursor: submitting ? 'not-allowed' : 'pointer', 
                transition: 'background 0.3s ease',
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', textAlign: 'center', marginTop: '0.5rem' }}>
              * Reviews are subject to approval before being published.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}


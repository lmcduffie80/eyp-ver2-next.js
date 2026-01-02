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
      clientName: formData.get('clientName') as string,
      serviceType: formData.get('serviceType') as string,
      djUsername: formData.get('djName') as string || null,
      rating: formData.get('rating') ? parseInt(formData.get('rating') as string) : null,
      comment: formData.get('comment') as string,
      eventDate: formData.get('eventDate') as string || null,
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
    <section id="submit-review" className="py-16 bg-bg-light">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-8 text-primary">Share Your Experience</h2>
        <p className="text-center text-text-light mb-8">
          We&apos;d love to hear about your experience with Externally Yours Productions!
        </p>
        <div className="max-w-[700px] mx-auto bg-white p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col">
              <label htmlFor="clientName" className="mb-2 font-medium text-text-dark">
                Your Name *
              </label>
              <input
                type="text"
                id="clientName"
                name="clientName"
                required
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="serviceType" className="mb-2 font-medium text-text-dark">
                Service Type *
              </label>
              <select
                id="serviceType"
                name="serviceType"
                required
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base"
              >
                <option value="">Select a service...</option>
                <option value="Photography Services">Photography Services</option>
                <option value="Videography Services">Videography Services</option>
                <option value="DJ Entertainment">DJ Entertainment</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="djName" className="mb-2 font-medium text-text-dark">
                DJ Name (Optional)
              </label>
              <input
                type="text"
                id="djName"
                name="djName"
                placeholder="Leave blank if not applicable"
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="rating" className="mb-2 font-medium text-text-dark">
                Rating (1-5 stars)
              </label>
              <select
                id="rating"
                name="rating"
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base"
              >
                <option value="">Select rating...</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="comment" className="mb-2 font-medium text-text-dark">
                Your Review *
              </label>
              <textarea
                id="comment"
                name="comment"
                required
                rows={5}
                placeholder="Share your experience with us..."
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base resize-y min-h-[150px]"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="eventDate" className="mb-2 font-medium text-text-dark">
                Event Date (Optional)
              </label>
              <input
                type="date"
                id="eventDate"
                name="eventDate"
                className="p-3 border-2 border-[#e0e0e0] rounded-md text-base"
              />
            </div>
            {message && (
              <div
                className={`p-4 rounded-md mt-4 ${
                  message.type === 'success'
                    ? 'bg-[#d4edda] text-[#155724] border border-[#c3e6cb]'
                    : 'bg-[#f8d7da] text-[#721c24] border border-[#f5c6cb]'
                }`}
              >
                {message.text}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-4 bg-accent text-white border-none rounded-md text-base font-bold cursor-pointer transition-colors hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
            <p className="text-sm text-text-light text-center mt-2">
              * Reviews are subject to approval before being published.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}


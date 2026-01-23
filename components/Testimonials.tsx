'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  text: string;
  service: string;
  date: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load approved reviews from API
    setLoading(true);
    fetch('/api/reviews?status=approved')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const reviews = data.data.map((review: any) => ({
            text: review.comment,
            service: review.service_type || 'Services',
            date: review.event_date 
              ? new Date(review.event_date).getFullYear().toString()
              : review.created_at 
                ? new Date(review.created_at).getFullYear().toString()
                : new Date().getFullYear().toString()
          }));
          setTestimonials(reviews);
        }
      })
      .catch((error) => {
        console.error('Error loading reviews:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <section id="testimonials" className="testimonials">
      <div className="container">
        <h2 className="section-title">What Our Clients Say</h2>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>Loading reviews...</p>
          </div>
        ) : testimonials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
            <p>No reviews available at this time.</p>
          </div>
        ) : (
          <div className="testimonials-grid" id="testimonials-container">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-content">
                  <p className="testimonial-text">&quot;{testimonial.text}&quot;</p>
                </div>
                <div className="testimonial-service">
                  <p className="testimonial-service-label">{testimonial.service}</p>
                  <p className="testimonial-date">{testimonial.date}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}


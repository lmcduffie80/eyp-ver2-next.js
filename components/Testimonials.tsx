'use client';

import { useEffect, useState } from 'react';

interface Testimonial {
  text: string;
  service: string;
  date: string;
}

export default function Testimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([
    {
      text: "The photography team captured our wedding day perfectly! Every moment was beautifully documented, and we now have stunning photos that we'll treasure forever. Their attention to detail and creative eye made our special day even more memorable.",
      service: "Photography Services",
      date: "2025"
    },
    {
      text: "Our wedding video exceeded all expectations! The team created a cinematic masterpiece that perfectly captured the emotion and joy of our celebration. Every time we watch it, we're transported back to that magical day. Absolutely incredible work!",
      service: "Videography Services",
      date: "2025"
    },
    {
      text: "The DJ brought incredible energy to our wedding reception! The dance floor was packed all night, and the music selection was perfect. They kept the party going and made sure everyone had an amazing time. Highly professional and super fun!",
      service: "DJ Entertainment",
      date: "2025"
    },
    {
      text: "Professional, talented, and so easy to work with! The photographers made us feel comfortable throughout the entire session and delivered breathtaking photos. We couldn't be happier with the results and would definitely book them again.",
      service: "Photography Services",
      date: "2024"
    },
    {
      text: "The highlight film they created was absolutely stunning! It beautifully told our story and captured all the special moments. The quality is outstanding, and we love sharing it with family and friends. Worth every penny!",
      service: "Videography Services",
      date: "2024"
    },
    {
      text: "Best DJ we've ever worked with! They understood exactly what we wanted and kept the energy high all night. The sound quality was perfect, the music selection was spot-on, and they made our event unforgettable. Our guests are still talking about how great the music was!",
      service: "DJ Entertainment",
      date: "2024"
    }
  ]);

  useEffect(() => {
    // Load approved reviews from API
    fetch('/api/reviews?status=approved')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.length > 0) {
          const reviews = data.data.map((review: any) => ({
            text: review.comment,
            service: review.serviceType || 'Services',
            date: review.eventDate 
              ? new Date(review.eventDate).getFullYear().toString()
              : review.createdAt 
                ? new Date(review.createdAt).getFullYear().toString()
                : new Date().getFullYear().toString()
          }));
          setTestimonials(prev => [...prev, ...reviews]);
        }
      })
      .catch(() => {
        // Silently fail - hardcoded testimonials will still show
      });
  }, []);

  return (
    <section id="testimonials" className="py-20 bg-white">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-12 text-primary">What Our Clients Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="bg-bg-light p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <div className="mb-6">
                <p className="text-lg leading-relaxed text-text-light italic m-0">
                  &quot;{testimonial.text}&quot;
                </p>
              </div>
              <div className="border-t border-[#e0e0e0] pt-4">
                <p className="text-sm font-semibold text-primary m-0">{testimonial.service}</p>
                <p className="text-sm text-text-light mt-1">{testimonial.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


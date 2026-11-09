import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact & Book — Photography, Videography & DJ in Tifton, GA',
  description:
    'Check availability and book wedding or event photography, videography, and DJ services in Tifton and South Georgia. Call (229) 326-5408 or send us a message.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main>
      <Navigation />
      <section className="pt-[90px] pb-20">
        <div className="container">
          <h1 className="section-title">Contact Us</h1>
        </div>
      </section>
      <Contact />
      <Footer />
    </main>
  );
}


import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Contact from '@/components/ContactWrapper';

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


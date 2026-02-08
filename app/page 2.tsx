import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Testimonials from '@/components/Testimonials';
import ReviewForm from '@/components/ReviewForm';
import AvailableDates from '@/components/AvailableDates';
import Contact from '@/components/ContactWrapper';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Services />
      <Testimonials />
      <ReviewForm />
      <AvailableDates />
      <Contact />
      <Footer />
    </main>
  );
}


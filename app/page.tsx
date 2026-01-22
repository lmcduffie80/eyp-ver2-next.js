import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import Portfolio from '@/components/Portfolio';
import Videography from '@/components/Videography';
import Testimonials from '@/components/Testimonials';
import ReviewForm from '@/components/ReviewForm';
import AvailableDates from '@/components/AvailableDates';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Navigation />
      <Hero />
      <Services />
      <Portfolio />
      <Videography />
      <Testimonials />
      <ReviewForm />
      <AvailableDates />
      <Contact />
      <Footer />
    </main>
  );
}


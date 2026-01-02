import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <main>
      <Navigation />
      <section className="pt-[90px] pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <h1 className="text-4xl mb-8 text-primary">About Us</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-lg leading-relaxed text-text-light mb-4">
                Externally Yours Productions, LLC is a professional video and film production company 
                dedicated to capturing your most important moments with creativity, passion, and technical excellence.
              </p>
              <p className="text-lg leading-relaxed text-text-light mb-4">
                We specialize in wedding photography and videography, event coverage, corporate productions, 
                and DJ entertainment services. Our team brings years of experience and a commitment to 
                delivering exceptional results that exceed expectations.
              </p>
              <p className="text-lg leading-relaxed text-text-light">
                Based in Tifton, Georgia, we serve clients throughout the region, bringing professional 
                production services to every event we cover.
              </p>
            </div>
            <div className="w-full h-[400px] bg-bg-light rounded-lg shadow-[0_10px_30px_rgba(0,0,0,0.1)] flex items-center justify-center">
              <p className="text-text-light">About Image Placeholder</p>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}


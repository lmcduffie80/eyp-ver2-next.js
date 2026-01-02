import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export default function Videography() {
  return (
    <main>
      <Navigation />
      <section className="pt-[90px] pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <h1 className="text-4xl mb-12 text-primary text-center">Videography Services</h1>
          <div className="prose max-w-none">
            <p className="text-lg text-text-light mb-8">
              Our videography services capture your special moments with cinematic quality and creative storytelling.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
                <h3 className="text-2xl mb-4 text-primary">Basic Package</h3>
                <p className="text-text-light">Starting at $1,500</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
                <h3 className="text-2xl mb-4 text-primary">Standard Package</h3>
                <p className="text-text-light">Starting at $2,500</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)]">
                <h3 className="text-2xl mb-4 text-primary">Premium Package</h3>
                <p className="text-text-light">Starting at $4,000</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}


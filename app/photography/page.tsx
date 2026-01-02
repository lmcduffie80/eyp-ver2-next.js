import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';

export default function Photography() {
  const galleries = [
    {
      id: 'grace-dillon-gallery',
      title: 'Grace and Dillon Wedding',
      images: [
        '/Grace and Dillon Wedding/7L8A5365.jpg',
        '/Grace and Dillon Wedding/7L8A5634.jpg',
        '/Grace and Dillon Wedding/7L8A5712.jpg',
        '/Grace and Dillon Wedding/IMG_2274.jpg',
        '/Grace and Dillon Wedding/IMG_2400.jpg',
        '/Grace and Dillon Wedding/IMG_2497 (1).jpg',
        '/Grace and Dillon Wedding/IMG_2543.jpg',
      ]
    },
    {
      id: 'yazmine-josh-gallery',
      title: 'Yazmine and Josh Wedding',
      images: [
        '/Yazmine and Josh Wedding/IMG_3957.jpg',
        '/Yazmine and Josh Wedding/IMG_4058.jpg',
        '/Yazmine and Josh Wedding/IMG_4085.jpg',
        '/Yazmine and Josh Wedding/IMG_4116.jpg',
        '/Yazmine and Josh Wedding/IMG_4133.jpg',
        '/Yazmine and Josh Wedding/IMG_4205.jpg',
      ]
    },
    {
      id: 'prom-2025-gallery',
      title: 'Prom 2025',
      images: [
        '/Prom 2025/7L8A9552.jpg',
        '/Prom 2025/7L8A9613.jpg',
      ]
    },
    {
      id: 'amy-cody-gallery',
      title: 'Amy and Cody Hardy Wedding',
      images: [
        '/Amy and Cody Hardy Wedding/E72A0917.jpg',
        '/Amy and Cody Hardy Wedding/E72A0956.jpg',
        '/Amy and Cody Hardy Wedding/E72A0984.jpg',
      ]
    }
  ];

  return (
    <main>
      <Navigation />
      <section className="pt-[90px] pb-20">
        <div className="max-w-[1200px] mx-auto px-8">
          <h1 className="text-4xl mb-12 text-primary text-center">Photography Portfolio</h1>
          {galleries.map((gallery) => (
            <div key={gallery.id} id={gallery.id} className="mb-16 scroll-mt-20">
              <h2 className="text-3xl mb-8 text-primary">{gallery.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {gallery.images.map((img, idx) => (
                  <div key={idx} className="relative overflow-hidden rounded-lg aspect-video bg-primary">
                    <Image
                      src={img}
                      alt={`${gallery.title} - Image ${idx + 1}`}
                      fill
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  );
}


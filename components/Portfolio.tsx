import Link from 'next/link';
import Image from 'next/image';

export default function Portfolio() {
  const portfolioItems = [
    {
      href: '/photography#grace-dillon-gallery',
      src: '/Grace and Dillon Wedding/7L8A5634.jpg',
      alt: 'Grace and Dillon Wedding',
      title: 'Grace and Dillon Wedding'
    },
    {
      href: '/photography#grace-dillon-gallery',
      src: '/Grace and Dillon Wedding/IMG_2274.jpg',
      alt: 'Grace and Dillon Wedding',
      title: 'Grace and Dillon Wedding'
    },
    {
      href: '/photography#yazmine-josh-gallery',
      src: '/Yazmine and Josh Wedding/IMG_4085.jpg',
      alt: 'Yazmine and Josh Wedding',
      title: 'Yazmine and Josh Wedding'
    },
    {
      href: '/photography#yazmine-josh-gallery',
      src: '/Yazmine and Josh Wedding/IMG_4205.jpg',
      alt: 'Yazmine and Josh Wedding',
      title: 'Yazmine and Josh Wedding'
    },
    {
      href: '/photography#prom-2025-gallery',
      src: '/Prom 2025/7L8A9552.jpg',
      alt: 'Prom 2025',
      title: 'Prom 2025'
    },
    {
      href: '/photography#prom-2025-gallery',
      src: '/Prom 2025/7L8A9613.jpg',
      alt: 'Prom 2025',
      title: 'Prom 2025'
    },
    {
      href: '/photography#amy-cody-gallery',
      src: '/Amy and Cody Hardy Wedding/E72A0917.jpg',
      alt: 'Amy and Cody Hardy Wedding',
      title: 'Amy and Cody Hardy Wedding'
    },
    {
      href: '/photography#amy-cody-gallery',
      src: '/Amy and Cody Hardy Wedding/E72A0956.jpg',
      alt: 'Amy and Cody Hardy Wedding',
      title: 'Amy and Cody Hardy Wedding'
    },
    {
      href: '/photography#amy-cody-gallery',
      src: '/Amy and Cody Hardy Wedding/E72A0984.jpg',
      alt: 'Amy and Cody Hardy Wedding',
      title: 'Amy and Cody Hardy Wedding'
    }
  ];

  return (
    <section id="portfolio" className="py-20 bg-bg-light">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-12 text-primary">Our Work</h2>
        <div className="mb-16">
          <h3 className="text-3xl mb-8 text-primary font-semibold">Photography</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {portfolioItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                className="no-underline block"
              >
                <div className="relative overflow-hidden rounded-lg aspect-video bg-primary cursor-pointer group">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-[rgba(26,26,26,0.8)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-white text-2xl">{item.title}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


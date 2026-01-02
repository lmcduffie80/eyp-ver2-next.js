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
    <section id="portfolio" className="portfolio">
      <div className="container">
        <h2 className="section-title">Our Work</h2>
        <div className="portfolio-category">
          <h3 className="portfolio-category-title">Photography</h3>
          <div className="portfolio-grid">
            {portfolioItems.map((item, index) => (
              <Link 
                key={index}
                href={item.href}
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="portfolio-item">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="portfolio-overlay">
                    <h3>{item.title}</h3>
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


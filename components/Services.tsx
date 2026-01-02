export default function Services() {
  const services = [
    {
      icon: '🎥',
      title: 'Videography',
      description: 'Professional videography services for events, weddings, corporate productions, and special occasions. We capture your moments with cinematic quality and creative storytelling.'
    },
    {
      icon: '📸',
      title: 'Photography',
      description: 'High-quality photography services including wedding photography, events, portraits, products, and commercial shoots. We capture the moments that matter with artistic vision and technical excellence.'
    },
    {
      icon: '🎧',
      title: 'DJ Entertainment',
      description: 'High-energy, professional DJ services for weddings, parties, corporate events, and celebrations. Our DJs bring positive energy and vibrant vibes to your party with professional equipment and seamless mixing.'
    }
  ];

  return (
    <section id="services" className="py-20">
      <div className="max-w-[1200px] mx-auto px-8">
        <h2 className="text-center text-4xl mb-12 text-primary">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-lg shadow-[0_5px_15px_rgba(0,0,0,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.15)]"
            >
              <div className="text-5xl mb-4">{service.icon}</div>
              <h3 className="text-2xl mb-4 text-primary">{service.title}</h3>
              <p className="text-text-light">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


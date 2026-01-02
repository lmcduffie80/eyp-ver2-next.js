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
    <section id="services">
      <div className="container">
        <h2 className="section-title">Our Services</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={index} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


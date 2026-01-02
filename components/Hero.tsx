import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      id="home" 
      className="hero"
      style={{
        background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Grace and Dillon Wedding/7L8A5712.jpg') center/cover"
      }}
    >
      <div className="hero-content">
        <h1>Externally Yours Productions, LLC</h1>
        <p>Creating compelling visual stories and DJ entertainment that captivate audiences</p>
        <Link href="#contact" className="cta-button">Get In Touch</Link>
      </div>
    </section>
  );
}


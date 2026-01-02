import Link from 'next/link';

export default function Hero() {
  return (
    <section 
      id="home" 
      className="h-screen flex items-center justify-center text-center text-white mt-[70px] bg-cover bg-center"
      style={{
        background: "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/Grace and Dillon Wedding/7L8A5712.jpg') center/cover"
      }}
    >
      <div className="hero-content">
        <h1 className="text-7xl font-bold mb-4 animate-[fadeInUp_1s_ease] text-shadow-[2px_2px_8px_rgba(0,0,0,0.5)] tracking-wide">
          Externally Yours Productions, LLC
        </h1>
        <p className="text-2xl mb-8 animate-[fadeInUp_1s_ease_0.2s_both]">
          Creating compelling visual stories and DJ entertainment that captivate audiences
        </p>
        <Link 
          href="#contact" 
          className="inline-block px-10 py-4 bg-accent text-white no-underline rounded-md font-bold transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_5px_20px_rgba(255,107,53,0.4)] animate-[fadeInUp_1s_ease_0.4s_both]"
        >
          Get In Touch
        </Link>
      </div>
    </section>
  );
}


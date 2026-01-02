'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navBackground, setNavBackground] = useState('rgba(26, 26, 26, 0.95)');

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setNavBackground('rgba(26, 26, 26, 0.98)');
      } else {
        setNavBackground('rgba(26, 26, 26, 0.95)');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav 
      style={{ 
        background: navBackground
      }}
    >
      <div className="container">
        <Link href="/" className="logo">
          <Image
            src="/EYP Logo_New.png"
            alt="Externally Yours Productions, LLC"
            width={400}
            height={80}
            style={{ height: '80px', width: 'auto', maxWidth: '400px' }}
            priority
            loading="eager"
            decoding="async"
          />
        </Link>
        <ul className={`hidden md:flex list-none gap-8 ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link href="/" className="text-white no-underline font-medium transition-colors hover:text-accent">Home</Link></li>
          <li><Link href="/about" className="text-white no-underline font-medium transition-colors hover:text-accent">About</Link></li>
          <li><Link href="/photography" className="text-white no-underline font-medium transition-colors hover:text-accent">Photography</Link></li>
          <li><Link href="/videography" className="text-white no-underline font-medium transition-colors hover:text-accent">Videography</Link></li>
          <li><Link href="/dj-entertainment" className="text-white no-underline font-medium transition-colors hover:text-accent">DJ Entertainment</Link></li>
          <li><Link href="#contact" className="text-white no-underline font-medium transition-colors hover:text-accent">Contact</Link></li>
        </ul>
        <button
          className="md:hidden bg-transparent border-none text-white text-3xl cursor-pointer p-2 z-[1001]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        {mobileMenuOpen && (
          <ul className="md:hidden flex flex-col fixed top-[70px] left-0 right-0 w-full bg-[rgba(26,26,26,0.98)] backdrop-blur-[10px] p-4 gap-0 shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-[1001] max-h-[calc(100vh-70px)] overflow-y-auto animate-[slideDown_0.3s_ease]">
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/about" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/photography" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>Photography</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/videography" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>Videography</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/dj-entertainment" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>DJ Entertainment</Link>
            </li>
            <li className="w-full">
              <Link href="#contact" className="block p-4 w-full text-white" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}


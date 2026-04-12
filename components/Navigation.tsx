'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navBackground, setNavBackground] = useState('rgba(26, 26, 26, 0.95)');
  const pathname = usePathname();

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

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // If already on home page, scroll to top instead of navigating
    if (pathname === '/') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <nav 
      style={{ 
        background: navBackground
      }}
    >
      <div className="container">
        <Link href="/" className="logo" onClick={handleHomeClick}
          style={{ background: 'white', borderRadius: '8px', padding: '8px 16px', display: 'inline-flex', alignItems: 'center' }}>
          <Image
            src="/EYP Logo_New.png"
            alt="Externally Yours Productions, LLC"
            width={507}
            height={135}
            style={{ height: '90px', width: 'auto', maxWidth: '340px', aspectRatio: 'auto', display: 'block' }}
            priority
            loading="eager"
            decoding="async"
          />
        </Link>
        <ul className={`hidden md:flex list-none gap-8 ${mobileMenuOpen ? 'mobile-open' : ''}`}>
          <li><Link href="/" className="text-white no-underline font-medium transition-colors hover:text-accent" onClick={handleHomeClick}>Home</Link></li>
          <li><Link href="/about" className="text-white no-underline font-medium transition-colors hover:text-accent">About</Link></li>
          <li><Link href="/photography" className="text-white no-underline font-medium transition-colors hover:text-accent">Photography</Link></li>
          <li><Link href="/videography" className="text-white no-underline font-medium transition-colors hover:text-accent">Videography</Link></li>
          <li><Link href="/dj-entertainment" className="text-white no-underline font-medium transition-colors hover:text-accent">DJ Entertainment</Link></li>
          <li><Link href="#contact" className="text-white no-underline font-medium transition-colors hover:text-accent">Contact</Link></li>
          <li><Link href="/dj-dashboard" target="_blank" rel="noopener noreferrer" className="text-white no-underline font-medium transition-colors hover:text-accent">DJ Portal</Link></li>
        </ul>
        <button
          className="md:hidden bg-transparent border-none text-white text-3xl cursor-pointer p-2 z-[1001]"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          ☰
        </button>
        {mobileMenuOpen && (
          <ul className="md:hidden flex flex-col fixed top-[70px] left-0 right-0 w-full bg-[rgba(26,26,26,0.98)] backdrop-blur-[10px] p-0 gap-0 shadow-[0_5px_15px_rgba(0,0,0,0.3)] z-[1001] max-h-[calc(100vh-70px)] overflow-y-auto animate-[slideDown_0.3s_ease]">
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link 
                href="/" 
                className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" 
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  handleHomeClick(e);
                }}
              >
                Home
              </Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/about" className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => setMobileMenuOpen(false)}>About</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/photography" className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => setMobileMenuOpen(false)}>Photography</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/videography" className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => setMobileMenuOpen(false)}>Videography</Link>
            </li>
            <li className="w-full border-b border-[rgba(255,255,255,0.1)]">
              <Link href="/dj-entertainment" className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => setMobileMenuOpen(false)}>DJ Entertainment</Link>
            </li>
            <li className="w-full">
              <Link href="#contact" className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" onClick={() => setMobileMenuOpen(false)}>Contact</Link>
            </li>
            <li className="w-full">
              <Link 
                href="/dj-dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="block py-6 px-6 w-full text-white text-lg font-semibold transition-colors active:bg-[rgba(255,107,53,0.2)] hover:bg-[rgba(255,255,255,0.05)]" 
                onClick={() => setMobileMenuOpen(false)}
              >
                DJ Portal
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}


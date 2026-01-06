'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.offsetTop;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`} suppressHydrationWarning>
        <div className="nav-container">
          <div className="nav-logo">
            <Image 
              src="/images/logo.png" 
              alt="Yumna Villa Dieng Logo" 
              width={50} 
              height={50}
              style={{ height: 'auto' }}
              priority
            />
            <h2>Yumna Villa Dieng</h2>
          </div>
          <ul className={`nav-menu ${isMenuOpen ? 'active' : ''}`}>
            <li className="nav-item">
              <button onClick={() => scrollToSection('home')} className="nav-link" suppressHydrationWarning>
                Beranda
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => scrollToSection('about')} className="nav-link" suppressHydrationWarning>
                Tentang
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => scrollToSection('rooms')} className="nav-link" suppressHydrationWarning>
                Kamar
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => scrollToSection('facilities')} className="nav-link" suppressHydrationWarning>
                Fasilitas
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => scrollToSection('gallery')} className="nav-link" suppressHydrationWarning>
                Galeri
              </button>
            </li>
            <li className="nav-item">
              <button onClick={() => scrollToSection('contact')} className="nav-link" suppressHydrationWarning>
                Kontak
              </button>
            </li>
          </ul>
          <div 
            className={`nav-toggle ${isMenuOpen ? 'active' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </div>
        </div>
      </nav>
      
      {/* Mobile Sticky Booking Button */}
      <div className="mobile-booking-sticky">
        <button 
          className="mobile-booking-btn"
          onClick={() => scrollToSection('rooms')}
          suppressHydrationWarning
        >
          <i className="fas fa-calendar-alt"></i> Book Now
        </button>
      </div>
    </>
  );
}

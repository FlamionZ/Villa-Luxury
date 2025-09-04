'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function About() {
  const statRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const animateCounter = (element: HTMLElement, target: number, duration = 2000) => {
      let start = 0;
      const increment = target / (duration / 16);
      
      function updateCounter() {
        start += increment;
        if (start < target) {
          element.textContent = Math.floor(start) + '+';
          requestAnimationFrame(updateCounter);
        } else {
          element.textContent = target + '+';
        }
      }
      
      updateCounter();
    };

    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const stat = entry.target as HTMLElement;
          const target = parseInt(stat.textContent || '0');
          if (!stat.classList.contains('animated')) {
            stat.classList.add('animated');
            animateCounter(stat, target);
          }
        }
      });
    }, { threshold: 0.5 });

    statRefs.current.forEach(ref => {
      if (ref) statsObserver.observe(ref);
    });

    return () => {
      const currentRefs = statRefs.current;
      currentRefs.forEach(ref => {
        if (ref) statsObserver.unobserve(ref);
      });
    };
  }, []);

  return (
    <section id="about" className="about">
      <div className="container">
        <div className="about-grid">
          <div className="about-image">
            <Image 
              src="/images/villa2.jpg" 
              alt="Villa Dieng Luxury"
              width={1000}
              height={500}
            />
            <div className="about-stats">
              <div className="stat">
                <h3 ref={el => { statRefs.current[0] = el; }}>15</h3>
                <p>Tahun Pengalaman</p>
              </div>
              <div className="stat">
                <h3 ref={el => { statRefs.current[1] = el; }}>500</h3>
                <p>Tamu Puas</p>
              </div>
            </div>
          </div>
          <div className="about-content">
            <div className="section-header">
              <span className="section-subtitle">Tentang Kami</span>
              <h2 className="section-title">Villa Dieng Luxury: Surga Tersembunyi di Dieng</h2>
            </div>
            <p className="about-description">
              Villa Dieng Luxury adalah destinasi mewah yang terletak di jantung Dieng, menawarkan pengalaman menginap yang tak terlupakan. Dengan arsitektur modern yang memadukan sentuhan tradisional Jawa, kami memberikan kenyamanan terbaik untuk liburan Anda.
            </p>
            <div className="about-features">
              <div className="feature">
                <i className="fas fa-swimming-pool"></i>
                <div>
                  <h4>Private Pool</h4>
                  <p>Kolam renang pribadi untuk setiap villa</p>
                </div>
              </div>
              <div className="feature">
                <i className="fas fa-spa"></i>
                <div>
                  <h4>Spa & Wellness</h4>
                  <p>Layanan spa profesional untuk relaksasi</p>
                </div>
              </div>
              <div className="feature">
                <i className="fas fa-concierge-bell"></i>
                <div>
                  <h4>24/7 Service</h4>
                  <p>Pelayanan terbaik sepanjang waktu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

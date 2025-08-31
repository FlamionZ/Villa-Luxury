'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000);
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateEmail(email)) {
      showNotification('Terima kasih telah berlangganan newsletter kami!', 'success');
      setEmail('');
    } else {
      showNotification('Mohon masukkan email yang valid.', 'error');
    }
  };

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
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-logo">
              <Image 
                src="/images/Logomark_coklat-01.png" 
                alt="Villa Dieng Luxury Logo" 
                width={60} 
                height={60}
                style={{ height: 'auto' }}
              />
              <h3>Villa Dieng Luxury</h3>
            </div>
            <p>Pengalaman villa mewah yang tak terlupakan di Dieng. Nikmati kemewahan dan kenyamanan di destinasi impian Anda.</p>
            <div className="social-links">
              <a href="#"><i className="fab fa-facebook"></i></a>
              <a href="#"><i className="fab fa-instagram"></i></a>
              <a href="#"><i className="fab fa-twitter"></i></a>
              <a href="#"><i className="fab fa-youtube"></i></a>
            </div>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><button onClick={() => scrollToSection('home')} suppressHydrationWarning>Beranda</button></li>
              <li><button onClick={() => scrollToSection('about')} suppressHydrationWarning>Tentang</button></li>
              <li><button onClick={() => scrollToSection('rooms')} suppressHydrationWarning>Kamar</button></li>
              <li><button onClick={() => scrollToSection('facilities')} suppressHydrationWarning>Fasilitas</button></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Layanan</h4>
            <ul>
              <li><a href="#">Reservasi</a></li>
              <li><a href="#">Spa & Wellness</a></li>
              <li><a href="#">Airport Transfer</a></li>
              <li><a href="#">Event Planning</a></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Newsletter</h4>
            <p>Dapatkan penawaran khusus dan update terbaru dari kami.</p>
            <form className="newsletter" onSubmit={handleNewsletterSubmit} suppressHydrationWarning>
              <input 
                type="email" 
                placeholder="Email Anda"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
              />
              <button type="submit" suppressHydrationWarning>Subscribe</button>
            </form>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2025 Villa Dieng Luxury. All rights reserved.</p>
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>

      {/* Newsletter Notification */}
      {notification && (
        <div 
          className="notification"
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: notification.type === 'success' ? '#27ae60' : '#e74c3c',
            color: 'white',
            padding: '15px 20px',
            borderRadius: '10px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
            zIndex: 10000,
            maxWidth: '400px',
            transform: 'translateX(0)',
            transition: 'transform 0.3s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px' }}>
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0,
                width: '25px',
                height: '25px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </footer>
  );
}

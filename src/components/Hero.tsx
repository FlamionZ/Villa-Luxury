'use client';

export default function Hero() {
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
    <section id="home" className="hero">
      <div className="hero-content">
        <h1 className="hero-title">Pengalaman Villa Mewah yang Tak Terlupakan</h1>
        <p className="hero-subtitle">Nikmati kemewahan dan kenyamanan di villa eksklusif kami dengan pemandangan yang menakjubkan</p>
        <div className="hero-buttons">
          <button onClick={() => scrollToSection('rooms')} className="btn btn-primary" suppressHydrationWarning>
            Lihat Kamar
          </button>
          <button onClick={() => scrollToSection('contact')} className="btn btn-secondary" suppressHydrationWarning>
            Hubungi Kami
          </button>
        </div>
      </div>
      <div className="hero-scroll">
        <div className="scroll-indicator">
          <span>Scroll</span>
          <div className="scroll-line"></div>
        </div>
      </div>
    </section>
  );
}

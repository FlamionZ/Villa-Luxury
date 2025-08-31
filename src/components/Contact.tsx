'use client';

export default function Contact() {

  return (
    <section id="contact" className="contact">
      <div className="container">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="section-header">
              <span className="section-subtitle">Kontak Kami</span>
              <h2 className="section-title">Hubungi Villa Dieng Luxury</h2>
            </div>
            <p>Siap untuk merasakan pengalaman villa mewah yang tak terlupakan? Hubungi kami sekarang untuk reservasi atau informasi lebih lanjut.</p>
            <div className="contact-items">
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-map-marker-alt"></i>
                </div>
                <div>
                  <h4>Alamat</h4>
                  <p>Jl. Gunung Indah No. 123<br/>Dieng, Wonosobo 80361</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-phone"></i>
                </div>
                <div>
                  <h4>Telepon</h4>
                  <p>+62 361 123 4567<br/>+62 812 3456 7890</p>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <i className="fas fa-envelope"></i>
                </div>
                <div>
                  <h4>Email</h4>
                  <p>info@villaluxury.com<br/>reservation@villaluxury.com</p>
                </div>
              </div>
            </div>
          </div>
          <div className="contact-form">
            <div className="contact-cta">
              <h3>Hubungi Kami Langsung</h3>
              <p>Untuk reservasi dan informasi lebih lanjut, silakan hubungi kami melalui:</p>
              
              <div className="contact-buttons">
                <a 
                  href="https://wa.me/6281234567890?text=Halo,%20saya%20tertarik%20untuk%20reservasi%20villa"
                  className="btn btn-whatsapp"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fab fa-whatsapp"></i>
                  WhatsApp
                </a>
                
                <a 
                  href="tel:+6281234567890"
                  className="btn btn-phone"
                >
                  <i className="fas fa-phone"></i>
                  Telepon
                </a>
                
                <a 
                  href="mailto:info@villaluxury.com"
                  className="btn btn-email"
                >
                  <i className="fas fa-envelope"></i>
                  Email
                </a>
              </div>
              
              <div className="operating-hours">
                <h4>Jam Operasional</h4>
                <p>Senin - Minggu: 08:00 - 22:00 WIB</p>
                <p>Respon cepat melalui WhatsApp 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

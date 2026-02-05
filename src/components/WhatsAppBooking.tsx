'use client';

export default function WhatsAppBooking() {
  const handleDirectWhatsApp = () => {
    // Default message for direct WhatsApp access
    const defaultMessage = `🏖️ *YUMNA VILLA DIENG - BOOKING INQUIRY*

  Halo! Saya tertarik untuk booking villa di Yumna Villa Dieng.

Mohon informasi mengenai:
• Ketersediaan villa
• Harga terbaru
• Fasilitas yang tersedia
• Promo yang sedang berlangsung

Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/622136296229?text=${encodeURIComponent(defaultMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      <button 
        className="whatsapp-float-btn"
        onClick={handleDirectWhatsApp}
        title="Chat via WhatsApp"
        suppressHydrationWarning
      >
        <i className="fab fa-whatsapp"></i>
        <span className="whatsapp-text">Chat Now</span>
      </button>
    </>
  );
}

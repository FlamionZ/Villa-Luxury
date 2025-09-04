'use client';

interface WhatsAppButtonProps {
  villaName?: string;
  guestCount?: number;
}

export default function WhatsAppBooking({ villaName = 'Villa Dieng Luxury', guestCount = 2 }: WhatsAppButtonProps) {
  const handleDirectWhatsApp = () => {
    // Default message for direct WhatsApp access
    const defaultMessage = `🏖️ *VILLA DIENG LUXURY - BOOKING INQUIRY*

Halo! Saya tertarik untuk booking villa di Villa Dieng Luxury.

Mohon informasi mengenai:
• Ketersediaan villa
• Harga terbaru
• Fasilitas yang tersedia
• Promo yang sedang berlangsung

Terima kasih! 🙏`;

    const whatsappUrl = `https://wa.me/+6282234898455?text=${encodeURIComponent(defaultMessage)}`;
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

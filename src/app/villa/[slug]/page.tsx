'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BookingCalendar from '@/components/BookingCalendar';
import { formatRupiahNumber } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface VillaData {
  id: number;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  images: string[];
  amenities: Array<{icon: string, text: string}>;
  features: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  size: string;
  status: string;
}

export default function VillaDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [villa, setVilla] = useState<VillaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedCheckIn, setSelectedCheckIn] = useState('');
  const [selectedCheckOut, setSelectedCheckOut] = useState('');

  // Fetch villa data from API
  useEffect(() => {
    const fetchVilla = async () => {
      try {
        const response = await fetch(`/api/villas/${slug}`);
        const data = await response.json();
        
        if (data.success) {
          setVilla(data.data);
        } else {
          setError(data.message || 'Villa tidak ditemukan');
        }
      } catch (error) {
        console.error('Error fetching villa:', error);
        setError('Terjadi kesalahan saat mengambil data villa');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchVilla();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold text-gray-700">Memuat detail villa...</h2>
        </div>
      </div>
    );
  }

  if (error || !villa) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Villa Tidak Ditemukan</h1>
          <p className="text-gray-600 mb-8">{error || 'Maaf, villa yang Anda cari tidak tersedia.'}</p>
          <Link href="/" className="btn btn-primary">Kembali ke Beranda</Link>
        </div>
      </div>
    );
  }

  const handleBookNow = () => {
    const message = `Halo, saya tertarik untuk memesan ${villa.title} dengan harga Rp ${formatRupiahNumber(villa.price)}/malam. Bisakah Anda memberikan informasi lebih lanjut?`;
    const whatsappUrl = `https://wa.me/6281234567890?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="villa-detail-page">
      {/* Header Section */}
      <div className="villa-detail-header">
        <div className="container">
          <div className="villa-detail-breadcrumb">
            <Link href="/">Beranda</Link>
            <span>/</span>
            <Link href="/#rooms">Villa</Link>
            <span>/</span>
            <span>{villa.title}</span>
          </div>
          
          <div className="villa-detail-title-section">
            <div className="villa-detail-title-content">
              <h1 className="villa-detail-title">{villa.title}</h1>
              <p className="villa-detail-subtitle">{villa.description}</p>
              <div className="villa-detail-quick-info">
                <span><i className="fas fa-map-marker-alt"></i> {villa.location || 'Lokasi tidak tersedia'}</span>
                <span><i className="fas fa-users"></i> Maks {villa.maxGuests || 2} Tamu</span>
              </div>
            </div>
            <div className="villa-detail-price-section">
              <div className="villa-detail-price">
                <span className="price-amount">Rp {formatRupiahNumber(villa.price)}</span>
                <span className="price-period">/malam</span>
              </div>
              <button className="btn btn-primary" onClick={handleBookNow}>
                <i className="fab fa-whatsapp"></i>
                Pesan Sekarang
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="villa-detail-gallery">
        <div className="container">
          <div className="gallery-main">
            <div className="gallery-main-image">
              <Image
                src={villa.images && villa.images[selectedImage] ? villa.images[selectedImage] : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                alt={villa.title || 'Villa'}
                width={800}
                height={500}
                className="main-image"
              />
            </div>
            <div className="gallery-thumbnails">
              {villa.images && villa.images.length > 0 ? villa.images.map((image, index) => (
                <div
                  key={index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <Image
                    src={image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'}
                    alt={`${villa.title || 'Villa'} ${index + 1}`}
                    width={150}
                    height={100}
                  />
                </div>
              )) : (
                <div className="no-images">Tidak ada gambar tersedia</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="villa-detail-content">
        <div className="container">
          <div className="villa-detail-grid">
            <div className="villa-detail-main">
              {/* Description */}
              <div className="villa-detail-section">
                <h2>Tentang Villa</h2>
                <p>{villa.longDescription}</p>
              </div>

              {/* Amenities */}
              <div className="villa-detail-section">
                <h2>Fasilitas Utama</h2>
                <div className="amenities-grid">
                  {villa.amenities && villa.amenities.length > 0 ? (
                    villa.amenities.map((amenity, index) => (
                      <div key={index} className="amenity-item">
                        <i className={amenity.icon || 'fas fa-star'}></i>
                        <span>{amenity.text}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="amenity-item">
                        <i className="fas fa-bed"></i>
                        <span>{villa.bedrooms || 2} Kamar Tidur</span>
                      </div>
                      <div className="amenity-item">
                        <i className="fas fa-bath"></i>
                        <span>{villa.bathrooms || 2} Kamar Mandi</span>
                      </div>
                      <div className="amenity-item">
                        <i className="fas fa-users"></i>
                        <span>Max {villa.maxGuests || 4} Tamu</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Features */}
              <div className="villa-detail-section">
                <h2>Fitur & Layanan</h2>
                <div className="features-list">
                  {villa.features && villa.features.length > 0 ? (
                    villa.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <i className="fas fa-check"></i>
                        <span>{feature}</span>
                      </div>
                    ))
                  ) : (
                    <div className="feature-item">
                      <i className="fas fa-info-circle"></i>
                      <span>Informasi fitur akan segera tersedia</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Calendar */}
              <div className="villa-detail-section">
                <h2>Ketersediaan & Pemesanan</h2>
                <div className="villa-calendar-container">
                  <BookingCalendar 
                    selectedVilla={villa.title}
                    onDateSelect={(date: string) => {
                      if (!selectedCheckIn) {
                        setSelectedCheckIn(date);
                      } else if (!selectedCheckOut) {
                        setSelectedCheckOut(date);
                      } else {
                        setSelectedCheckIn(date);
                        setSelectedCheckOut('');
                      }
                    }}
                    selectedCheckIn={selectedCheckIn}
                    selectedCheckOut={selectedCheckOut}
                  />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="villa-detail-sidebar">
              <div className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-price">
                    <span className="price-amount">Rp {formatRupiahNumber(villa.price)}</span>
                    <span className="price-period">/malam</span>
                  </div>
                </div>
                
                <div className="booking-card-content">
                  <div className="villa-info-quick">
                    <div className="info-item">
                      <i className="fas fa-bed"></i>
                      <span>{villa.bedrooms || 2} Kamar Tidur</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-bath"></i>
                      <span>{villa.bathrooms || 2} Kamar Mandi</span>
                    </div>
                    <div className="info-item">
                      <i className="fas fa-users"></i>
                      <span>Maks {villa.maxGuests || 4} Tamu</span>
                    </div>
                  </div>
                  
                  <button className="btn btn-primary btn-full" onClick={handleBookNow}>
                    <i className="fab fa-whatsapp"></i>
                    Pesan via WhatsApp
                  </button>
                  
                  <div className="booking-note">
                    <p><i className="fas fa-info-circle"></i> Gratis pembatalan hingga 24 jam sebelum check-in</p>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="contact-card">
                <h3>Butuh Bantuan?</h3>
                <div className="contact-methods">
                  <a href="tel:+6281234567890" className="contact-method">
                    <i className="fas fa-phone"></i>
                    <span>+62 812-3456-7890</span>
                  </a>
                  <a href="mailto:info@villaparadise.com" className="contact-method">
                    <i className="fas fa-envelope"></i>
                    <span>info@villaparadise.com</span>
                  </a>
                  <a href="https://wa.me/6281234567890" className="contact-method" target="_blank">
                    <i className="fab fa-whatsapp"></i>
                    <span>WhatsApp Chat</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

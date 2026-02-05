'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import BookingCalendar from '@/components/BookingCalendar';
import { formatRupiahNumber } from '@/lib/utils';
import { getPriceRange, getUpcomingHighSeasonDates } from '@/lib/pricing';
import { useState, useEffect } from 'react';

interface VillaData {
  id: number;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  price: number;
  weekday_price?: number;
  weekend_price?: number;
  high_season_price?: number;
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
          // Add test pricing data if not available
          const villaData = {
            ...data.data,
            weekday_price: data.data.weekday_price || 2500000,
            weekend_price: data.data.weekend_price || 3000000,
            high_season_price: data.data.high_season_price || 3750000
          };
          
          setVilla(villaData);
          console.log("Villa data loaded:", villaData);
          console.log("Has pricing data:", {
            weekday: villaData.weekday_price,
            weekend: villaData.weekend_price,
            high_season: villaData.high_season_price
          });
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
    const whatsappUrl = `https://wa.me/622136296229?text=${encodeURIComponent(message)}`;
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
                    villaPricing={villa.weekday_price && villa.weekend_price && villa.high_season_price ? {
                      weekday_price: villa.weekday_price,
                      weekend_price: villa.weekend_price,
                      high_season_price: villa.high_season_price
                    } : undefined}
                    showPricing={!!(villa.weekday_price && villa.weekend_price && villa.high_season_price)}
                  />
                </div>
                
                {/* Pricing Information */}
                {villa.weekday_price && villa.weekend_price && villa.high_season_price && (
                  <div className="pricing-info">
                    <h3>Informasi Harga</h3>
                    <div className="pricing-legend">
                      <div className="pricing-item">
                        <div className="price-indicator weekday"></div>
                        <div className="price-details">
                          <span className="price-category">Weekday (Sen-Jum)</span>
                          <span className="price-value">Rp {formatRupiahNumber(villa.weekday_price)}</span>
                        </div>
                      </div>
                      <div className="pricing-item">
                        <div className="price-indicator weekend"></div>
                        <div className="price-details">
                          <span className="price-category">Weekend (Sab-Min)</span>
                          <span className="price-value">Rp {formatRupiahNumber(villa.weekend_price)}</span>
                        </div>
                      </div>
                      <div className="pricing-item">
                        <div className="price-indicator high-season"></div>
                        <div className="price-details">
                          <span className="price-category">High Season</span>
                          <span className="price-value">Rp {formatRupiahNumber(villa.high_season_price)}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Upcoming High Season Dates */}
                    <div className="upcoming-high-season">
                      <h4>Tanggal High Season Mendatang</h4>
                      <div className="high-season-dates">
                        {getUpcomingHighSeasonDates(3).map((holiday, index) => (
                          <div key={index} className="holiday-item">
                            <i className="fas fa-calendar-star"></i>
                            <span>{holiday.name}</span>
                            <small>{new Date(holiday.date).toLocaleDateString('id-ID', { 
                              weekday: 'short', 
                              day: 'numeric', 
                              month: 'short' 
                            })}</small>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="villa-detail-sidebar">
              <div className="booking-card">
                <div className="booking-card-header">
                  <div className="booking-price">
                    {villa.weekday_price && villa.weekend_price && villa.high_season_price ? (
                      (() => {
                        const priceRange = getPriceRange({
                          weekday_price: villa.weekday_price,
                          weekend_price: villa.weekend_price,
                          high_season_price: villa.high_season_price
                        });
                        return (
                          <>
                            <span className="price-amount">
                              Rp {formatRupiahNumber(priceRange.min)} - {formatRupiahNumber(priceRange.max)}
                            </span>
                            <span className="price-period">/malam</span>
                            <div className="price-breakdown">
                              <small>
                                Weekday: Rp {formatRupiahNumber(villa.weekday_price)} • 
                                Weekend: Rp {formatRupiahNumber(villa.weekend_price)} • 
                                High Season: Rp {formatRupiahNumber(villa.high_season_price)}
                              </small>
                            </div>
                          </>
                        );
                      })()
                    ) : (
                      <>
                        <span className="price-amount">Rp {formatRupiahNumber(villa.price)}</span>
                        <span className="price-period">/malam</span>
                      </>
                    )}
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
                  <a href="tel:+622136296229" className="contact-method">
                    <i className="fas fa-phone"></i>
                    <span>+622136296229</span>
                  </a>
                  <a href="mailto:villadiengluxury@gmail.com" className="contact-method">
                    <i className="fas fa-envelope"></i>
                    <span>villadiengluxury@gmail.com</span>
                  </a>
                  <a href="https://wa.me/622136296229" className="contact-method" target="_blank">
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

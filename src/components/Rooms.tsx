'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import BookingCalendar from './BookingCalendar';
import { formatRupiahNumber } from '@/lib/utils';
import { getPriceRange } from '@/lib/pricing';

interface Villa {
  id: number;
  title: string;
  slug: string;
  description: string;
  price: number; // backward compatibility
  weekday_price?: number;
  weekend_price?: number;
  high_season_price?: number;
  image: string;
  amenities: Array<{icon: string, text: string}>;
  features: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  location: string;
  status: string;
}

const staticRooms: Villa[] = [
  {
    id: 1,
    title: "Deluxe Villa",
    slug: "deluxe-villa",
    price: 4500000,
    description: "Villa mewah dengan pemandangan taman tropis dan kolam renang pribadi.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: [
      { icon: "fas fa-bed", text: "2 Kamar Tidur" },
      { icon: "fas fa-bath", text: "2 Kamar Mandi" },
      { icon: "fas fa-swimming-pool", text: "Private Pool" }
    ],
    features: ["Private Pool", "Garden View", "24/7 Service"],
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 2,
    location: "Dieng Plateau",
    status: "active"
  },
  {
    id: 2,
    title: "Ocean View Villa",
    slug: "ocean-view-villa",
    price: 6900000,
    description: "Villa premium dengan pemandangan laut yang menakjubkan dan akses pantai pribadi.",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: [
      { icon: "fas fa-bed", text: "3 Kamar Tidur" },
      { icon: "fas fa-bath", text: "3 Kamar Mandi" },
      { icon: "fas fa-water", text: "Beach Access" }
    ],
    features: ["Ocean View", "Beach Access", "Butler Service"],
    maxGuests: 6,
    bedrooms: 3,
    bathrooms: 3,
    location: "Batur Highland",
    status: "active"
  },
  {
    id: 3,
    title: "Presidential Suite",
    slug: "presidential-suite",
    price: 12000000,
    description: "Suite mewah terluas dengan semua fasilitas premium dan butler pribadi.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    amenities: [
      { icon: "fas fa-bed", text: "4 Kamar Tidur" },
      { icon: "fas fa-bath", text: "4 Kamar Mandi" },
      { icon: "fas fa-user-tie", text: "Private Butler" }
    ],
    features: ["Butler Service", "Helicopter Pad", "Private Chef"],
    maxGuests: 8,
    bedrooms: 4,
    bathrooms: 4,
    location: "Sumberejo Valley",
    status: "active"
  }
];

export default function Rooms() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedDates] = useState<{checkIn: string, checkOut: string}>({checkIn: '', checkOut: ''});

  // Fetch villas from API
  useEffect(() => {
    const fetchVillas = async () => {
      try {
        const response = await fetch('/api/villas?status=active');
        const data = await response.json();
        
        if (data.success) {
          setVillas(data.data);
        } else {
          console.error('Failed to fetch villas:', data.message);
          // Fallback to static data if API fails
          setVillas(staticRooms);
        }
      } catch (error) {
        console.error('Error fetching villas:', error);
        // Fallback to static data if API fails
        setVillas(staticRooms);
      } finally {
        setLoading(false);
      }
    };

    fetchVillas();
  }, []);

  const handleDateSelect = (date: string) => {
    console.log('Selected date:', date);
  };

  const toggleRoomDetail = (roomId: number) => {
    setSelectedRoom(selectedRoom === roomId ? null : roomId);
  };

  return (
    <section id="rooms" className="rooms">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Kamar & Suite</span>
          <h2 className="section-title">Pilihan Akomodasi Eksklusif</h2>
          <p className="section-description">Setiap kamar dirancang dengan perhatian detail untuk memberikan kenyamanan maksimal</p>
        </div>
        <div className="rooms-grid">
          {loading ? (
            <div className="loading-message">Memuat villa...</div>
          ) : villas.length === 0 ? (
            <div className="no-villas-message">Belum ada villa yang tersedia</div>
          ) : (
            villas.map((villa) => (
            <div key={villa.id} className="room-card">
              <div className="room-image">
                <Image 
                  src={villa.image && villa.image.trim() !== '' ? villa.image : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                  alt={villa.title || 'Villa'}
                  width={800}
                  height={250}
                />
                <div className="room-price">
                  {villa.weekday_price && villa.weekend_price && villa.high_season_price ? (
                    (() => {
                      const priceRange = getPriceRange({
                        weekday_price: villa.weekday_price,
                        weekend_price: villa.weekend_price,
                        high_season_price: villa.high_season_price
                      });
                      return (
                        <>
                          <span className="price-range">Rp {formatRupiahNumber(priceRange.min)} - {formatRupiahNumber(priceRange.max)}</span>
                          <small className="price-note">/malam</small>
                        </>
                      );
                    })()
                  ) : (
                    <>Rp {formatRupiahNumber(villa.price || 0)}<small>/malam</small></>
                  )}
                </div>
              </div>
              <div className="room-content">
                <h3 className="room-title">{villa.title || 'Villa'}</h3>
                <p className="room-description">{villa.description || 'Deskripsi villa tidak tersedia'}</p>
                <div className="room-amenities">
                  {villa.amenities && villa.amenities.length > 0 ? (
                    villa.amenities.map((amenity: {icon: string, text: string}, index: number) => (
                      <span key={index}>
                        <i className={amenity.icon || 'fas fa-star'}></i> {amenity.text || 'Amenity'}
                      </span>
                    ))
                  ) : (
                    <>
                      <span><i className="fas fa-bed"></i> {villa.bedrooms || 2} Kamar Tidur</span>
                      <span><i className="fas fa-bath"></i> {villa.bathrooms || 2} Kamar Mandi</span>
                      <span><i className="fas fa-users"></i> Max {villa.maxGuests || 4} Tamu</span>
                    </>
                  )}
                </div>
                <div className="room-buttons">
                  <Link 
                    href={`/villa/${villa.slug}`}
                    className="btn btn-primary"
                  >
                    Lihat Detail
                  </Link>
                  <button 
                    className="btn btn-outline"
                    onClick={() => toggleRoomDetail(villa.id)}
                    suppressHydrationWarning
                  >
                    {selectedRoom === villa.id ? 'Tutup Kalender' : 'Cek Ketersediaan'}
                  </button>
                </div>
              </div>
              {selectedRoom === villa.id && (
                <div className="room-detail">
                  <div className="room-detail-content">
                    <h4>Pilih Tanggal Booking</h4>
                    <BookingCalendar 
                      villaId={villa.id}
                      onDateSelect={handleDateSelect}
                      selectedCheckIn={selectedDates.checkIn}
                      selectedCheckOut={selectedDates.checkOut}
                    />
                  </div>
                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}

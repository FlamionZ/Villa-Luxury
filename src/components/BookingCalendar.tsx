'use client';

import { useState, useEffect } from 'react';
import { formatRupiahNumber } from '@/lib/utils';
import { getPricingCategory } from '@/lib/pricing';

interface BookingDate {
  date: string;
  villaType: string;
  guestName: string;
}

interface VillaPricing {
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
}

interface CalendarProps {
  selectedVilla: string;
  onDateSelect: (date: string) => void;
  selectedCheckIn: string;
  selectedCheckOut: string;
  villaPricing?: VillaPricing;
  showPricing?: boolean;
}

export default function BookingCalendar({ 
  selectedVilla, 
  onDateSelect, 
  selectedCheckIn, 
  selectedCheckOut, 
  villaPricing, 
  showPricing = false 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookingDate[]>([]);
  const [isClient, setIsClient] = useState(false);

  // Debug logging
  console.log("BookingCalendar props:", {
    villaPricing,
    showPricing,
    selectedVilla
  });

  // Function to get price for a specific date
  const getPriceForDate = (date: Date): number => {
    if (!villaPricing) return 0;
    
    const category = getPricingCategory(date);
    switch (category) {
      case 'weekday':
        return villaPricing.weekday_price;
      case 'weekend':
        return villaPricing.weekend_price;
      case 'high_season':
        return villaPricing.high_season_price;
      default:
        return villaPricing.weekday_price;
    }
  };

  // Function to get price category class for styling
  const getPriceCategoryClass = (date: Date): string => {
    const category = getPricingCategory(date);
    switch (category) {
      case 'weekday':
        return 'price-weekday';
      case 'weekend':
        return 'price-weekend';
      case 'high_season':
        return 'price-high-season';
      default:
        return 'price-weekday';
    }
  };

  // Pastikan component hanya render di client untuk menghindari hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Simulasi data booking yang sudah ada
  useEffect(() => {
    const mockBookedDates: BookingDate[] = [
      // Agustus 2025
      { date: '2025-08-12', villaType: 'deluxe', guestName: 'Anna Williams' },
      { date: '2025-08-13', villaType: 'deluxe', guestName: 'Anna Williams' },
      { date: '2025-08-15', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-16', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-17', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-18', villaType: 'ocean', guestName: 'Robert Miller' },
      { date: '2025-08-19', villaType: 'ocean', guestName: 'Robert Miller' },
      { date: '2025-08-20', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-21', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-22', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-23', villaType: 'presidential', guestName: 'Lisa Garcia' },
      { date: '2025-08-24', villaType: 'presidential', guestName: 'Lisa Garcia' },
      { date: '2025-08-25', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-26', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-27', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-28', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-30', villaType: 'deluxe', guestName: 'Thomas Anderson' },
      { date: '2025-08-31', villaType: 'deluxe', guestName: 'Thomas Anderson' },
      
      // September 2025
      { date: '2025-09-01', villaType: 'deluxe', guestName: 'Thomas Anderson' },
      { date: '2025-09-06', villaType: 'deluxe', guestName: 'Emma Davis' },
      { date: '2025-09-12', villaType: 'ocean', guestName: 'David Wilson' },
      { date: '2025-09-13', villaType: 'ocean', guestName: 'David Wilson' },
      { date: '2025-09-14', villaType: 'ocean', guestName: 'David Wilson' },
    ];
    setBookedDates(mockBookedDates);
  }, []);

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const isDateBooked = (dateStr: string) => {
    // Map villa titles to villa types
    const villaTypeMap: { [key: string]: string } = {
      'Deluxe Villa': 'deluxe',
      'Ocean View Villa': 'ocean',
      'Presidential Suite': 'presidential'
    };
    
    const villaType = villaTypeMap[selectedVilla] || selectedVilla.toLowerCase();
    
    return bookedDates.some(booking => 
      booking.date === dateStr && 
      booking.villaType === villaType
    );
  };

  const isDateSelected = (dateStr: string) => {
    return dateStr === selectedCheckIn || dateStr === selectedCheckOut;
  };

  const isDateInRange = (dateStr: string) => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    const date = new Date(dateStr);
    const checkIn = new Date(selectedCheckIn);
    const checkOut = new Date(selectedCheckOut);
    return date >= checkIn && date <= checkOut;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Debug: Check selected villa and booked dates
    console.log('Selected Villa:', selectedVilla);
    console.log('Booked Dates:', bookedDates);

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDate(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isBooked = isDateBooked(dateStr);
      const isSelected = isDateSelected(dateStr);
      const isInRange = isDateInRange(dateStr);
      const isPast = new Date(dateStr) < new Date(new Date().toDateString());
      const currentDayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

      // Debug: Log booking status for specific dates
      if (day >= 12 && day <= 30) {
        console.log(`Date ${dateStr}: isBooked=${isBooked}, isPast=${isPast}`);
      }

      let className = 'calendar-day';
      if (isBooked) className += ' booked';
      if (isSelected) className += ' selected';
      if (isInRange) className += ' in-range';
      if (isPast) className += ' past';

      // Add price category class
      if (showPricing && villaPricing) {
        className += ` ${getPriceCategoryClass(currentDayDate)}`;
      }

      const dayPrice = showPricing && villaPricing ? getPriceForDate(currentDayDate) : 0;

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => !isBooked && !isPast && onDateSelect(dateStr)}
        >
          <div className="day-number">{day}</div>
          {isBooked && (
            <div className="booking-indicator">
              <i className="fas fa-lock"></i>
            </div>
          )}
          {showPricing && villaPricing && dayPrice > 0 && !isBooked && (
            <div className="day-price">
              {dayPrice >= 1000000 
                ? `${(dayPrice / 1000000).toFixed(1)}jt`
                : `${(dayPrice / 1000).toFixed(0)}k`
              }
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)));
  };

  const prevMonth = () => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    const today = new Date();
    if (newDate >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentDate(newDate);
    }
  };

  // Jika belum di client, tampilkan loading atau placeholder
  if (!isClient) {
    return (
      <section id="booking" className="booking-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-subtitle">Reservasi</span>
            <h2 className="section-title">Pilih Tanggal Menginap</h2>
            <p className="section-description">
              Cek ketersediaan villa dan pilih tanggal check-in & check-out yang diinginkan
            </p>
          </div>
          
          <div className="booking-calendar">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading kalender...
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="booking-section">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Reservasi</span>
          <h2 className="section-title">Pilih Tanggal Menginap</h2>
          <p className="section-description">
            Cek ketersediaan villa dan pilih tanggal check-in & check-out yang diinginkan
          </p>
        </div>
        
        <div className="booking-calendar" suppressHydrationWarning>
          <div className="calendar-header">
            <button 
              onClick={prevMonth}
              className="calendar-nav"
              disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
              suppressHydrationWarning
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={nextMonth} className="calendar-nav" suppressHydrationWarning>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="calendar-days-header">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-name">{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid" suppressHydrationWarning>
            {renderCalendar()}
          </div>
          
          <div className="calendar-legend">
            <div className="legend-item">
              <div className="legend-color available"></div>
              <span>Tersedia</span>
            </div>
            <div className="legend-item">
              <div className="legend-color booked"></div>
              <span>Sudah Dibooking</span>
            </div>
            <div className="legend-item">
              <div className="legend-color selected"></div>
              <span>Tanggal Dipilih</span>
            </div>
          </div>
          
          {/* Pricing Legend */}
          {showPricing && villaPricing && (
            <div className="pricing-legend-calendar">
              <h4>Kategori Harga</h4>
              <div className="pricing-categories">
                <div className="pricing-category-item weekday">
                  <div className="category-indicator"></div>
                  <div className="category-info">
                    <span className="category-name">Weekday (Sen-Jum)</span>
                    <span className="category-price">Rp {formatRupiahNumber(villaPricing.weekday_price)}</span>
                  </div>
                </div>
                <div className="pricing-category-item weekend">
                  <div className="category-indicator"></div>
                  <div className="category-info">
                    <span className="category-name">Weekend (Sab-Min)</span>
                    <span className="category-price">Rp {formatRupiahNumber(villaPricing.weekend_price)}</span>
                  </div>
                </div>
                <div className="pricing-category-item high-season">
                  <div className="category-indicator"></div>
                  <div className="category-info">
                    <span className="category-name">High Season (Libur)</span>
                    <span className="category-price">Rp {formatRupiahNumber(villaPricing.high_season_price)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

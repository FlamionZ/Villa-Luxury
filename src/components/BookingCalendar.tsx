'use client';

import { useState, useEffect, useMemo } from 'react';
import { formatRupiahNumber } from '@/lib/utils';
import { getPricingCategory } from '@/lib/pricing';

interface BookingRange {
  check_in_date: string;
  check_out_date: string;
  status: string;
}

interface VillaPricing {
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
}

interface CalendarProps {
  villaId: number;
  onDateSelect: (date: string) => void;
  selectedCheckIn: string;
  selectedCheckOut: string;
  villaPricing?: VillaPricing;
  showPricing?: boolean;
}

export default function BookingCalendar({ 
  villaId,
  onDateSelect, 
  selectedCheckIn, 
  selectedCheckOut, 
  villaPricing, 
  showPricing = false 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedRanges, setBookedRanges] = useState<BookingRange[]>([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const formatIsoDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const parseIsoDate = (dateStr: string) => {
    return new Date(`${dateStr}T12:00:00`);
  };

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

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setLoadingAvailability(true);
        const response = await fetch(`/api/bookings?villa_id=${villaId}`);
        const data = await response.json();
        if (data.success) {
          setBookedRanges(data.data || []);
        } else {
          setBookedRanges([]);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setBookedRanges([]);
      } finally {
        setLoadingAvailability(false);
      }
    };

    if (villaId) {
      fetchAvailability();
    }
  }, [villaId]);

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

  const bookedDateSet = useMemo(() => {
    const dates = new Set<string>();

    bookedRanges.forEach((range) => {
      if (!range.check_in_date || !range.check_out_date) return;
      const checkIn = parseIsoDate(range.check_in_date);
      const checkOut = parseIsoDate(range.check_out_date);
      if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return;

      const cursor = new Date(checkIn.getTime());
      while (cursor < checkOut) {
        dates.add(formatIsoDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return dates;
  }, [bookedRanges]);

  const isDateBooked = (dateStr: string) => {
    return bookedDateSet.has(dateStr);
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
    console.log('Booked Dates:', bookedDateSet.size);

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

          {loadingAvailability && (
            <div className="loading-message">Memuat ketersediaan...</div>
          )}
          
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

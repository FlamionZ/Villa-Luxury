'use client';

import { useState, useEffect } from 'react';

interface BookingDate {
  date: string;
  villaType: string;
  guestName: string;
}

interface CalendarProps {
  selectedVilla: string;
  onDateSelect: (date: string) => void;
  selectedCheckIn: string;
  selectedCheckOut: string;
}

export default function BookingCalendar({ selectedVilla, onDateSelect, selectedCheckIn, selectedCheckOut }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<BookingDate[]>([]);

  // Simulasi data booking yang sudah ada
  useEffect(() => {
    const mockBookedDates: BookingDate[] = [
      { date: '2025-08-15', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-16', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-17', villaType: 'deluxe', guestName: 'John Smith' },
      { date: '2025-08-20', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-21', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-22', villaType: 'ocean', guestName: 'Sarah Johnson' },
      { date: '2025-08-25', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-26', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-27', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-08-28', villaType: 'presidential', guestName: 'Michael Brown' },
      { date: '2025-09-05', villaType: 'deluxe', guestName: 'Emma Davis' },
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
    return bookedDates.some(booking => 
      booking.date === dateStr && 
      booking.villaType === selectedVilla
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

      let className = 'calendar-day';
      if (isBooked) className += ' booked';
      if (isSelected) className += ' selected';
      if (isInRange) className += ' in-range';
      if (isPast) className += ' past';

      days.push(
        <div
          key={day}
          className={className}
          onClick={() => !isBooked && !isPast && onDateSelect(dateStr)}
        >
          {day}
          {isBooked && (
            <div className="booking-indicator">
              <i className="fas fa-lock"></i>
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
          <div className="calendar-header">
            <button 
              onClick={prevMonth}
              className="calendar-nav"
              disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <h3>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <button onClick={nextMonth} className="calendar-nav">
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
          
          <div className="calendar-days-header">
            {dayNames.map(day => (
              <div key={day} className="calendar-day-name">{day}</div>
            ))}
          </div>
          
          <div className="calendar-grid">
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
        </div>
      </div>
    </section>
  );
}

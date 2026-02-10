'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatRupiahNumber } from '@/lib/utils';

interface Booking {
  id: number;
  villa_id: number;
  villa_title: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  extra_bed_count: number;
  extra_bed_price: number;
  extra_bed_total: number;
  total_nights: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_source: string;
  created_at: string;
}

interface VillaOption {
  id: number;
  title: string;
  status: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [villas, setVillas] = useState<VillaOption[]>([]);
  const [selectedVillaId, setSelectedVillaId] = useState('');
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [calendarBookings, setCalendarBookings] = useState<Booking[]>([]);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [calendarCheckIn, setCalendarCheckIn] = useState('');
  const [calendarCheckOut, setCalendarCheckOut] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      });

      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();

      if (data.success) {
        setBookings(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const fetchVillas = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/villas?status=active');
      const data = await response.json();
      if (data.success) {
        const activeVillas = data.data as VillaOption[];
        setVillas(activeVillas);
        if (!selectedVillaId && activeVillas.length > 0) {
          setSelectedVillaId(String(activeVillas[0].id));
        }
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
    }
  }, [selectedVillaId]);

  const fetchCalendarBookings = useCallback(async (villaId: string) => {
    if (!villaId) return;
    try {
      setCalendarLoading(true);
      const params = new URLSearchParams({
        page: '1',
        limit: '500',
        villa_id: villaId
      });
      const response = await fetch(`/api/admin/bookings?${params}`);
      const data = await response.json();
      if (data.success) {
        setCalendarBookings(data.data);
      } else {
        setCalendarBookings([]);
      }
    } catch (error) {
      console.error('Error fetching calendar bookings:', error);
      setCalendarBookings([]);
    } finally {
      setCalendarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVillas();
  }, [fetchVillas]);

  useEffect(() => {
    if (selectedVillaId) {
      fetchCalendarBookings(selectedVillaId);
      setCalendarCheckIn('');
      setCalendarCheckOut('');
    }
  }, [selectedVillaId, fetchCalendarBookings]);

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

  const formatIsoDate = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const parseDate = (dateStr: string) => {
    return new Date(`${dateStr}T12:00:00`);
  };

  const bookedDateSet = useMemo(() => {
    const bookedDates = new Set<string>();
    const blockingStatuses = new Set(['pending', 'confirmed']);

    calendarBookings.forEach((booking) => {
      if (!blockingStatuses.has(booking.status)) return;
      if (!booking.check_in || !booking.check_out) return;

      const checkInDate = parseDate(booking.check_in);
      const checkOutDate = parseDate(booking.check_out);
      if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) return;

      const cursor = new Date(checkInDate.getTime());
      while (cursor < checkOutDate) {
        bookedDates.add(formatIsoDate(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
    });

    return bookedDates;
  }, [calendarBookings]);

  const isDateSelected = (dateStr: string) => {
    return dateStr === calendarCheckIn || dateStr === calendarCheckOut;
  };

  const isDateInRange = (dateStr: string) => {
    if (!calendarCheckIn || !calendarCheckOut) return false;
    const date = parseDate(dateStr);
    const checkIn = parseDate(calendarCheckIn);
    const checkOut = parseDate(calendarCheckOut);
    return date > checkIn && date < checkOut;
  };

  const handleDateClick = (dateStr: string) => {
    if (!calendarCheckIn || (calendarCheckIn && calendarCheckOut)) {
      setCalendarCheckIn(dateStr);
      setCalendarCheckOut('');
      return;
    }

    if (dateStr < calendarCheckIn) {
      setCalendarCheckIn(dateStr);
      setCalendarCheckOut('');
      return;
    }

    setCalendarCheckOut(dateStr);
  };

  const handleCreateBookingFromCalendar = () => {
    if (!selectedVillaId || !calendarCheckIn || !calendarCheckOut) return;
    router.push(`/admin/bookings/new?villa_id=${selectedVillaId}&check_in=${calendarCheckIn}&check_out=${calendarCheckOut}`);
  };

  const updateBookingStatus = async (bookingId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating booking:', error);
    }
  };

  const deleteBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchBookings(); // Refresh the list
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date not set';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date format';
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <ProtectedRoute>
      <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2><i className="fas fa-hotel"></i> Yumna Villa Dieng</h2>
          <p>Admin Dashboard</p>
        </div>
        
        <nav className="sidebar-nav">
          <Link href="/admin" className="nav-item">
            <i className="fas fa-dashboard"></i>
            <span>Dashboard</span>
          </Link>
          <Link href="/admin/bookings" className="nav-item active">
            <i className="fas fa-calendar-check"></i>
            <span>Bookings</span>
          </Link>
          <Link href="/admin/villas" className="nav-item">
            <i className="fas fa-home"></i>
            <span>Villas</span>
          </Link>
          <Link href="/admin/settings" className="nav-item">
            <i className="fas fa-cog"></i>
            <span>Settings</span>
          </Link>
          <a href="/" className="nav-item" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-external-link-alt"></i>
            <span>View Website</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-header">
          <h1>Bookings Management</h1>
          <div className="header-actions">
            <Link href="/admin/bookings/new" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              New Booking
            </Link>
          </div>
        </div>

        <div className="form-container">
          <div className="form-section">
            <h3>Kalender Ketersediaan Villa</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="calendar_villa">Pilih Villa</label>
                <select
                  id="calendar_villa"
                  className="form-control"
                  value={selectedVillaId}
                  onChange={(e) => setSelectedVillaId(e.target.value)}
                >
                  {villas.length === 0 && (
                    <option value="">Tidak ada villa</option>
                  )}
                  {villas.map((villa) => (
                    <option key={villa.id} value={villa.id}>
                      {villa.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Rentang Tanggal</label>
                <div className="date-range">
                  <small>{calendarCheckIn || 'Pilih check-in'}</small>
                  <small>{calendarCheckOut || 'Pilih check-out'}</small>
                </div>
              </div>
            </div>

            <div className="booking-calendar">
              <div className="calendar-header">
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  className="calendar-nav"
                  disabled={
                    calendarDate.getMonth() === new Date().getMonth() &&
                    calendarDate.getFullYear() === new Date().getFullYear()
                  }
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h3>{monthNames[calendarDate.getMonth()]} {calendarDate.getFullYear()}</h3>
                <button
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  className="calendar-nav"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>

              <div className="calendar-days-header">
                {dayNames.map(day => (
                  <div key={day} className="calendar-day-name">{day}</div>
                ))}
              </div>

              <div className="calendar-grid">
                {(() => {
                  const daysInMonth = getDaysInMonth(calendarDate);
                  const firstDay = getFirstDayOfMonth(calendarDate);
                  const days = [];

                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
                  }

                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = formatIsoDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day));
                    const isBooked = bookedDateSet.has(dateStr);
                    const isSelected = isDateSelected(dateStr);
                    const isInRange = isDateInRange(dateStr);
                    const isPast = parseDate(dateStr) < parseDate(formatIsoDate(new Date()));

                    let className = 'calendar-day';
                    if (isBooked) className += ' booked';
                    if (isSelected) className += ' selected';
                    if (isInRange) className += ' in-range';
                    if (isPast) className += ' past';

                    days.push(
                      <div
                        key={dateStr}
                        className={className}
                        onClick={() => {
                          if (isBooked || isPast) return;
                          handleDateClick(dateStr);
                        }}
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
                })()}
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

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setCalendarCheckIn('');
                    setCalendarCheckOut('');
                  }}
                >
                  Reset Pilihan
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleCreateBookingFromCalendar}
                  disabled={!selectedVillaId || !calendarCheckIn || !calendarCheckOut}
                >
                  Tandai & Buat Booking
                </button>
              </div>

              {calendarLoading && (
                <div className="loading-message">Memuat data booking...</div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Guest</th>
                <th>Villa</th>
                <th>Dates</th>
                <th>Guests</th>
                <th>Total</th>
                <th>Status</th>
                <th>Source</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="text-center">Loading...</td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center">No bookings found</td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>#{booking.id}</td>
                    <td>
                      <div className="guest-info">
                        <strong>{booking.guest_name}</strong>
                        <small>{booking.guest_email}</small>
                        <small>{booking.guest_phone}</small>
                      </div>
                    </td>
                    <td>{booking.villa_title}</td>
                    <td>
                      <div className="date-range">
                        <small>Check-in: {formatDate(booking.check_in)}</small>
                        <small>Check-out: {formatDate(booking.check_out)}</small>
                        <small>{booking.total_nights} nights</small>
                      </div>
                    </td>
                    <td>{booking.guests_count}</td>
                    <td>Rp {formatRupiahNumber(booking.total_price || 0)}</td>
                    <td>
                      <select
                        value={booking.status}
                        onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        className={`status-select status-${booking.status}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td>
                      <span className="source-badge">{booking.booking_source}</span>
                    </td>
                    <td>{formatDate(booking.created_at)}</td>
                    <td>
                      <div className="action-buttons">
                        <Link 
                          href={`/admin/bookings/${booking.id}`}
                          className="btn btn-sm btn-outline"
                          title="View Details"
                        >
                          <i className="fas fa-eye"></i>
                        </Link>
                        <button
                          onClick={() => deleteBooking(booking.id)}
                          className="btn btn-sm btn-danger"
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="btn btn-outline"
            >
              Previous
            </button>
            
            <span className="page-info">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="btn btn-outline"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
    </ProtectedRoute>
  );
}
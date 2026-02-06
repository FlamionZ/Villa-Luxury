'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatRupiahNumber } from '@/lib/utils';

interface Booking {
  id: number;
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

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

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
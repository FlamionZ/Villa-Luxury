'use client';

import { useState, useEffect } from 'react';
import { formatRupiahNumber } from '@/lib/utils';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import AdminHeader from '@/components/AdminHeader';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Booking {
  id: number;
  guest_name: string;
  villa_title: string;
  check_in: string;
  check_out: string;
  status: string;
  total_price: number;
}

interface DashboardStats {
  totalBookings: number;
  totalVillas: number;
  pendingBookings: number;
  recentBookings: Booking[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalVillas: 0,
    pendingBookings: 0,
    recentBookings: []
  });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch stats from API endpoints
      const [bookingsRes, villasRes] = await Promise.all([
        fetch('/api/admin/bookings?limit=5'),
        fetch('/api/admin/villas')
      ]);

      const bookingsData = await bookingsRes.json();
      const villasData = await villasRes.json();

      if (bookingsData.success && villasData.success) {
        // Calculate stats
        const totalBookings = bookingsData.pagination?.total || 0;
        const totalVillas = villasData.data?.length || 0;
        const pendingBookings = bookingsData.data?.filter((b: Booking) => b.status === 'pending').length || 0;

        setStats({
          totalBookings,
          totalVillas,
          pendingBookings,
          recentBookings: bookingsData.data || []
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="admin-dashboard">
        <AdminSidebar />

        {/* Main Content */}
        <div className="admin-content">
          <AdminHeader title="Dashboard" />

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-calendar-check"></i>
              </div>
              <div className="stat-content">
                <h3>{loading ? '...' : stats.totalBookings}</h3>
                <p>Total Bookings</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="stat-content">
                <h3>{loading ? '...' : stats.totalVillas}</h3>
                <p>Total Villas</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <i className="fas fa-clock"></i>
              </div>
              <div className="stat-content">
                <h3>{loading ? '...' : stats.pendingBookings}</h3>
                <p>Pending Bookings</p>
              </div>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link href="/admin/bookings" className="btn btn-primary">
                View All
              </Link>
            </div>

            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Guest Name</th>
                    <th>Villa</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center">Loading...</td>
                    </tr>
                  ) : stats.recentBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center">No bookings found</td>
                    </tr>
                  ) : (
                    stats.recentBookings.map((booking: Booking) => (
                      <tr key={booking.id}>
                        <td>{booking.guest_name}</td>
                        <td>{booking.villa_title}</td>
                        <td>{formatDate(booking.check_in)}</td>
                        <td>{formatDate(booking.check_out)}</td>
                        <td>
                          <span className={`status-badge status-${booking.status}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td>Rp {formatRupiahNumber(booking.total_price || 0)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-section">
            <h2>Quick Actions</h2>
            <div className="quick-actions">
              <Link href="/admin/bookings/new" className="action-card">
                <i className="fas fa-plus"></i>
                <h3>New Booking</h3>
                <p>Create a new booking</p>
              </Link>
              
              <Link href="/admin/villas/new" className="action-card">
                <i className="fas fa-home"></i>
                <h3>Add Villa</h3>
                <p>Add a new villa type</p>
              </Link>
              
              <Link href="/admin/bookings?status=pending" className="action-card">
                <i className="fas fa-clock"></i>
                <h3>Pending Bookings</h3>
                <p>Review pending bookings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
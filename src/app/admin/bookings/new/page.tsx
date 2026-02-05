'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Villa {
  id: number;
  title: string;
  price: number;
  max_guests: number;
  slug: string;
}

interface BookingForm {
  villa_id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: string;
  special_requests: string;
  status: string;
  booking_source: string;
}

export default function NewBookingPage() {
  const router = useRouter();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<BookingForm>({
    villa_id: '',
    guest_name: '',
    guest_email: '',
    guest_phone: '',
    check_in: '',
    check_out: '',
    guests_count: '2',
    special_requests: '',
    status: 'pending',
    booking_source: 'admin'
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [totalNights, setTotalNights] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    fetchVillas();
  }, []);

  const calculateTotals = useCallback(() => {
    if (!formData.villa_id || !formData.check_in || !formData.check_out) {
      setTotalNights(0);
      setTotalPrice(0);
      return;
    }

    const checkIn = new Date(formData.check_in);
    const checkOut = new Date(formData.check_out);
    const timeDiff = checkOut.getTime() - checkIn.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff <= 0) {
      setTotalNights(0);
      setTotalPrice(0);
      return;
    }

    const selectedVilla = villas.find(v => v.id === parseInt(formData.villa_id));
    if (selectedVilla) {
      const total = daysDiff * selectedVilla.price;
      setTotalNights(daysDiff);
      setTotalPrice(total);
    }
  }, [formData.villa_id, formData.check_in, formData.check_out, villas]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const fetchVillas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/villas');
      const data = await response.json();

      if (data.success) {
        setVillas(data.data);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.villa_id) newErrors.villa_id = 'Villa is required';
    if (!formData.guest_name.trim()) newErrors.guest_name = 'Guest name is required';
    if (!formData.guest_email.trim()) newErrors.guest_email = 'Guest email is required';
    if (!formData.guest_phone.trim()) newErrors.guest_phone = 'Guest phone is required';
    if (!formData.check_in) newErrors.check_in = 'Check-in date is required';
    if (!formData.check_out) newErrors.check_out = 'Check-out date is required';
    if (!formData.guests_count) newErrors.guests_count = 'Number of guests is required';

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.guest_email && !emailRegex.test(formData.guest_email)) {
      newErrors.guest_email = 'Please enter a valid email address';
    }

    // Validate dates
    if (formData.check_in && formData.check_out) {
      const checkInDate = new Date(formData.check_in);
      const checkOutDate = new Date(formData.check_out);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (checkInDate < today) {
        newErrors.check_in = 'Check-in date cannot be in the past';
      }

      if (checkOutDate <= checkInDate) {
        newErrors.check_out = 'Check-out date must be after check-in date';
      }
    }

    // Validate guest count against villa capacity
    if (formData.villa_id && formData.guests_count) {
      const selectedVilla = villas.find(v => v.id === parseInt(formData.villa_id));
      if (selectedVilla && parseInt(formData.guests_count) > selectedVilla.max_guests) {
        newErrors.guests_count = `Maximum guests for this villa is ${selectedVilla.max_guests}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          villa_id: parseInt(formData.villa_id),
          guests_count: parseInt(formData.guests_count)
        }),
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/bookings');
      } else {
        setErrors({ submit: data.error || 'Failed to create booking' });
      }
    } catch {
      setErrors({ submit: 'An error occurred. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="admin-dashboard">
          <div className="loading-spinner">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

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
            <div className="header-breadcrumb">
              <Link href="/admin/bookings" className="breadcrumb-item">
                <i className="fas fa-calendar-check"></i>
                Bookings
              </Link>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">New Booking</span>
            </div>
            <h1>Create New Booking</h1>
          </div>

          <div className="form-container">
            <form onSubmit={handleSubmit} className="admin-form">
              {errors.submit && (
                <div className="alert alert-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  {errors.submit}
                </div>
              )}

              <div className="form-section">
                <h3>Villa Information</h3>
                
                <div className="form-group">
                  <label htmlFor="villa_id">Select Villa *</label>
                  <select
                    id="villa_id"
                    name="villa_id"
                    value={formData.villa_id}
                    onChange={handleInputChange}
                    className={`form-control ${errors.villa_id ? 'error' : ''}`}
                    required
                  >
                    <option value="">Choose a villa...</option>
                    {villas.map((villa) => (
                      <option key={villa.id} value={villa.id}>
                        {villa.title} - {formatPrice(villa.price)}/night (Max {villa.max_guests} guests)
                      </option>
                    ))}
                  </select>
                  {errors.villa_id && <span className="error-message">{errors.villa_id}</span>}
                </div>
              </div>

              <div className="form-section">
                <h3>Guest Information</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest_name">Guest Name *</label>
                    <input
                      type="text"
                      id="guest_name"
                      name="guest_name"
                      value={formData.guest_name}
                      onChange={handleInputChange}
                      className={`form-control ${errors.guest_name ? 'error' : ''}`}
                      placeholder="Enter guest full name"
                      required
                    />
                    {errors.guest_name && <span className="error-message">{errors.guest_name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="guest_email">Guest Email *</label>
                    <input
                      type="email"
                      id="guest_email"
                      name="guest_email"
                      value={formData.guest_email}
                      onChange={handleInputChange}
                      className={`form-control ${errors.guest_email ? 'error' : ''}`}
                      placeholder="guest@example.com"
                      required
                    />
                    {errors.guest_email && <span className="error-message">{errors.guest_email}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="guest_phone">Guest Phone *</label>
                    <input
                      type="tel"
                      id="guest_phone"
                      name="guest_phone"
                      value={formData.guest_phone}
                      onChange={handleInputChange}
                      className={`form-control ${errors.guest_phone ? 'error' : ''}`}
                      placeholder="+622136296229"
                      required
                    />
                    {errors.guest_phone && <span className="error-message">{errors.guest_phone}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="guests_count">Number of Guests *</label>
                    <select
                      id="guests_count"
                      name="guests_count"
                      value={formData.guests_count}
                      onChange={handleInputChange}
                      className={`form-control ${errors.guests_count ? 'error' : ''}`}
                      required
                    >
                      {[1,2,3,4,5,6,7,8,9,10].map(num => (
                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                    {errors.guests_count && <span className="error-message">{errors.guests_count}</span>}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Booking Details</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="check_in">Check-in Date *</label>
                    <input
                      type="date"
                      id="check_in"
                      name="check_in"
                      value={formData.check_in}
                      onChange={handleInputChange}
                      className={`form-control ${errors.check_in ? 'error' : ''}`}
                      min={getTodayDate()}
                      required
                    />
                    {errors.check_in && <span className="error-message">{errors.check_in}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="check_out">Check-out Date *</label>
                    <input
                      type="date"
                      id="check_out"
                      name="check_out"
                      value={formData.check_out}
                      onChange={handleInputChange}
                      className={`form-control ${errors.check_out ? 'error' : ''}`}
                      min={formData.check_in || getTomorrowDate()}
                      required
                    />
                    {errors.check_out && <span className="error-message">{errors.check_out}</span>}
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="status">Booking Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="booking_source">Booking Source</label>
                    <select
                      id="booking_source"
                      name="booking_source"
                      value={formData.booking_source}
                      onChange={handleInputChange}
                      className="form-control"
                    >
                      <option value="admin">Admin</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="phone">Phone</option>
                      <option value="email">Email</option>
                      <option value="walk-in">Walk-in</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="special_requests">Special Requests</label>
                  <textarea
                    id="special_requests"
                    name="special_requests"
                    value={formData.special_requests}
                    onChange={handleInputChange}
                    className="form-control"
                    rows={4}
                    placeholder="Any special requests from the guest..."
                  />
                </div>
              </div>

              {/* Booking Summary */}
              {totalNights > 0 && (
                <div className="form-section booking-summary">
                  <h3>Booking Summary</h3>
                  <div className="summary-details">
                    <div className="summary-row">
                      <span>Total Nights:</span>
                      <strong>{totalNights} night{totalNights > 1 ? 's' : ''}</strong>
                    </div>
                    <div className="summary-row">
                      <span>Price per Night:</span>
                      <strong>{formatPrice(totalPrice / totalNights)}</strong>
                    </div>
                    <div className="summary-row total">
                      <span>Total Price:</span>
                      <strong>{formatPrice(totalPrice)}</strong>
                    </div>
                  </div>
                </div>
              )}

              <div className="form-actions">
                <Link href="/admin/bookings" className="btn btn-outline">
                  <i className="fas fa-arrow-left"></i>
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      Create Booking
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
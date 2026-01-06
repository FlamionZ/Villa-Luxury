'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';
import { formatRupiahNumber } from '@/lib/utils';

interface Villa {
  id: number;
  slug: string;
  title: string;
  description: string;
  price: number;
  weekday_price?: number;
  weekend_price?: number;
  high_season_price?: number;
  location: string;
  max_guests: number;
  status: 'active' | 'inactive';
  images: Array<{ image_url: string; is_primary: boolean }>;
}

export default function VillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchVillas = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/villas?${params}`);
      const data = await response.json();

      if (data.success) {
        setVillas(data.data);
      }
    } catch (error) {
      console.error('Error fetching villas:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchVillas();
  }, [fetchVillas]);

  const updateVillaStatus = async (villaId: number) => {
    try {
      const response = await fetch(`/api/admin/villas/${villaId}/toggle`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (response.ok) {
        fetchVillas(); // Refresh the list
      } else {
        alert(data.error || 'Failed to update villa status');
      }
    } catch (error) {
      console.error('Error updating villa:', error);
      alert('Failed to update villa status');
    }
  };

  const deleteVilla = async (villaId: number) => {
    if (!confirm('Are you sure you want to delete this villa? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/villas/${villaId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchVillas(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete villa');
      }
    } catch (error) {
      console.error('Error deleting villa:', error);
      alert('Failed to delete villa');
    }
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
          <Link href="/admin/bookings" className="nav-item">
            <i className="fas fa-calendar-check"></i>
            <span>Bookings</span>
          </Link>
          <Link href="/admin/villas" className="nav-item active">
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
          <h1>Villas Management</h1>
          <div className="header-actions">
            <Link href="/admin/villas/new" className="btn btn-primary">
              <i className="fas fa-plus"></i>
              Add New Villa
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          <div className="filter-group">
            <label>Status:</label>
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="form-control"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Villas Grid */}
        <div className="villas-grid">
          {loading ? (
            <div className="loading-placeholder">Loading...</div>
          ) : villas.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-home"></i>
              <h3>No villas found</h3>
              <p>Start by adding your first villa</p>
              <Link href="/admin/villas/new" className="btn btn-primary">
                Add New Villa
              </Link>
            </div>
          ) : (
            villas.map((villa) => {
              const primaryImage = villa.images?.find(img => img.is_primary) || villa.images?.[0];
              
              return (
                <div key={villa.id} className={`villa-card ${villa.status}`}>
                  <div className="villa-image">
                    {primaryImage && primaryImage.image_url && primaryImage.image_url.trim() !== '' ? (
                      <Image
                        src={primaryImage.image_url}
                        alt={villa.title || 'Villa'}
                        width={300}
                        height={200}
                      />
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-image"></i>
                        <span>No Image</span>
                      </div>
                    )}
                    <div className="villa-status">
                      <span className={`status-badge status-${villa.status}`}>
                        {villa.status}
                      </span>
                    </div>
                  </div>

                  <div className="villa-content">
                    <h3>{villa.title}</h3>
                    <p className="villa-description">{villa.description}</p>
                    
                    <div className="villa-details">
                      <div className="detail-item">
                        <i className="fas fa-map-marker-alt"></i>
                        <span>{villa.location}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-users"></i>
                        <span>Max {villa.max_guests} guests</span>
                      </div>
                    </div>

                    <div className="villa-price">
                      {villa.weekday_price && villa.weekend_price && villa.high_season_price ? (
                        <>
                          <span className="price">
                            Rp {formatRupiahNumber(villa.weekday_price)} - {formatRupiahNumber(villa.high_season_price)}
                          </span>
                          <span className="period">/malam</span>
                          <div className="price-breakdown">
                            <small>
                              Weekday: Rp {formatRupiahNumber(villa.weekday_price)} • 
                              Weekend: Rp {formatRupiahNumber(villa.weekend_price)} • 
                              High Season: Rp {formatRupiahNumber(villa.high_season_price)}
                            </small>
                          </div>
                        </>
                      ) : (
                        <>
                          <span className="price">Rp {formatRupiahNumber(villa.price || 0)}</span>
                          <span className="period">/malam</span>
                        </>
                      )}
                    </div>

                    <div className="villa-actions">
                      <Link 
                        href={`/admin/villas/${villa.id}/edit`}
                        className="btn btn-sm btn-outline"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => updateVillaStatus(villa.id)}
                        className={`btn btn-sm ${villa.status === 'active' ? 'btn-warning' : 'btn-success'}`}
                      >
                        <i className={`fas ${villa.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                        {villa.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                      
                      <button
                        onClick={() => deleteVilla(villa.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
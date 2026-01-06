'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import ProtectedRoute from '@/components/ProtectedRoute';

interface GalleryItem {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function GalleryManagePage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/gallery?${params}`);
      const data = await response.json();

      if (data.success) {
        setGalleryItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  const updateGalleryStatus = async (itemId: number) => {
    try {
      const response = await fetch(`/api/admin/gallery/${itemId}/toggle`, {
        method: 'PATCH'
      });

      const data = await response.json();

      if (response.ok) {
        fetchGalleryItems(); // Refresh the list
      } else {
        alert(data.error || 'Failed to update gallery item status');
      }
    } catch (error) {
      console.error('Error updating gallery item:', error);
      alert('Failed to update gallery item status');
    }
  };

  const deleteGalleryItem = async (itemId: number) => {
    if (!confirm('Are you sure you want to delete this gallery item? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/admin/gallery/${itemId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (response.ok) {
        fetchGalleryItems(); // Refresh the list
      } else {
        alert(data.error || 'Failed to delete gallery item');
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      alert('Failed to delete gallery item');
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
            <Link href="/admin/villas" className="nav-item">
              <i className="fas fa-home"></i>
              <span>Villas</span>
            </Link>
            <Link href="/admin/gallery" className="nav-item active">
              <i className="fas fa-images"></i>
              <span>Gallery</span>
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
            <h1>Gallery Management</h1>
            <div className="header-actions">
              <Link href="/admin/gallery/new" className="btn btn-primary">
                <i className="fas fa-plus"></i>
                Add New Image
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

          {/* Gallery Grid */}
          <div className="gallery-admin-grid">
            {loading ? (
              <div className="loading-placeholder">Loading...</div>
            ) : galleryItems.length === 0 ? (
              <div className="empty-state">
                <i className="fas fa-images"></i>
                <h3>No gallery items found</h3>
                <p>Start by adding your first gallery image</p>
                <Link href="/admin/gallery/new" className="btn btn-primary">
                  Add New Image
                </Link>
              </div>
            ) : (
              galleryItems.map((item) => (
                <div key={item.id} className={`gallery-admin-card ${item.is_active ? 'active' : 'inactive'}`}>
                  <div className="gallery-admin-image">
                    <Image
                      src={item.image_url && item.image_url.trim() !== '' ? item.image_url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
                      alt={item.alt_text || item.title}
                      width={300}
                      height={200}
                    />
                    <div className="gallery-admin-status">
                      <span className={`status-badge status-${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="gallery-admin-content">
                    <h3>{item.title}</h3>
                    {item.description && <p className="gallery-admin-description">{item.description}</p>}
                    
                    <div className="gallery-admin-details">
                      <div className="detail-item">
                        <i className="fas fa-sort-numeric-up"></i>
                        <span>Order: {item.display_order}</span>
                      </div>
                      <div className="detail-item">
                        <i className="fas fa-calendar"></i>
                        <span>{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="gallery-admin-actions">
                      <Link 
                        href={`/admin/gallery/${item.id}/edit`}
                        className="btn btn-sm btn-outline"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </Link>
                      
                      <button
                        onClick={() => updateGalleryStatus(item.id)}
                        className={`btn btn-sm ${item.is_active ? 'btn-warning' : 'btn-success'}`}
                      >
                        <i className={`fas ${item.is_active ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                        {item.is_active ? 'Hide' : 'Show'}
                      </button>
                      
                      <button
                        onClick={() => deleteGalleryItem(item.id)}
                        className="btn btn-sm btn-danger"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
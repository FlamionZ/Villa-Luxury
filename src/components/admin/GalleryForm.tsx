'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface GalleryFormData {
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
  is_active: boolean;
}

interface GalleryFormProps {
  galleryId?: string;
  isEdit?: boolean;
}

export default function GalleryForm({ galleryId, isEdit = false }: GalleryFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [uploadMethod, setUploadMethod] = useState<'url' | 'file'>('url');
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    image_url: '',
    alt_text: '',
    display_order: 0,
    is_active: true
  });

  useEffect(() => {
    if (isEdit && galleryId) {
      fetchGalleryData();
    }
  }, [isEdit, galleryId]);

  useEffect(() => {
    if (formData.image_url) {
      setImagePreview(formData.image_url);
    }
  }, [formData.image_url]);

  const fetchGalleryData = async () => {
    try {
      const response = await fetch(`/api/admin/gallery/${galleryId}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData({
          title: data.data.title,
          description: data.data.description || '',
          image_url: data.data.image_url,
          alt_text: data.data.alt_text || '',
          display_order: data.data.display_order,
          is_active: data.data.is_active
        });
      }
    } catch (error) {
      console.error('Error fetching gallery data:', error);
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload/gallery', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => ({ ...prev, image_url: data.data.url }));
        setImagePreview(data.data.url);
        alert('File uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload file');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('File too large. Maximum size is 5MB.');
        return;
      }

      handleFileUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/gallery/${galleryId}` : '/api/admin/gallery';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/gallery');
      } else {
        alert(data.error || 'Failed to save gallery item');
      }
    } catch (error) {
      console.error('Error saving gallery item:', error);
      alert('Failed to save gallery item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2><i className="fas fa-hotel"></i> Villa Dieng Luxury</h2>
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
          <Link href="/" className="nav-item">
            <i className="fas fa-external-link-alt"></i>
            <span>View Website</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <div className="admin-header">
          <h1>{isEdit ? 'Edit Gallery Item' : 'Add New Gallery Item'}</h1>
          <div className="header-actions">
            <Link href="/admin/gallery" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i>
              Back to Gallery
            </Link>
          </div>
        </div>

        <div className="form-container">
          <div className="gallery-form-layout">
            {/* Form */}
            <div className="gallery-form">
              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <h3>Basic Information</h3>
                  
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="form-control"
                      placeholder="e.g., Villa Exterior"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="form-control"
                      rows={3}
                      placeholder="Optional description for this image"
                    />
                  </div>

                  <div className="form-group">
                    <label>Image Source *</label>
                    
                    {/* Upload Method Selection */}
                    <div className="upload-method-tabs" style={{ marginBottom: '15px' }}>
                      <button
                        type="button"
                        className={`upload-tab ${uploadMethod === 'url' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('url')}
                        style={{
                          padding: '8px 16px',
                          marginRight: '8px',
                          border: '1px solid #ddd',
                          background: uploadMethod === 'url' ? '#667eea' : 'white',
                          color: uploadMethod === 'url' ? 'white' : '#333',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-link"></i> URL
                      </button>
                      <button
                        type="button"
                        className={`upload-tab ${uploadMethod === 'file' ? 'active' : ''}`}
                        onClick={() => setUploadMethod('file')}
                        style={{
                          padding: '8px 16px',
                          border: '1px solid #ddd',
                          background: uploadMethod === 'file' ? '#667eea' : 'white',
                          color: uploadMethod === 'file' ? 'white' : '#333',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        <i className="fas fa-upload"></i> Upload File
                      </button>
                    </div>

                    {/* URL Input */}
                    {uploadMethod === 'url' && (
                      <div>
                        <input
                          type="url"
                          value={formData.image_url}
                          onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                          className="form-control"
                          placeholder="https://example.com/image.jpg"
                          required
                        />
                        <small className="text-muted">
                          Enter a valid image URL. The image will be displayed in the gallery.
                        </small>
                      </div>
                    )}

                    {/* File Upload */}
                    {uploadMethod === 'file' && (
                      <div>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/jpeg,image/jpg,image/png,image/webp"
                          className="form-control"
                          style={{ display: 'none' }}
                        />
                        
                        <div 
                          className="file-upload-area"
                          style={{
                            border: '2px dashed #ddd',
                            borderRadius: '8px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#667eea';
                            e.currentTarget.style.backgroundColor = '#f8f9ff';
                          }}
                          onDragLeave={(e) => {
                            e.currentTarget.style.borderColor = '#ddd';
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.currentTarget.style.borderColor = '#ddd';
                            e.currentTarget.style.backgroundColor = 'transparent';
                            
                            const files = e.dataTransfer.files;
                            if (files.length > 0) {
                              const file = files[0];
                              if (fileInputRef.current) {
                                fileInputRef.current.files = files;
                                handleFileChange({ target: { files } } as React.ChangeEvent<HTMLInputElement>);
                              }
                            }
                          }}
                        >
                          {uploading ? (
                            <div>
                              <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#667eea', marginBottom: '10px' }}></i>
                              <p>Uploading...</p>
                            </div>
                          ) : formData.image_url && formData.image_url.startsWith('/uploads/') ? (
                            <div>
                              <i className="fas fa-check-circle" style={{ fontSize: '24px', color: '#28a745', marginBottom: '10px' }}></i>
                              <p>File uploaded successfully!</p>
                              <small>Click to change file</small>
                            </div>
                          ) : (
                            <div>
                              <i className="fas fa-cloud-upload-alt" style={{ fontSize: '24px', color: '#667eea', marginBottom: '10px' }}></i>
                              <p>Click to browse or drag & drop your image here</p>
                              <small>Supported: JPEG, PNG, WebP (Max 5MB)</small>
                            </div>
                          )}
                        </div>

                        <small className="text-muted" style={{ display: 'block', marginTop: '8px' }}>
                          Upload an image from your device. Supported formats: JPEG, PNG, WebP. Maximum size: 5MB.
                        </small>
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Alt Text</label>
                    <input
                      type="text"
                      value={formData.alt_text}
                      onChange={(e) => setFormData(prev => ({ ...prev, alt_text: e.target.value }))}
                      className="form-control"
                      placeholder="Descriptive text for accessibility"
                    />
                    <small className="text-muted">
                      Alternative text for screen readers and SEO
                    </small>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Display Order</label>
                      <input
                        type="number"
                        value={formData.display_order}
                        onChange={(e) => setFormData(prev => ({ ...prev, display_order: Number(e.target.value) }))}
                        className="form-control"
                        min="0"
                        placeholder="0"
                      />
                      <small className="text-muted">
                        Lower numbers appear first in the gallery
                      </small>
                    </div>
                    
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={formData.is_active ? 'active' : 'inactive'}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === 'active' }))}
                        className="form-control"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="form-actions">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? 'Saving...' : (isEdit ? 'Update Image' : 'Add Image')}
                  </button>
                  <Link href="/admin/gallery" className="btn btn-outline">
                    Cancel
                  </Link>
                </div>
              </form>
            </div>

            {/* Preview */}
            <div className="gallery-preview">
              <h3>Preview</h3>
              <div className="preview-container">
                {imagePreview ? (
                  <div className="preview-image">
                    <Image
                      src={imagePreview}
                      alt={formData.alt_text || formData.title || 'Preview'}
                      width={400}
                      height={250}
                      style={{
                        width: '100%',
                        height: 'auto',
                        borderRadius: '8px',
                        objectFit: 'cover'
                      }}
                      onError={() => setImagePreview('')}
                    />
                    <div className="preview-info">
                      <h4>{formData.title || 'Untitled'}</h4>
                      {formData.description && <p>{formData.description}</p>}
                      <div className="preview-meta">
                        <span>Order: {formData.display_order}</span>
                        <span className={`status ${formData.is_active ? 'active' : 'inactive'}`}>
                          {formData.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="preview-placeholder">
                    <i className="fas fa-image"></i>
                    <p>Enter an image URL to see preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
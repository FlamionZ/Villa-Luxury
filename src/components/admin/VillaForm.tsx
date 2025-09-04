'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatRupiahNumber } from '@/lib/utils';

interface VillaFormData {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  location: string;
  max_guests: number;
  status: 'active' | 'inactive';
  amenities: Array<{ icon: string; text: string }>;
  features: string[];
  images: Array<{ 
    image_url: string; 
    alt_text: string; 
    is_primary: boolean; 
    uploadMethod?: 'url' | 'file';
  }>;
}

interface VillaFormProps {
  villaId?: string;
  isEdit?: boolean;
}

export default function VillaForm({ villaId, isEdit = false }: VillaFormProps) {
  const router = useRouter();
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<VillaFormData>({
    slug: '',
    title: '',
    description: '',
    long_description: '',
    weekday_price: 0,
    weekend_price: 0,
    high_season_price: 0,
    location: '',
    max_guests: 2,
    status: 'active',
    amenities: [{ icon: 'fas fa-bed', text: '1 Kamar Tidur' }],
    features: [''],
    images: [{ image_url: '', alt_text: '', is_primary: true }]
  });

  useEffect(() => {
    if (isEdit && villaId) {
      fetchVillaData();
    }
  }, [isEdit, villaId]);

  const fetchVillaData = async () => {
    try {
      const response = await fetch(`/api/admin/villas/${villaId}`);
      const data = await response.json();
      
      if (data.success) {
        setFormData({
          slug: data.data.slug,
          title: data.data.title,
          description: data.data.description,
          long_description: data.data.long_description,
          weekday_price: data.data.weekday_price || data.data.price || 0,
          weekend_price: data.data.weekend_price || data.data.price || 0,
          high_season_price: data.data.high_season_price || data.data.price || 0,
          location: data.data.location,
          max_guests: data.data.max_guests,
          status: data.data.status,
          amenities: data.data.amenities || [],
          features: data.data.features || [],
          images: data.data.images || []
        });
      }
    } catch (error) {
      console.error('Error fetching villa data:', error);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleImageUpload = async (file: File, imageIndex: number) => {
    setUploadingIndex(imageIndex);
    
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);
      formDataUpload.append('villaId', villaId || 'new');

      const response = await fetch('/api/admin/upload/villa', {
        method: 'POST',
        body: formDataUpload
      });

      const data = await response.json();

      if (data.success) {
        setFormData(prev => {
          const newImages = [...prev.images];
          newImages[imageIndex] = {
            ...newImages[imageIndex],
            image_url: data.data.url
          };
          return { ...prev, images: newImages };
        });
        alert('Image uploaded successfully!');
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>, imageIndex: number) => {
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

      handleImageUpload(file, imageIndex);
    }
  };

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: generateSlug(title)
    }));
  };

  const addAmenity = () => {
    setFormData(prev => ({
      ...prev,
      amenities: [...prev.amenities, { icon: 'fas fa-star', text: '' }]
    }));
  };

  const updateAmenity = (index: number, field: 'icon' | 'text', value: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.map((amenity, i) => 
        i === index ? { ...amenity, [field]: value } : amenity
      )
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index)
    }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, { image_url: '', alt_text: '', is_primary: false }]
    }));
  };

  const updateImage = (index: number, field: 'image_url' | 'alt_text' | 'is_primary', value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.map((image, i) => {
        if (i === index) {
          if (field === 'is_primary' && value === true) {
            // Set all other images as not primary
            return { ...image, [field]: value };
          }
          return { ...image, [field]: value };
        } else if (field === 'is_primary' && value === true) {
          // Set all other images as not primary
          return { ...image, is_primary: false };
        }
        return image;
      })
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = isEdit ? `/api/admin/villas/${villaId}` : '/api/admin/villas';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          features: formData.features.filter(f => f.trim() !== '')
        })
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/villas');
      } else {
        alert(data.error || 'Failed to save villa');
      }
    } catch (error) {
      console.error('Error saving villa:', error);
      alert('Failed to save villa');
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
          <Link href="/admin/villas" className="nav-item active">
            <i className="fas fa-home"></i>
            <span>Villas</span>
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
          <h1>{isEdit ? 'Edit Villa' : 'Add New Villa'}</h1>
          <div className="header-actions">
            <Link href="/admin/villas" className="btn btn-outline">
              <i className="fas fa-arrow-left"></i>
              Back to Villas
            </Link>
          </div>
        </div>

        <div className="form-container">
          <form onSubmit={handleSubmit} className="villa-form">
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Villa Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="form-control"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Short Description *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control"
                  rows={3}
                  required
                />
              </div>

              <div className="form-group">
                <label>Long Description *</label>
                <textarea
                  value={formData.long_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, long_description: e.target.value }))}
                  className="form-control"
                  rows={5}
                  required
                />
              </div>

              {/* Pricing Section */}
              <div className="form-section">
                <h3>Pengaturan Harga</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Harga Weekday (Senin-Jumat) *</label>
                    <input
                      type="number"
                      value={formData.weekday_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, weekday_price: Number(e.target.value) }))}
                      className="form-control"
                      min="100000"
                      step="50000"
                      placeholder="contoh: 2000000"
                      required
                    />
                    {formData.weekday_price > 0 && (
                      <small className="text-muted">
                        Format: Rp {formatRupiahNumber(formData.weekday_price)}/malam
                      </small>
                    )}
                  </div>
                  
                  <div className="form-group">
                    <label>Harga Weekend (Sabtu-Minggu) *</label>
                    <input
                      type="number"
                      value={formData.weekend_price}
                      onChange={(e) => setFormData(prev => ({ ...prev, weekend_price: Number(e.target.value) }))}
                      className="form-control"
                      min="100000"
                      step="50000"
                      placeholder="contoh: 2500000"
                      required
                    />
                    {formData.weekend_price > 0 && (
                      <small className="text-muted">
                        Format: Rp {formatRupiahNumber(formData.weekend_price)}/malam
                      </small>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Harga High Season (Tanggal Merah & Libur Nasional) *</label>
                  <input
                    type="number"
                    value={formData.high_season_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, high_season_price: Number(e.target.value) }))}
                    className="form-control"
                    min="100000"
                    step="50000"
                    placeholder="contoh: 3000000"
                    required
                  />
                  {formData.high_season_price > 0 && (
                    <small className="text-muted">
                      Format: Rp {formatRupiahNumber(formData.high_season_price)}/malam
                    </small>
                  )}
                  <small className="text-info">
                    <i className="fas fa-info-circle"></i> High season berlaku untuk hari libur nasional dan tanggal merah
                  </small>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Guests *</label>
                  <input
                    type="number"
                    value={formData.max_guests}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_guests: Number(e.target.value) }))}
                    className="form-control"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="form-control"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Status *</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
                  className="form-control"
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Amenities */}
            <div className="form-section">
              <div className="section-header">
                <h3>Amenities</h3>
                <button type="button" onClick={addAmenity} className="btn btn-sm btn-outline">
                  <i className="fas fa-plus"></i> Add Amenity
                </button>
              </div>

              {formData.amenities.map((amenity, index) => (
                <div key={index} className="amenity-row">
                  <input
                    type="text"
                    placeholder="Icon class (e.g., fas fa-bed)"
                    value={amenity.icon}
                    onChange={(e) => updateAmenity(index, 'icon', e.target.value)}
                    className="form-control"
                  />
                  <input
                    type="text"
                    placeholder="Amenity text"
                    value={amenity.text}
                    onChange={(e) => updateAmenity(index, 'text', e.target.value)}
                    className="form-control"
                  />
                  <button
                    type="button"
                    onClick={() => removeAmenity(index)}
                    className="btn btn-sm btn-danger"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="form-section">
              <div className="section-header">
                <h3>Features</h3>
                <button type="button" onClick={addFeature} className="btn btn-sm btn-outline">
                  <i className="fas fa-plus"></i> Add Feature
                </button>
              </div>

              {formData.features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <input
                    type="text"
                    placeholder="Feature description"
                    value={feature}
                    onChange={(e) => updateFeature(index, e.target.value)}
                    className="form-control"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="btn btn-sm btn-danger"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="form-section">
              <div className="section-header">
                <h3>Images</h3>
                <button type="button" onClick={addImage} className="btn btn-sm btn-outline">
                  <i className="fas fa-plus"></i> Add Image
                </button>
              </div>

              {formData.images.map((image, index) => (
                <div key={index} className="image-row" style={{ marginBottom: '20px', padding: '15px', border: '1px solid #e1e1e1', borderRadius: '8px' }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Image {index + 1}</strong>
                    {image.is_primary && <span style={{ color: '#28a745', marginLeft: '10px' }}>(Primary)</span>}
                  </div>

                  {/* Upload Method Tabs */}
                  <div style={{ marginBottom: '15px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...formData.images];
                        newImages[index] = { ...newImages[index], uploadMethod: 'url' };
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      style={{
                        padding: '6px 12px',
                        marginRight: '8px',
                        border: '1px solid #ddd',
                        background: (!image.uploadMethod || image.uploadMethod === 'url') ? '#667eea' : 'white',
                        color: (!image.uploadMethod || image.uploadMethod === 'url') ? 'white' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <i className="fas fa-link"></i> URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const newImages = [...formData.images];
                        newImages[index] = { ...newImages[index], uploadMethod: 'file' };
                        setFormData(prev => ({ ...prev, images: newImages }));
                      }}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        background: image.uploadMethod === 'file' ? '#667eea' : 'white',
                        color: image.uploadMethod === 'file' ? 'white' : '#333',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      <i className="fas fa-upload"></i> Upload
                    </button>
                  </div>

                  {/* URL Input or File Upload */}
                  {(!image.uploadMethod || image.uploadMethod === 'url') ? (
                    <input
                      type="url"
                      placeholder="Image URL"
                      value={image.image_url}
                      onChange={(e) => updateImage(index, 'image_url', e.target.value)}
                      className="form-control"
                      style={{ marginBottom: '10px' }}
                    />
                  ) : (
                    <div style={{ marginBottom: '10px' }}>
                      <input
                        type="file"
                        ref={(el) => { fileInputRefs.current[index] = el; }}
                        onChange={(e) => handleImageFileChange(e, index)}
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        style={{ display: 'none' }}
                      />
                      
                      <div 
                        className="file-upload-area"
                        style={{
                          border: '2px dashed #ddd',
                          borderRadius: '6px',
                          padding: '20px',
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          fontSize: '14px'
                        }}
                        onClick={() => fileInputRefs.current[index]?.click()}
                      >
                        {uploadingIndex === index ? (
                          <div>
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '20px', color: '#667eea', marginBottom: '8px' }}></i>
                            <p style={{ margin: 0, fontSize: '12px' }}>Uploading...</p>
                          </div>
                        ) : image.image_url && image.image_url.startsWith('/uploads/') ? (
                          <div>
                            <i className="fas fa-check-circle" style={{ fontSize: '20px', color: '#28a745', marginBottom: '8px' }}></i>
                            <p style={{ margin: 0, fontSize: '12px' }}>File uploaded!</p>
                            <small>Click to change</small>
                          </div>
                        ) : (
                          <div>
                            <i className="fas fa-cloud-upload-alt" style={{ fontSize: '20px', color: '#667eea', marginBottom: '8px' }}></i>
                            <p style={{ margin: 0, fontSize: '12px' }}>Click to upload image</p>
                            <small>JPEG, PNG, WebP (Max 5MB)</small>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Alt text"
                      value={image.alt_text}
                      onChange={(e) => updateImage(index, 'alt_text', e.target.value)}
                      className="form-control"
                      style={{ flex: 1 }}
                    />
                    <label className="checkbox-label" style={{ display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                      <input
                        type="checkbox"
                        checked={image.is_primary}
                        onChange={(e) => updateImage(index, 'is_primary', e.target.checked)}
                      />
                      Primary
                    </label>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="btn btn-sm btn-danger"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit */}
            <div className="form-actions">
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Villa' : 'Create Villa')}
              </button>
              <Link href="/admin/villas" className="btn btn-outline">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
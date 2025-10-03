'use client';

import { useState, useEffect } from 'react';
import SafeImage from './SafeImage';

interface GalleryImage {
  id: number;
  title: string;
  description: string;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export default function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      const response = await fetch('/api/gallery');
      const data = await response.json();
      
      if (data.success) {
        setGalleryImages(data.data);
      }
    } catch (error) {
      console.error('Error fetching gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (image: GalleryImage) => {
    setLightboxImage(image);
  };

  const closeLightbox = () => {
    setLightboxImage(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeLightbox();
    }
  };

  return (
    <section id="gallery" className="gallery">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Galeri</span>
          <h2 className="section-title">Kemewahan dalam Setiap Detail</h2>
        </div>
        
        {loading ? (
          <div className="loading-placeholder" style={{ textAlign: 'center', padding: '60px 0' }}>
            <p>Loading gallery...</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {galleryImages.map((image) => (
              <div 
                key={image.id} 
                className="gallery-item"
                onClick={() => openLightbox(image)}
              >
                <SafeImage 
                  src={image.image_url && image.image_url.trim() !== '' ? image.image_url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                  alt={image.alt_text || image.title}
                  width={600}
                  height={300}
                  fallbackSrc="/images/placeholder.svg"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div 
          className="lightbox"
          onClick={(e) => e.target === e.currentTarget && closeLightbox()}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.9)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: 1,
            transition: 'opacity 0.3s ease'
          }}
        >
          <div 
            className="lightbox-overlay"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <div 
              className="lightbox-content"
              style={{
                position: 'relative',
                maxWidth: '90%',
                maxHeight: '90%'
              }}
            >
              <SafeImage 
                src={lightboxImage.image_url && lightboxImage.image_url.trim() !== '' ? lightboxImage.image_url : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                alt={lightboxImage.alt_text || lightboxImage.title}
                width={1200}
                height={800}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '10px'
                }}
                fallbackSrc="/images/placeholder.svg"
              />
              <button 
                onClick={closeLightbox}
                className="lightbox-close"
                suppressHydrationWarning
                style={{
                  position: 'absolute',
                  top: '-40px',
                  right: '-40px',
                  background: 'white',
                  border: 'none',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
                }}
              >
                &times;
              </button>
              {lightboxImage.description && (
                <div style={{
                  position: 'absolute',
                  bottom: '-60px',
                  left: '0',
                  right: '0',
                  color: 'white',
                  textAlign: 'center',
                  padding: '10px'
                }}>
                  <h3 style={{ marginBottom: '5px' }}>{lightboxImage.title}</h3>
                  <p style={{ fontSize: '14px', opacity: 0.8 }}>{lightboxImage.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

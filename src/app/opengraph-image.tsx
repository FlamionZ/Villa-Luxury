import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const alt = 'Yumna Villa Dieng - Villa Eksklusif dengan Pemandangan Menakjubkan'
export const size = {
  width: 1200,
  height: 630,
}
 
export const contentType = 'image/png'
 
// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      // ImageResponse JSX element
      <div
        style={{
          background: 'linear-gradient(135deg, #0f4c81 0%, #1d8cf8 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/images/villa2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
          }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            zIndex: 1,
            padding: '40px',
          }}
        >
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: '#a5d8ff',
              marginBottom: 20,
              textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            }}
          >
            Yumna Villa Dieng
          </div>
          <div
            style={{
              fontSize: 32,
              marginBottom: 30,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
              maxWidth: 800,
            }}
          >
            Villa Eksklusif dengan Pemandangan Menakjubkan
          </div>
          <div
            style={{
              fontSize: 24,
              opacity: 0.9,
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            Jl. Sumberejo Kidul, Sumberejo III, Desa Sumberejo, Kec. Batur, Kab. Banjarnegara, Jawa Tengah
          </div>
          <div
            style={{
              fontSize: 28,
              marginTop: 20,
              color: '#a5d8ff',
              fontWeight: 'bold',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            www.villadiengluxury.com
          </div>
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
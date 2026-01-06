import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation - Will fallback to static files
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#0f4c81',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#a5d8ff',
          borderRadius: '6px',
          fontWeight: 'bold',
          fontFamily: 'serif',
        }}
      >
        Y
      </div>
    ),
    {
      ...size,
    }
  )
}
import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Image generation
export default function AppleIcon() {
  return new ImageResponse(
    (
      // SVG/JSX logo here
      <div
        style={{
          fontSize: 120,
          background: '#2d5016',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#d4a574',
          borderRadius: '20px',
          fontWeight: 'bold',
          fontFamily: 'serif',
        }}
      >
        V
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  )
}
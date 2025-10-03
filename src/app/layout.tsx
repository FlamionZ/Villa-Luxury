import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.villadiengluxury.com'),
  title: "Villa Dieng Luxury - Penginapan Mewah di Dieng | Villa Paradise",
  description: "Villa eksklusif dengan pemandangan Dieng yang menakjubkan. Fasilitas lengkap, pemandangan pegunungan, dan layanan terbaik untuk pengalaman menginap yang tak terlupakan.",
  keywords: "villa dieng, penginapan dieng, villa luxury, villa dengan view pegunungan, akomodasi dieng, villa terbaik dieng",
  authors: [{ name: "Villa Paradise Dieng" }],
  openGraph: {
    title: "Villa Dieng Luxury - Villa Eksklusif dengan Pemandangan Menakjubkan",
    description: "Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!",
    type: "website",
    locale: "id_ID",
    url: "https://www.villadiengluxury.com",
    siteName: "Villa Dieng Luxury",
    images: [
      {
        url: "https://www.villadiengluxury.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Villa Dieng Luxury - Villa Eksklusif dengan Pemandangan Menakjubkan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Dieng Luxury - Villa Eksklusif di Dieng",
    description: "Villa mewah dengan pemandangan pegunungan Dieng yang menakjubkan. Fasilitas lengkap & layanan terbaik.",
    images: ["https://www.villadiengluxury.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual Google verification code
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" sizes="any" />
        <link rel="icon" href="/icon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/icon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        
        {/* Open Graph Meta Tags untuk WhatsApp */}
        <meta property="og:title" content="Villa Dieng Luxury - Villa Eksklusif dengan Pemandangan Menakjubkan" />
        <meta property="og:description" content="Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!" />
        <meta property="og:image" content="https://www.villadiengluxury.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Villa Dieng Luxury - Villa Eksklusif dengan Pemandangan Menakjubkan" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.villadiengluxury.com" />
        <meta property="og:site_name" content="Villa Dieng Luxury" />
        <meta property="og:locale" content="id_ID" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Villa Dieng Luxury - Villa Eksklusif di Dieng" />
        <meta name="twitter:description" content="Villa mewah dengan pemandangan pegunungan Dieng yang menakjubkan. Fasilitas lengkap & layanan terbaik." />
        <meta name="twitter:image" content="https://www.villadiengluxury.com/og-image.jpg" />
        
        {/* WhatsApp specific meta tags */}
        <meta property="og:image:secure_url" content="https://www.villadiengluxury.com/og-image.jpg" />
        <meta property="og:image:type" content="image/jpeg" />
        
        {/* Additional meta tags for better sharing */}
        <meta name="description" content="Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2d5016" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://www.villadiengluxury.com" />
      </head>
      <body className={`${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}

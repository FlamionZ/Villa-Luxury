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
  title: "Yumna Villa Dieng - Penginapan Mewah di Dieng",
  description: "Yumna Villa Dieng dengan pemandangan Dieng yang menakjubkan. Fasilitas lengkap, pemandangan pegunungan, dan layanan terbaik untuk pengalaman menginap yang tak terlupakan.",
  keywords: "yumna villa dieng, penginapan dieng, villa luxury, villa dengan view pegunungan, akomodasi dieng, villa terbaik dieng",
  authors: [{ name: "Yumna Villa Dieng" }],
  openGraph: {
    title: "Yumna Villa Dieng - Villa Eksklusif dengan Pemandangan Menakjubkan",
    description: "Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!",
    type: "website",
    locale: "id_ID",
    url: "https://www.villadiengluxury.com",
    siteName: "Yumna Villa Dieng",
    images: [
      {
        url: "https://www.villadiengluxury.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Yumna Villa Dieng - Villa Eksklusif dengan Pemandangan Menakjubkan",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yumna Villa Dieng - Villa Eksklusif di Dieng",
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
        <link rel="icon" href="/images/logo.png" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        
        {/* Open Graph Meta Tags untuk WhatsApp */}
        <meta property="og:title" content="Yumna Villa Dieng - Villa Eksklusif dengan Pemandangan Menakjubkan" />
        <meta property="og:description" content="Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!" />
        <meta property="og:image" content="https://www.villadiengluxury.com/og-image.jpg" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Yumna Villa Dieng - Villa Eksklusif dengan Pemandangan Menakjubkan" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.villadiengluxury.com" />
        <meta property="og:site_name" content="Yumna Villa Dieng" />
        <meta property="og:locale" content="id_ID" />
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Yumna Villa Dieng - Villa Eksklusif di Dieng" />
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

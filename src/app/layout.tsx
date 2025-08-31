import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "Villa Dieng Luxury - Penginapan Mewah di Dieng | Villa Paradise",
  description: "Villa eksklusif dengan pemandangan Dieng yang menakjubkan. Fasilitas lengkap, pemandangan pegunungan, dan layanan terbaik untuk pengalaman menginap yang tak terlupakan.",
  keywords: "villa dieng, penginapan dieng, villa luxury, villa dengan view pegunungan, akomodasi dieng, villa terbaik dieng",
  authors: [{ name: "Villa Paradise Dieng" }],
  openGraph: {
    title: "Villa Dieng Luxury - Villa Eksklusif dengan Pemandangan Menakjubkan",
    description: "Villa mewah di Dieng dengan fasilitas lengkap dan pemandangan pegunungan yang memukau. Booking sekarang untuk pengalaman tak terlupakan!",
    type: "website",
    locale: "id_ID",
    url: "https://villa-paradise-dieng.com",
    siteName: "Villa Paradise Dieng",
    images: [
      {
        url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=630",
        width: 1200,
        height: 630,
        alt: "Villa Paradise Dieng - Luxury Villa with Mountain View",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Villa Dieng Luxury - Villa Eksklusif di Dieng",
    description: "Villa mewah dengan pemandangan pegunungan Dieng yang menakjubkan. Fasilitas lengkap & layanan terbaik.",
    images: ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&h=630"],
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
        <link rel="icon" href="/icon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/icon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      </head>
      <body className={`${montserrat.variable}`}>
        {children}
      </body>
    </html>
  );
}

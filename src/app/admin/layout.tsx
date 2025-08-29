import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { AuthProvider } from '@/contexts/AuthContext';
import './admin.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-montserrat',
});

export const metadata: Metadata = {
  title: "Admin Dashboard - Villa Paradise",
  description: "Admin panel untuk mengelola Villa Paradise",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
      <div className={`admin-wrapper ${montserrat.variable}`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </div>
    </>
  );
}
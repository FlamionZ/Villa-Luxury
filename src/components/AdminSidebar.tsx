'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/admin',
      icon: 'fas fa-dashboard',
      label: 'Dashboard',
      isActive: pathname === '/admin'
    },
    {
      href: '/admin/bookings',
      icon: 'fas fa-calendar-check',
      label: 'Bookings',
      isActive: pathname.startsWith('/admin/bookings')
    },
    {
      href: '/admin/villas',
      icon: 'fas fa-home',
      label: 'Villas',
      isActive: pathname.startsWith('/admin/villas')
    },
    {
      href: '/admin/gallery',
      icon: 'fas fa-images',
      label: 'Gallery',
      isActive: pathname.startsWith('/admin/gallery')
    }
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2><i className="fas fa-hotel"></i> Yumna Villa Dieng</h2>
        <p>Admin Dashboard</p>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link 
            key={item.href}
            href={item.href} 
            className={`nav-item ${item.isActive ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </Link>
        ))}
        <a href="/" className="nav-item" target="_blank" rel="noopener noreferrer">
          <i className="fas fa-external-link-alt"></i>
          <span>View Website</span>
        </a>
      </nav>
    </div>
  );
}
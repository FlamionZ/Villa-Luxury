'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center px-6 py-12">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-600 mx-auto mb-8"></div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Halaman Tidak Ditemukan
        </h2>
        
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak dapat ditemukan. 
          Mungkin halaman tersebut telah dipindahkan atau tidak ada.
        </p>
        
        <div className="space-y-4">
          <Link 
            href="/"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-home mr-2"></i>
            Kembali ke Beranda
          </Link>
          
          <div className="flex justify-center space-x-4 mt-6">
            <Link 
              href="/#rooms"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Lihat Villa
            </Link>
            <span className="text-gray-400">•</span>
            <Link 
              href="/#contact"
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
        
        <div className="mt-12 text-gray-500">
          <p className="text-sm">
            Jika Anda yakin ini adalah kesalahan, silakan 
            <Link href="/#contact" className="text-blue-600 hover:underline ml-1">
              hubungi kami
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service in production
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
      <div className="text-center px-6 py-12 max-w-lg">
        <div className="mb-8">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-3xl text-red-500"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Oops! Terjadi Kesalahan
          </h1>
        </div>
        
        <p className="text-gray-600 mb-8">
          Maaf, terjadi kesalahan yang tidak terduga. Tim kami telah diberitahu dan sedang memperbaikinya.
        </p>
        
        <div className="space-y-4">
          <button
            onClick={reset}
            className="inline-block bg-gradient-to-r from-red-500 to-pink-500 text-white px-8 py-3 rounded-full font-semibold hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg mr-4"
          >
            <i className="fas fa-redo mr-2"></i>
            Coba Lagi
          </button>
          
          <Link 
            href="/"
            className="inline-block bg-gray-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <i className="fas fa-home mr-2"></i>
            Kembali ke Beranda
          </Link>
        </div>
        
        <div className="mt-8 text-sm text-gray-500">
          <p>Error ID: {error.digest}</p>
          <p className="mt-2">
            Jika masalah berlanjut, silakan 
            <Link href="/#contact" className="text-red-500 hover:underline ml-1">
              hubungi support
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
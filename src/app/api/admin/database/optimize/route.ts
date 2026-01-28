// API untuk apply database indexes
import { NextResponse } from 'next/server';

// Critical indexes untuk performa optimal
const CRITICAL_INDEXES = [
  {
    name: 'idx_villa_status',
    sql: 'CREATE INDEX IF NOT EXISTS idx_villa_status ON villa_types(status)',
    description: 'Index untuk filter villa aktif'
  },
  {
    name: 'idx_villa_created',
    sql: 'CREATE INDEX IF NOT EXISTS idx_villa_created ON villa_types(created_at)',
    description: 'Index untuk sorting berdasarkan tanggal'
  },
  {
    name: 'idx_amenities_villa',
    sql: 'CREATE INDEX IF NOT EXISTS idx_amenities_villa ON villa_amenities(villa_id)',
    description: 'Index untuk JOIN villa amenities'
  },
  {
    name: 'idx_features_villa', 
    sql: 'CREATE INDEX IF NOT EXISTS idx_features_villa ON villa_features(villa_id)',
    description: 'Index untuk JOIN villa features'
  },
  {
    name: 'idx_images_villa',
    sql: 'CREATE INDEX IF NOT EXISTS idx_images_villa ON villa_images(villa_id)',
    description: 'Index untuk JOIN villa images'
  },
  {
    name: 'idx_images_primary',
    sql: 'CREATE INDEX IF NOT EXISTS idx_images_primary ON villa_images(villa_id, is_primary)',
    description: 'Index untuk query gambar utama'
  },
  {
    name: 'idx_bookings_villa',
    sql: 'CREATE INDEX IF NOT EXISTS idx_bookings_villa ON bookings(villa_id, status)',
    description: 'Index untuk availability checking'
  }
];

export async function POST() {
  return NextResponse.json({
    success: true,
    message: 'Supabase manages indexes via SQL editor or migrations. Apply these in Supabase dashboard if needed.',
    suggestedIndexes: CRITICAL_INDEXES,
    timestamp: new Date().toISOString()
  });
}

// GET untuk check current indexes
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Index inspection is not available via Supabase REST. Use the Supabase SQL editor.',
    suggestedIndexes: CRITICAL_INDEXES
  });
}
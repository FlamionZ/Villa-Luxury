export interface VillaType {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  price?: number; // backward compatibility
  location: string;
  max_guests: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
  amenities?: VillaAmenity[];
  features?: VillaFeature[];
  images?: VillaImage[];
}

export interface VillaAmenity {
  id: number;
  villa_id: number;
  icon: string;
  text: string;
}

export interface VillaFeature {
  id: number;
  villa_id: number;
  feature_text: string;
}

export interface VillaImage {
  id: number;
  villa_id: number;
  image_url: string;
  alt_text: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Booking {
  id: number;
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  extra_bed_count: number;
  extra_bed_price: number;
  extra_bed_total: number;
  total_nights: number;
  total_price: number;
  special_requests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_source: 'website' | 'whatsapp' | 'phone' | 'admin' | 'email' | 'walk-in';
  created_at: Date;
  updated_at: Date;
  villa?: VillaType;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  role: 'super_admin' | 'admin' | 'staff';
  is_active: boolean;
  last_login: Date | null;
  created_at: Date;
}

export interface SiteSetting {
  id: number;
  setting_key: string;
  setting_value: string;
  setting_type: 'text' | 'number' | 'boolean' | 'json';
  description: string;
  updated_at: Date;
}

export interface BookingFormData {
  villa_id: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  check_in: string;
  check_out: string;
  guests_count: number;
  extra_bed_count?: number;
  extra_bed_price?: number;
  special_requests?: string;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  booking_source?: 'website' | 'whatsapp' | 'phone' | 'admin' | 'email' | 'walk-in';
}

export interface VillaFormData {
  slug: string;
  title: string;
  description: string;
  long_description: string;
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
  location: string;
  max_guests: number;
  status: 'active' | 'inactive';
  amenities: Array<{ icon: string; text: string }>;
  features: string[];
  images: Array<{ image_url: string; alt_text: string; is_primary: boolean }>;
}
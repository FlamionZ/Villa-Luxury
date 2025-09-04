// Utility functions for villa pricing based on calendar dates

interface VillaPricing {
  weekday_price: number;
  weekend_price: number;
  high_season_price: number;
}

/**
 * Indonesian National Holidays and Important Dates 2025
 * These dates are considered "High Season" for pricing
 * Updated with correct holidays based on user input
 */
const INDONESIAN_HOLIDAYS_2025 = [
  // New Year
  '2025-01-01',
  
  // Chinese New Year
  '2025-01-29',
  
  // Hari Raya Nyepi (Balinese New Year)
  '2025-03-22',
  
  // Good Friday
  '2025-04-18',
  
  // Labor Day
  '2025-05-01',
  
  // Vesak Day
  '2025-05-12',
  
  // Ascension Day
  '2025-05-29',
  
  // Pancasila Day
  '2025-06-01',
  
  // Independence Day
  '2025-08-17',
  
  // Maulid Nabi Muhammad SAW (September 5) - ONLY high season date in September
  '2025-09-05',
  
  // Christmas Day (December 25) - ONLY high season date in December
  '2025-12-25',
];

/**
 * School Holiday Periods (High Season)
 */
const SCHOOL_HOLIDAYS_2025 = [
  // Mid-year holidays (June-July)
  { start: '2025-06-23', end: '2025-07-13' },
  
  // End of year holidays (December-January)
  { start: '2025-12-14', end: '2026-01-12' }
];

/**
 * Determine the pricing category for a given date
 */
export function getPricingCategory(date: Date): 'weekday' | 'weekend' | 'high_season' {
  const dateString = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Check if it's a national holiday
  if (INDONESIAN_HOLIDAYS_2025.includes(dateString)) {
    return 'high_season';
  }
  
  // Check if it's within school holiday periods
  for (const holiday of SCHOOL_HOLIDAYS_2025) {
    if (dateString >= holiday.start && dateString <= holiday.end) {
      return 'high_season';
    }
  }
  
  // Check if it's weekend (Saturday = 6, Sunday = 0)
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return 'weekend';
  }
  
  // Default to weekday
  return 'weekday';
}

/**
 * Get the appropriate price for a specific date
 */
export function getPriceForDate(date: Date, pricing: VillaPricing): number {
  const category = getPricingCategory(date);
  
  switch (category) {
    case 'weekday':
      return pricing.weekday_price;
    case 'weekend':
      return pricing.weekend_price;
    case 'high_season':
      return pricing.high_season_price;
    default:
      return pricing.weekday_price;
  }
}

/**
 * Calculate total price for a date range
 */
export function calculateTotalPrice(
  checkIn: Date, 
  checkOut: Date, 
  pricing: VillaPricing
): { totalPrice: number; breakdown: Array<{ date: string; category: string; price: number }> } {
  const breakdown: Array<{ date: string; category: string; price: number }> = [];
  let totalPrice = 0;
  
  const current = new Date(checkIn);
  
  while (current < checkOut) {
    const category = getPricingCategory(current);
    const price = getPriceForDate(current, pricing);
    
    breakdown.push({
      date: current.toISOString().split('T')[0],
      category,
      price
    });
    
    totalPrice += price;
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return { totalPrice, breakdown };
}

/**
 * Get display price range for a villa (for marketing purposes)
 */
export function getPriceRange(pricing: VillaPricing): { min: number; max: number; display: string } {
  const prices = [pricing.weekday_price, pricing.weekend_price, pricing.high_season_price];
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  return {
    min,
    max,
    display: min === max ? `Rp ${min.toLocaleString('id-ID')}` : `Rp ${min.toLocaleString('id-ID')} - ${max.toLocaleString('id-ID')}`
  };
}

/**
 * Format date for display
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get next few high season dates (for marketing)
 */
export function getUpcomingHighSeasonDates(limit: number = 5): Array<{ date: string; name: string }> {
  const today = new Date();
  const upcomingDates: Array<{ date: string; name: string }> = [];
  
  // Check upcoming holidays
  for (const holiday of INDONESIAN_HOLIDAYS_2025) {
    const holidayDate = new Date(holiday);
    if (holidayDate > today && upcomingDates.length < limit) {
      upcomingDates.push({
        date: holiday,
        name: getHolidayName(holiday)
      });
    }
  }
  
  return upcomingDates.slice(0, limit);
}

/**
 * Get holiday name for display
 */
function getHolidayName(dateString: string): string {
  const holidayNames: { [key: string]: string } = {
    '2025-01-01': 'Tahun Baru',
    '2025-01-29': 'Imlek',
    '2025-02-27': 'Isra Mi\'raj',
    '2025-03-22': 'Hari Raya Nyepi',
    '2025-04-18': 'Wafat Isa Al Masih',
    '2025-05-01': 'Hari Buruh',
    '2025-05-12': 'Hari Raya Waisak',
    '2025-05-29': 'Kenaikan Isa Al Masih',
    '2025-06-01': 'Hari Pancasila',
    '2025-06-06': 'Hari Raya Idul Fitri',
    '2025-06-07': 'Hari Raya Idul Fitri',
    '2025-08-17': 'Hari Kemerdekaan RI',
    '2025-08-31': 'Hari Raya Idul Adha',
    '2025-09-05': 'Maulid Nabi Muhammad SAW',
    '2025-09-21': 'Tahun Baru Islam',
    '2025-12-25': 'Hari Raya Natal',
    '2025-12-31': 'Malam Tahun Baru'
  };
  
  return holidayNames[dateString] || 'Hari Libur';
}
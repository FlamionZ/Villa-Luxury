// Manual test data untuk melihat pricing display
const testVillaData = {
  id: 1,
  title: "Luxury Ocean Villa",
  slug: "luxury-ocean-villa", 
  description: "Villa mewah dengan pemandangan laut",
  longDescription: "Villa mewah yang terletak di tepi pantai...",
  price: 2500000,
  weekday_price: 2500000,
  weekend_price: 3000000,
  high_season_price: 3750000,
  images: [
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  ],
  amenities: [
    { icon: "fas fa-wifi", text: "WiFi Gratis" },
    { icon: "fas fa-swimming-pool", text: "Kolam Renang" },
    { icon: "fas fa-car", text: "Parkir Gratis" }
  ],
  features: [
    "Kolam Renang Pribadi",
    "Pemandangan Laut",
    "AC di Setiap Kamar",
    "Dapur Lengkap"
  ],
  maxGuests: 4,
  bedrooms: 2,
  bathrooms: 2,
  location: "Bali",
  status: "active"
};

console.log("Test Villa Data with Pricing:", testVillaData);
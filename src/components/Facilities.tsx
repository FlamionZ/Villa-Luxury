'use client';

const facilities = [
  {
    icon: "fas fa-swimming-pool",
    title: "Infinity Pool",
    description: "Kolam renang infinity dengan pemandangan laut yang menakjubkan"
  },
  {
    icon: "fas fa-spa",
    title: "Spa & Wellness",
    description: "Pusat spa dengan terapis profesional dan treatment eksklusif"
  },
  {
    icon: "fas fa-dumbbell",
    title: "Fitness Center",
    description: "Gym modern dengan peralatan terbaru dan personal trainer"
  },
  {
    icon: "fas fa-utensils",
    title: "Fine Dining",
    description: "Restoran mewah dengan chef berpengalaman dan menu internasional"
  },
  {
    icon: "fas fa-wifi",
    title: "Free WiFi",
    description: "Internet berkecepatan tinggi di seluruh area villa"
  },
  {
    icon: "fas fa-car",
    title: "Airport Transfer",
    description: "Layanan antar jemput bandara dengan kendaraan mewah"
  }
];

export default function Facilities() {
  return (
    <section id="facilities" className="facilities">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Fasilitas</span>
          <h2 className="section-title">Fasilitas Kelas Dunia</h2>
        </div>
        <div className="facilities-grid">
          {facilities.map((facility, index) => (
            <div key={index} className="facility-card">
              <div className="facility-icon">
                <i className={facility.icon}></i>
              </div>
              <h3>{facility.title}</h3>
              <p>{facility.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

'use client';

import Image from 'next/image';

const testimonials = [
  {
    id: 1,
    content: "Pengalaman menginap yang luar biasa! Villa Dieng Luxury benar-benar memberikan kenyamanan dan kemewahan yang tak terlupakan. Stafnya sangat ramah dan profesional.",
    author: {
      name: "John Doe",
      title: "CEO, Tech Company",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  },
  {
    id: 2,
    content: "Villa yang sangat indah dengan pemandangan yang menakjubkan. Fasilitas lengkap dan pelayanan terbaik. Pasti akan kembali lagi!",
    author: {
      name: "Sarah Johnson",
      title: "Travel Blogger",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  },
  {
    id: 3,
    content: "Bulan madu kami di Villa Dieng Luxury sangat sempurna. Suasana romantis, makanan lezat, dan pelayanan yang sangat memuaskan.",
    author: {
      name: "Michael Brown",
      title: "Newlywed",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80"
    }
  }
];

export default function Testimonials() {
  return (
    <section className="testimonials">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-subtitle">Testimoni</span>
          <h2 className="section-title">Apa Kata Tamu Kami</h2>
        </div>
        <div className="testimonials-grid">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-content">
                <div className="testimonial-stars">
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                  <i className="fas fa-star"></i>
                </div>
                <p>&ldquo;{testimonial.content}&rdquo;</p>
              </div>
              <div className="testimonial-author">
                <Image 
                  src={testimonial.author.image} 
                  alt={testimonial.author.name}
                  width={60}
                  height={60}
                />
                <div>
                  <h4>{testimonial.author.name}</h4>
                  <span>{testimonial.author.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

# Manual Booking System - Admin Dashboard

## Fitur Baru: Admin Manual Booking

Sekarang admin dapat menambahkan booking villa secara manual melalui dashboard admin. Fitur ini cocok untuk sistem pembayaran yang dilakukan melalui WhatsApp dengan admin.

### Cara Menggunakan

1. **Login ke Admin Dashboard**: Akses `/admin` dan login dengan kredensial admin
2. **Navigasi ke Bookings**: Klik menu "Bookings" di sidebar
3. **Tambah Booking Baru**: Klik tombol "+ New Booking" di header
4. **Isi Form Booking**: Lengkapi semua field yang diperlukan

### Form Booking Manual

#### Villa Information
- **Select Villa**: Pilih villa dari dropdown (menampilkan harga dan kapasitas maksimal)

#### Guest Information
- **Guest Name**: Nama lengkap tamu
- **Guest Email**: Email tamu (dengan validasi format)
- **Guest Phone**: Nomor telepon tamu
- **Number of Guests**: Jumlah tamu (dibatasi sesuai kapasitas villa)

#### Booking Details
- **Check-in Date**: Tanggal check-in (tidak boleh di masa lalu)
- **Check-out Date**: Tanggal check-out (harus setelah check-in)
- **Booking Status**: 
  - `Pending` - Menunggu konfirmasi
  - `Confirmed` - Booking dikonfirmasi
  - `Cancelled` - Booking dibatalkan
  - `Completed` - Booking selesai
- **Booking Source**: Sumber booking (Admin, WhatsApp, Phone, Email, Walk-in)
- **Special Requests**: Permintaan khusus dari tamu (opsional)

### Fitur Otomatis

#### Validasi Real-time
- ✅ **Conflict Detection**: Sistem mengecek ketersediaan villa untuk tanggal yang dipilih
- ✅ **Capacity Validation**: Jumlah tamu tidak boleh melebihi kapasitas villa
- ✅ **Date Validation**: Check-out harus setelah check-in, tidak boleh masa lalu
- ✅ **Email Validation**: Format email divalidasi

#### Kalkulasi Otomatis
- 🧮 **Total Nights**: Dihitung otomatis berdasarkan tanggal
- 💰 **Total Price**: Dihitung otomatis (harga villa × total malam)
- 📊 **Booking Summary**: Menampilkan ringkasan biaya secara real-time

### API Endpoints

#### Booking Management
- `GET /api/admin/bookings` - List semua booking
- `POST /api/admin/bookings` - Buat booking baru
- `GET /api/admin/bookings/[id]` - Detail booking
- `PUT /api/admin/bookings/[id]` - Update booking
- `DELETE /api/admin/bookings/[id]` - Hapus booking

#### Villa Data
- `GET /api/admin/villas` - List villa untuk dropdown selection

### Database Schema

```sql
-- Table: bookings
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  villa_id INT NOT NULL,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(50) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests_count INT NOT NULL,
  total_nights INT NOT NULL,
  total_price DECIMAL(12,2) NOT NULL,
  special_requests TEXT,
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  booking_source VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (villa_id) REFERENCES villa_types(id)
);
```

### Workflow Pembayaran

1. **Customer Contact**: Tamu menghubungi admin via WhatsApp untuk booking
2. **Manual Entry**: Admin membuat booking manual di dashboard
3. **Payment Coordination**: Admin koordinasi pembayaran via WhatsApp/transfer bank
4. **Status Update**: Admin update status booking setelah pembayaran diterima
5. **Confirmation**: Tamu menerima konfirmasi booking

### Keamanan

- ✅ **Admin Authentication**: Hanya admin yang terautentikasi bisa akses
- ✅ **Form Validation**: Validasi komprehensif di frontend dan backend
- ✅ **SQL Injection Protection**: Menggunakan prepared statements
- ✅ **CSRF Protection**: Token CSRF untuk form submission

### Mobile Responsive

Dashboard admin dan form booking telah dioptimasi untuk perangkat mobile, memungkinkan admin mengelola booking dari smartphone.

---

**Status**: ✅ Implemented & Ready
**Version**: 1.0
**Last Updated**: August 22, 2025
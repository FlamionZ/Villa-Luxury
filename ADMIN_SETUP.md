# Villa Paradise - Admin Dashboard Setup Guide

## Prerequisites
- Node.js 18+ installed
- MySQL server running
- Git (optional)

## Installation Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Create a `.env.local` file in the root directory with:
```
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=villa_paradise

# Next.js Configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Admin Configuration
ADMIN_DEFAULT_PASSWORD=admin123
```

### 3. Initialize Database
Make sure MySQL server is running, then execute:
```bash
npm run init-db
```

This will:
- Create the `villa_paradise` database
- Create all required tables
- Insert sample data
- Create default admin user

### 4. Start Development Server
```bash
npm run dev
```

### 5. Access Admin Dashboard
Open your browser and navigate to:
- Website: http://localhost:3000
- Admin Dashboard: http://localhost:3000/admin

**Default Admin Credentials:**
- Username: Villadiengluxury
- Password: admin123

## Features

### Admin Dashboard
- **Dashboard Overview**: Statistics and recent bookings
- **Bookings Management**: CRUD operations for bookings
- **Villas Management**: CRUD operations for villa types
- **Settings**: Site configuration

### Booking System
- Interactive calendar with availability checking
- Real-time booking conflicts detection
- Multiple booking sources tracking
- Status management (pending, confirmed, cancelled, completed)

### Villa Management
- Complete villa information management
- Multiple images per villa
- Amenities and features management
- Price and availability control

### Database Schema
- **villa_types**: Main villa information
- **villa_amenities**: Villa amenities with icons
- **villa_features**: Villa features list
- **villa_images**: Villa photo gallery
- **bookings**: Booking records
- **admin_users**: Admin authentication
- **site_settings**: System configuration

## API Endpoints

### Villas
- `GET /api/admin/villas` - List all villas
- `POST /api/admin/villas` - Create new villa
- `GET /api/admin/villas/[id]` - Get villa details
- `PUT /api/admin/villas/[id]` - Update villa
- `DELETE /api/admin/villas/[id]` - Delete villa

### Bookings
- `GET /api/admin/bookings` - List all bookings
- `POST /api/admin/bookings` - Create new booking
- `GET /api/admin/bookings/[id]` - Get booking details
- `PUT /api/admin/bookings/[id]` - Update booking
- `DELETE /api/admin/bookings/[id]` - Delete booking

## File Structure
```
src/
├── app/
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── bookings/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── villas/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   └── api/admin/
│       ├── villas/
│       └── bookings/
├── components/
│   └── admin/
│       └── VillaForm.tsx
├── types/
│   └── database.ts
└── lib/
    └── db.ts

database/
└── schema.sql

scripts/
└── init-db.js
```

## Security Notes
- Change default admin password immediately
- Use environment variables for sensitive data
- Implement proper authentication in production
- Add input validation and sanitization
- Use HTTPS in production

## Production Deployment
1. Set up production MySQL database
2. Update environment variables
3. Run database initialization
4. Deploy to your preferred platform (Vercel, Netlify, etc.)
5. Configure domain and SSL

## Troubleshooting

### Database Connection Issues
- Verify MySQL server is running
- Check database credentials in `.env.local`
- Ensure database user has proper permissions

### Import Path Errors
- Run `npm install` to ensure all dependencies are installed
- Check file paths are correct
- Restart development server

### Permission Errors
- Ensure MySQL user has CREATE DATABASE privileges
- Check file system permissions for uploads (if implemented)

## Support
For issues and questions, please check:
1. Error logs in browser console
2. Server logs in terminal
3. Database connection status
4. Environment variables configuration
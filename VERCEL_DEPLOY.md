# Vercel Deployment Guide

## 1. Setup Environment Variables di Vercel

Masuk ke dashboard Vercel dan tambahkan environment variables berikut:

### Database Configuration
```
DATABASE_URL=mysql://dbpgf28171728:YOUR_PASSWORD@serverless-us-central1.sysp0000.db2.skysql.com:4005/dbpgf28171728?sslmode=require
DB_HOST=serverless-us-central1.sysp0000.db2.skysql.com
DB_USER=dbpgf28171728
DB_PASSWORD=YOUR_PASSWORD
DB_NAME=dbpgf28171728
DB_PORT=4005
```

### Application Configuration
```
NEXTAUTH_SECRET=your-super-secret-key-at-least-32-characters
NEXTAUTH_URL=https://your-app-name.vercel.app
ADMIN_DEFAULT_PASSWORD=your-secure-admin-password
```

## 2. Deploy Steps

1. **Push code ke GitHub:**
   ```bash
   git add .
   git commit -m "Setup PlanetScale database integration"
   git push origin main
   ```

2. **Connect repository di Vercel:**
   - Go to https://vercel.com/dashboard
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables
   - Deploy

3. **Setup database setelah deploy:**
   - Pastikan environment variables sudah diset
   - Database schema akan otomatis dibuat saat pertama kali API dipanggil
   - Atau jalankan setup manual via Vercel Functions

## 3. Database Features

✅ **Serverless MySQL** dengan PlanetScale/SkySql
✅ **SSL Connection** untuk keamanan
✅ **Auto-scaling** sesuai traffic
✅ **Connection pooling** otomatis
✅ **Global edge locations**

## 4. Monitor & Maintain

- **Logs**: Monitor via Vercel dashboard
- **Database**: Monitor via PlanetScale dashboard
- **Performance**: Check Core Web Vitals di Vercel Analytics

## 5. Backup Strategy

Database di PlanetScale sudah include:
- Automatic daily backups
- Point-in-time recovery
- Multi-region replication
- 99.99% uptime SLA
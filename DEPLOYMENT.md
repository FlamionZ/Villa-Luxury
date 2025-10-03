# 🚀 Production Deployment Guide - Villa Paradise

## Pre-Deployment Checklist

### ✅ 1. Environment Setup
- [ ] Copy `.env.production.template` to `.env.local`
- [ ] Update all environment variables with production values
- [ ] Generate strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] Set correct `NEXTAUTH_URL` to your domain
- [ ] Change default admin password

### ✅ 2. Database Setup
- [ ] Setup production MySQL database
- [ ] Run `npm run init-db` on production server
- [ ] Verify all tables are created
- [ ] Test database connectivity

### ✅ 3. Security Verification
- [ ] All admin credentials changed from defaults
- [ ] HTTPS enabled on production domain
- [ ] Security headers configured in `next.config.ts`
- [ ] No sensitive data in client-side code

### ✅ 4. Performance Optimization
- [ ] Images optimized and using WebP format
- [ ] CDN configured for static assets (optional)
- [ ] Database queries optimized
- [ ] CSS/JS minified (automatic in production build)

## Deployment Options

### Option 1: Vercel (Recommended - Easy)

1. **Connect Repository**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Ready for production"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables
   - Deploy automatically

3. **Database Connection**
   - Use PlanetScale, Railway, or any MySQL provider
   - Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in Vercel settings

### Option 2: VPS/Dedicated Server

1. **Server Setup**
   ```bash
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   npm install -g pm2
   
   # Install MySQL
   sudo apt-get install mysql-server
   ```

2. **Application Deployment**
   ```bash
   # Clone repository
   git clone https://github.com/your-username/villa-paradise.git
   cd villa-paradise
   
   # Install dependencies
   npm install
   
   # Setup environment
   cp .env.production.template .env.local
   # Edit .env.local with your production values
   
   # Initialize database
   npm run init-db
   
   # Build application
   npm run build
   
   # Start with PM2
   pm2 start ecosystem.config.js
   ```

3. **Nginx Configuration**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

### Option 3: Docker Deployment

1. **Create Dockerfile**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Docker Compose**
   ```yaml
   version: '3.8'
   services:
     app:
       build: .
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
       depends_on:
         - mysql
     
     mysql:
       image: mysql:8.0
       environment:
         MYSQL_ROOT_PASSWORD: your-password
         MYSQL_DATABASE: villa_paradise
       volumes:
         - mysql_data:/var/lib/mysql
   
   volumes:
     mysql_data:
   ```

## Post-Deployment

### 1. Testing
- [ ] Test all pages load correctly
- [ ] Test admin login functionality
- [ ] Test booking form submission
- [ ] Test gallery management
- [ ] Test on mobile devices

### 2. Monitoring
- [ ] Setup error monitoring (Sentry, LogRocket)
- [ ] Setup uptime monitoring
- [ ] Setup Google Analytics
- [ ] Monitor database performance

### 3. SEO
- [ ] Submit sitemap to Google Search Console
- [ ] Setup Google My Business
- [ ] Test Core Web Vitals
- [ ] Verify meta tags and Open Graph

### 4. Backup
- [ ] Setup automatic database backups
- [ ] Test backup restoration process
- [ ] Document backup procedures

## Maintenance

### Regular Tasks
- [ ] Update dependencies monthly
- [ ] Monitor error logs
- [ ] Check security updates
- [ ] Performance monitoring
- [ ] Database optimization

### Security Updates
- [ ] Change admin passwords quarterly
- [ ] Update SSL certificates
- [ ] Review access logs
- [ ] Update security headers

## Support Contacts

- **Technical Issues**: Create GitHub issue
- **Urgent Production Issues**: Contact system administrator
- **Database Issues**: Check connection strings and credentials

---

## 🎯 Final Notes

This application is production-ready with:
- ✅ Secure authentication
- ✅ Responsive design
- ✅ SEO optimization
- ✅ Error handling
- ✅ Performance optimization
- ✅ Security headers
- ✅ Database management

**Remember**: Always test in staging environment before production deployment!
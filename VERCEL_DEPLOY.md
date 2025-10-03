# Vercel Deployment Guide - Villa Dieng Luxury

## 🚀 Complete Deployment Process

### 1. Environment Variables Setup

Go to Vercel Dashboard → Your Project → Settings → Environment Variables and add:

```bash
# Database Configuration
DB_HOST=serverless-us-central1.sysp0000.db2.skysql.com
DB_USER=dbpgf28171728
DB_PASSWORD=7UGXOPGo*iXY3iqN6?Asi
DB_NAME=dbpgf28171728
DB_PORT=4005

# Authentication
NEXTAUTH_SECRET=fa1370786a68f8ef60ddcc1aa15d2d5da67a23fc6b2a622febfb6cc6130a7bf3
NEXTAUTH_URL=https://www.villadiengluxury.com

# Admin Configuration
ADMIN_DEFAULT_PASSWORD=Mandadanyumna

# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=dx1s8fbyp
CLOUDINARY_API_KEY=198296466133379
CLOUDINARY_API_SECRET=5r4DPsSIOERoH6raC0PFDFYmmuc

# Environment
NODE_ENV=production
```

### 2. Deploy Commands

```bash
git add .
git commit -m "Deploy with enhanced debugging"
git push origin main
```

### 3. Testing After Deployment

#### A. Test Database Connection
1. Go to: `https://www.villadiengluxury.com/api/admin/debug/database`
2. Login first, then access this endpoint
3. Should return database connection test results

#### B. Test Villa Creation
1. Go to: `https://www.villadiengluxury.com/admin`
2. Login: `Villadiengluxury` / `Mandadanyumna`
3. Navigate to Villas → New Villa
4. Fill required fields and submit

### 4. Debugging Production Issues

#### Check Vercel Function Logs:
1. Vercel Dashboard → Your Project → Functions
2. Click on `/api/admin/villas` function
3. View real-time logs

#### Expected Success Logs:
```
=== VILLA CREATION DEBUG START ===
✅ ADMIN VERIFIED
✅ REQUEST BODY PARSED
✅ VALIDATION PASSED
✅ DATABASE CONNECTION ESTABLISHED
✅ CONNECTION TEST PASSED
📝 INSERTING VILLA INTO DATABASE...
✅ VILLA INSERTED SUCCESSFULLY
🎉 VILLA CREATION COMPLETED SUCCESSFULLY
```

#### Common Error Patterns:

**Database Connection Issues:**
```
❌ DATABASE CONNECTION ERROR
Error code: ECONNREFUSED / ETIMEDOUT
```
**Solution:** Check DB_HOST, DB_PORT environment variables

**Authentication Issues:**
```
❌ UNAUTHORIZED: Admin verification failed
```
**Solution:** Check NEXTAUTH_SECRET, verify login session

**Missing Environment Variables:**
```
DB Config Check: { DB_HOST: 'NOT SET', ... }
```
**Solution:** Verify all environment variables in Vercel dashboard

**SQL Errors:**
```
Error code: ER_NO_SUCH_TABLE
```
**Solution:** Database schema not created, run migration scripts

### 5. Manual Database Check

If villa creation fails, verify database manually:

1. Connect to SkySql database
2. Check tables exist:
   ```sql
   SHOW TABLES;
   ```
3. Verify structure:
   ```sql
   DESCRIBE villa_types;
   ```

### 6. Emergency Fallback

If production issues persist:

1. Check database status at SkySql dashboard
2. Verify IP whitelist (Vercel uses dynamic IPs)
3. Test with local environment using production DB
4. Contact database provider if connection fails

### 7. Performance Monitoring

- Monitor function execution time in Vercel
- Check database connection pool metrics
- Watch for timeout errors in logs

### 8. Domain Configuration

Ensure domain is properly configured:
- Primary: `www.villadiengluxury.com`
- Redirect: `villadiengluxury.com` → `www.villadiengluxury.com`
- SSL certificate active

---

## 🔧 Troubleshooting Checklist

- [ ] All environment variables set in Vercel
- [ ] Database connection test passes
- [ ] Admin login working
- [ ] Vercel function logs accessible
- [ ] SSL certificate valid
- [ ] Domain DNS properly configured

---

## 📞 Support

If issues persist after following this guide:
1. Export Vercel function logs
2. Note exact error messages
3. Check database provider status
4. Test with different browsers/devices
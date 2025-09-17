# Admin Login Debug & Fix Guide

## 🚨 Problem: Cannot Access Admin Dashboard

### ✅ Solutions Implemented:

1. **Enhanced Login Debugging** ✅
   - Detailed step-by-step logging in login API
   - Database connection verification
   - Password validation logging
   - JWT token generation tracking

2. **Admin User Setup Endpoint** ✅
   - `/api/admin/setup` to create/reset admin user
   - Automatic table creation
   - Password reset functionality

3. **Admin User Debug Endpoint** ✅
   - `/api/admin/debug/users` to check admin users
   - Table existence verification
   - User status checking

## 🚀 Step-by-Step Fix Process:

### 1. Deploy Latest Code:
```bash
git add .
git commit -m "Fix admin login with debugging"
git push origin main
```

### 2. Setup Admin User:
After deployment, visit:
```
https://www.villadiengluxury.com/api/admin/setup
```
This will:
- Create admin_users table if needed
- Create/reset admin user: `Villadiengluxury`
- Set password: `Mandadanyumna`

### 3. Verify Admin User:
Visit:
```
https://www.villadiengluxury.com/api/admin/debug/users
```
Should show admin user exists and is active.

### 4. Test Login:
Go to:
```
https://www.villadiengluxury.com/admin
```
Use credentials:
- Username: `Villadiengluxury`
- Password: `Mandadanyumna`

### 5. Check Login Logs:
If login fails, check Vercel Function logs for detailed error messages:
- Vercel Dashboard → Functions → `/api/admin/auth/login`

## 📊 Expected Success Logs:

```
=== ADMIN LOGIN DEBUG START ===
Login attempt for username: Villadiengluxury
🔗 Connecting to database...
✅ Database connected
🔍 Checking admin_users table...
Admin_users table exists: true
🔍 Searching for admin user...
Query result count: 1
✅ Admin user found: { id: 1, username: 'Villadiengluxury', role: 'admin' }
🔐 Verifying password...
Password valid: true
✅ Password verified successfully
📝 Updating last login...
✅ Last login updated
🔄 Database connection released
🎫 Generating JWT token...
JWT secret available: true
✅ JWT token generated
🍪 Setting admin token cookie...
✅ Cookie set successfully
🎉 LOGIN SUCCESSFUL
```

## 🔧 Common Issues & Solutions:

### Issue: "Admin system not initialized"
**Solution:** Visit `/api/admin/setup` first

### Issue: "Invalid username or password"
**Solutions:**
1. Verify credentials: `Villadiengluxury` / `Mandadanyumna`
2. Check if user exists: `/api/admin/debug/users`
3. Reset user: `/api/admin/setup`

### Issue: "Account is inactive"
**Solution:** User exists but is disabled, reset via `/api/admin/setup`

### Issue: "Database connection failed"
**Solution:** Check environment variables in Vercel

### Issue: Login works but dashboard redirect fails
**Solutions:**
1. Clear browser cache/cookies
2. Check if NEXTAUTH_SECRET is set in Vercel
3. Verify NEXTAUTH_URL matches domain

## 🛠️ Manual Database Check:

If automated setup fails, manually verify database:

1. Connect to SkySql database
2. Check table:
   ```sql
   SHOW TABLES LIKE 'admin_users';
   ```
3. Check user:
   ```sql
   SELECT * FROM admin_users WHERE username = 'Villadiengluxury';
   ```
4. Reset password manually if needed:
   ```sql
   UPDATE admin_users SET password_hash = '$2a$12$...' WHERE username = 'Villadiengluxury';
   ```

## 📞 Support Steps:

If login still fails after following this guide:

1. **Export Vercel Function Logs** from `/api/admin/auth/login`
2. **Check Database Status** at SkySql dashboard
3. **Verify Environment Variables** in Vercel:
   - NEXTAUTH_SECRET
   - NEXTAUTH_URL
   - ADMIN_DEFAULT_PASSWORD
   - All database credentials

4. **Test API Endpoints**:
   - `/api/admin/setup` (should return success)
   - `/api/admin/debug/users` (should show user)
   - `/api/admin/debug/database` (should pass connection test)

## 🎯 Expected Result:

After following this guide, you should be able to:
- ✅ Access admin setup endpoint
- ✅ Create/verify admin user
- ✅ Login to admin dashboard successfully
- ✅ Access all admin features

---

**Login Credentials:**
- **URL**: https://www.villadiengluxury.com/admin
- **Username**: Villadiengluxury
- **Password**: Mandadanyumna
# 🚨 MySQL Setup Required - Villa Paradise

## Problem
Error `ECONNREFUSED` indicates that MySQL server is not running or not installed on your system.

## 🔧 Quick Solutions

### Option 1: Install XAMPP (Recommended for Windows - Easy)
1. **Download XAMPP**: https://www.apachefriends.org/download.html
2. **Install XAMPP** with default settings
3. **Start XAMPP Control Panel**
4. **Start MySQL service** (click "Start" button next to MySQL)
5. **Update .env.local** if needed:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=villa_paradise
   ```

### Option 2: Install MySQL Community Server
1. **Download**: https://dev.mysql.com/downloads/mysql/
2. **Install** with default settings
3. **Remember the root password** you set during installation
4. **Update .env.local**:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password_here
   DB_NAME=villa_paradise
   ```

### Option 3: Use Docker (Advanced)
```bash
# Run MySQL in Docker
docker run --name villa-mysql -e MYSQL_ROOT_PASSWORD=password -p 3306:3306 -d mysql:8.0

# Update .env.local
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=villa_paradise
```

### Option 4: Use SQLite (Alternative - No MySQL needed)
If you want to proceed without MySQL, I can modify the project to use SQLite instead.

## 🚀 After MySQL is Running

1. **Test connection**:
   ```bash
   npm run init-db
   ```

2. **If successful, start the app**:
   ```bash
   npm run dev
   ```

3. **Access admin dashboard**:
   - Website: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - Login: admin / admin123

## 🔍 Troubleshooting

### Check if MySQL is running:
```bash
# Windows
net start MySQL
# or
net start MySQL80

# Check services
services.msc
```

### Test MySQL connection manually:
```bash
mysql -u root -p
```

### Common Issues:
- **Port 3306 occupied**: Change port in .env.local
- **Access denied**: Check username/password
- **Service won't start**: Restart computer or reinstall

## 💡 Recommendation

**For quickest setup, use XAMPP:**
1. Download and install XAMPP
2. Start MySQL from XAMPP Control Panel
3. Run `npm run init-db`
4. Start development with `npm run dev`

Need help? Let me know which option you'd prefer and I'll guide you through it!
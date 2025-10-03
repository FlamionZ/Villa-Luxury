# 🔧 TROUBLESHOOTING GUIDE

## Error: `controller[kState].transformAlgorithm is not a function`

### 🚨 **Masalah:**
```
⨯ [TypeError: controller[kState].transformAlgorithm is not a function] {
  digest: '241461441'
}
```

### 📋 **Penyebab:**
- Error internal Next.js 15.4.6 dengan Turbopack (experimental feature)
- Turbopack masih dalam tahap development dan memiliki bugs
- Konflik dengan stream processing di development mode

### ✅ **Solusi:**

#### **Opsi 1: Gunakan Mode Safe (Recommended)**
```bash
npm run dev:safe
```

#### **Opsi 2: Manual tanpa Turbopack**
```bash
next dev
```

#### **Opsi 3: Update package.json**
```json
{
  "scripts": {
    "dev": "next dev --turbopack",
    "dev:safe": "next dev",
    "dev:legacy": "next dev --no-turbopack"
  }
}
```

### 🎯 **Hasil Setelah Fix:**
- ✅ Server berjalan normal di `http://localhost:3000`
- ✅ Tidak ada error `transformAlgorithm`
- ✅ Kompilasi berjalan lancar
- ✅ Upload functionality tetap bekerja
- ✅ Simple Browser VS Code berfungsi normal

### 💡 **Tips Pencegahan:**
1. **Development**: Gunakan `npm run dev:safe` untuk stability
2. **Production**: Gunakan `npm run build && npm start`
3. **Testing**: Turbopack boleh digunakan untuk testing performance
4. **CI/CD**: Selalu gunakan standard Next.js build

### 🔄 **Kapan Menggunakan Masing-masing Mode:**

| Mode | Command | Kapan Digunakan |
|------|---------|-----------------|
| **Safe** | `npm run dev:safe` | ✅ Development normal, debugging |
| **Turbopack** | `npm run dev` | ⚠️ Testing performance, experimental |
| **Production** | `npm run build` | 🚀 Deploy ke production |

### 📊 **Performance Comparison:**
- **Standard Next.js**: Stable, proven, slower cold start
- **Turbopack**: Faster, experimental, potential bugs
- **Production Build**: Optimized, fastest runtime

---

## 🛠️ **Solusi Error Lainnya:**

### Port Already in Use
```bash
# Check port usage
netstat -ano | findstr :3000

# Kill process
taskkill /PID [PID_NUMBER] /F
```

### Node.js Process Cleanup
```bash
# Windows
taskkill /F /IM node.exe

# Or restart with different port
npm run dev:safe -- --port 3001
```

### Cache Issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev:safe
```

---

## ✅ **Verifikasi Fix Berhasil:**

1. ✅ Server start tanpa error
2. ✅ Halaman load normal
3. ✅ Upload functionality working
4. ✅ No console errors
5. ✅ Simple Browser accessible

**Status: RESOLVED** ✅
# 🔒 Panduan Deploy Aman ke Vercel

## ✅ Status Keamanan Saat Ini

### AMAN ✓
- ✅ `.env.local` tidak ter-commit ke Git
- ✅ Tidak ada hardcoded credentials di code
- ✅ API routes menggunakan environment variables
- ✅ Discord Token hanya digunakan di server-side
- ✅ Lanyard API adalah public API (tidak perlu auth)

### PERLU PERHATIAN ⚠️
- ⚠️ Discord Bot Token terlihat di file `.env.local` local
- ⚠️ Pastikan tidak pernah ter-commit atau ter-push ke GitHub

---

## 📋 Checklist Sebelum Deploy

### 1. Cek Git History (PENTING!)
```bash
# Pastikan .env.local tidak pernah ter-commit
git log --all --full-history --source -- .env.local

# Cek apakah ada file env yang ter-track
git ls-files | grep env

# Jika ada, hapus dari history dengan:
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all
```

### 2. Regenerate Discord Bot Token (WAJIB!)
Karena token sudah terlihat di chat/screen:
1. Buka [Discord Developer Portal](https://discord.com/developers/applications)
2. Pilih Bot kamu
3. Klik "Bot" di sidebar
4. Klik "Reset Token"
5. Copy token baru
6. Update `.env.local` dengan token baru

### 3. Pastikan .gitignore Benar
File `.gitignore` sudah benar:
```
.env*
```
Ini akan ignore semua file yang dimulai dengan `.env`

---

## 🚀 Deploy ke Vercel

### Step 1: Push ke GitHub
```bash
# Pastikan semua perubahan sudah di-commit (TANPA .env.local)
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Setup di Vercel
1. Login ke [Vercel](https://vercel.com)
2. Import repository dari GitHub
3. **JANGAN** deploy dulu!

### Step 3: Tambahkan Environment Variables di Vercel
Di Vercel dashboard → Settings → Environment Variables, tambahkan:

#### Production Environment:
```
DISCORD_TOKEN=<token_baru_setelah_regenerate>
DISCORD_USER_ID=494169184175915019
```

#### Preview/Development (Optional):
Sama seperti production, atau bisa beda jika mau test dengan bot/user lain.

### Step 4: Deploy
Setelah environment variables di-set, klik "Deploy"

---

## 🔐 Keamanan API Routes

### API yang Aman untuk Deploy:

#### 1. `/api/discord-avatar` ✅
- **Secure**: Token hanya ada di server-side
- **Safe**: Client hanya terima avatar URL
- **Risk**: Minimal - hanya bisa fetch avatar public

#### 2. `/api/discord-status` ✅
- **Secure**: Menggunakan Lanyard public API
- **No Auth Required**: Tidak perlu token
- **Risk**: None - data Discord presence sudah public

#### 3. `/api/roblox-profile` ✅
- **Secure**: Proxy untuk Roblox public API
- **No Auth Required**: Public data
- **Risk**: None - hanya fetch public profile

---

## 🛡️ Best Practices yang Sudah Diterapkan

### ✅ Yang Sudah Benar:
1. **Server-side API Calls**
   - Semua call ke Discord API dilakukan di API routes
   - Client tidak pernah akses Discord Token

2. **Environment Variables**
   - Credentials disimpan di `.env.local`
   - Tidak hardcoded di code

3. **Error Handling**
   - Tidak expose internal error details
   - Generic error messages ke client

4. **Rate Limiting**
   - Lanyard API sudah handle rate limiting
   - Discord API juga sudah ada rate limit handling

### 📌 Rekomendasi Tambahan:

#### 1. Tambahkan Rate Limiting (Optional)
Untuk mencegah abuse, tambahkan rate limiting di API routes:
```bash
bun add @upstash/ratelimit @upstash/redis
```

#### 2. Cache Response (Optional)
Cache Discord status untuk reduce API calls:
```typescript
// Di API route
export const revalidate = 30; // Cache for 30 seconds
```

#### 3. Monitor API Usage
- Cek Vercel Analytics untuk unusual traffic
- Monitor Discord Bot token usage di Developer Portal

---

## 🚨 Jika Token Ter-expose

### Langkah Darurat:
1. **Regenerate Token SEGERA** di Discord Developer Portal
2. **Update Vercel Environment Variables** dengan token baru
3. **Redeploy** aplikasi
4. **Cek Bot Activity** di Discord untuk aktivitas mencurigakan

### Cek Jika Token Ter-commit:
```bash
# Search di semua commit history
git log -p -S "MTM5OTk4NTk1MDk2MDEyODA2Mg" --all

# Atau search dengan grep
git grep "MTM5OTk4NTk1MDk2MDEyODA2Mg" $(git rev-list --all)
```

Jika ketemu, **WAJIB**:
1. Regenerate token
2. Clean Git history (gunakan git filter-branch)
3. Force push (HATI-HATI!)

---

## ✅ Final Checklist Before Deploy

- [ ] `.env.local` tidak ter-track di Git
- [ ] Tidak ada hardcoded secrets di code
- [ ] Discord Bot Token sudah di-regenerate (karena terlihat)
- [ ] Environment variables sudah di-set di Vercel
- [ ] `.gitignore` sudah benar
- [ ] Test di local dulu dengan `bun run build`
- [ ] Push ke GitHub (tanpa `.env.local`)
- [ ] Deploy di Vercel

---

## 📞 Support

Jika ada masalah:
1. Check Vercel deployment logs
2. Check browser console untuk client errors
3. Check Vercel Function logs untuk server errors

---

## 🎯 Kesimpulan

**AMAN UNTUK DEPLOY** ✅

Selama:
- `.env.local` tidak di-commit
- Environment variables di-set di Vercel
- Discord Token di-regenerate sebelum deploy

**Security Score: 9/10** 🔒

Minus 1 karena Discord Token sempat terlihat (meskipun tidak ter-commit), jadi **WAJIB regenerate** sebelum production deploy!

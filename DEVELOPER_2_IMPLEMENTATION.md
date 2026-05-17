# Developer 2 - Property Management Service (Rafi Kamasyamsi)

## 📋 Implementasi Selesai

### 1. **Database Models**

#### Model: `Kamar` (app/Models/Kamar.php)
- Primary Key: `id` (BIGINT)
- Fields:
  - `nomor_kamar` (VARCHAR 10, UNIQUE)
  - `tipe` (VARCHAR 50) - standar, deluxe, VIP
  - `harga_per_bulan` (DECIMAL 12,2)
  - `fasilitas` (JSON) - array fasilitas
  - `status` (ENUM) - tersedia atau terisi
  - `created_at`, `updated_at` (TIMESTAMP)
  - `deleted_at` (TIMESTAMP, NULLABLE) - untuk Soft Deletes
- Relations:
  - `penyewa()` - hasMany
  - `penyewaAktif()` - hasOne (tenant aktif tanpa tanggal_keluar)

#### Model: `Penyewa` (app/Models/Penyewa.php)
- Primary Key: `id` (BIGINT)
- Fields:
  - `kamar_id` (BIGINT, FK)
  - `nama` (VARCHAR 100)
  - `no_identitas` (VARCHAR 30)
  - `no_telepon` (VARCHAR 20)
  - `tanggal_masuk` (DATE)
  - `tanggal_keluar` (DATE, NULLABLE)
  - `durasi_kontrak` (INT) - dalam bulan
  - `created_at`, `updated_at` (TIMESTAMP)
  - `deleted_at` (TIMESTAMP, NULLABLE) - untuk Soft Deletes
- Relations:
  - `kamar()` - belongsTo
  - `pembayaran()` - hasMany
- Methods:
  - `isAktif()` - check apakah penyewa masih aktif
  - `akanHabis()` - check apakah kontrak akan berakhir dalam 30 hari

### 2. **Database Migrations**

#### Migration 1: `2026_05_17_115509_create_kamar_table.php`
- Membuat tabel `kamar` dengan struktur lengkap
- Menggunakan Soft Deletes untuk preservasi data historis

#### Migration 2: `2026_05_17_115536_create_penyewa_table.php`
- Membuat tabel `penyewa` dengan struktur lengkap
- Foreign key constraint: `kamar_id` → `kamar.id` dengan `onDelete: restrict`
- Menggunakan Soft Deletes

**Cara menjalankan migrations:**
```bash
cd c:\laragon\www\PengelolaKosTis
php artisan migrate
```

### 3. **API Controllers**

#### KamarController (app/Http/Controllers/KamarController.php)
Endpoints:
- `GET /api/kamar` - List semua kamar dengan penyewa aktifnya
- `POST /api/kamar` - Create kamar baru
- `GET /api/kamar/{id}` - Detail 1 kamar + daftar penyewa
- `PUT /api/kamar/{id}` - Update kamar
- `DELETE /api/kamar/{id}` - Soft delete kamar

Request Body (POST/PUT):
```json
{
  "nomor_kamar": "101",
  "tipe": "standar",
  "harga_per_bulan": 500000,
  "fasilitas": ["AC", "WiFi", "KM Dalam"],
  "status": "tersedia"
}
```

#### PenyewaController (app/Http/Controllers/PenyewaController.php)
Endpoints:
- `GET /api/penyewa` - List semua penyewa aktif
- `POST /api/penyewa` - Register penyewa baru
- `GET /api/penyewa/{id}` - Detail 1 penyewa
- `PUT /api/penyewa/{id}` - Update data penyewa
- `DELETE /api/penyewa/{id}` - Checkout penyewa (update tanggal_keluar)

Request Body (POST):
```json
{
  "kamar_id": 1,
  "nama": "Ahmad Fauzi",
  "no_identitas": "3509051995123456",
  "no_telepon": "08123456789",
  "tanggal_masuk": "2026-05-17",
  "durasi_kontrak": 6
}
```

### 4. **API Routes** (routes/api.php)

Sudah ditambahkan:
```php
use App\Http\Controllers\KamarController;
use App\Http\Controllers\PenyewaController;

// Protected routes (memerlukan JWT token)
Route::middleware('jwt.auth')->group(function () {
    Route::apiResource('kamar', KamarController::class);
    Route::apiResource('penyewa', PenyewaController::class);
});
```

### 5. **Frontend UI**

#### File 1: `public/frontend/kamar.html`
- Halaman manajemen kamar dengan tampilan card grid
- Features:
  - View semua kamar dengan status (tersedia/terisi)
  - Modal form untuk tambah/edit kamar
  - Checkbox untuk multiple fasilitas
  - Edit dan Delete button per kamar
  - Dynamic loading dari API

#### File 2: `public/frontend/penyewa.html`
- Halaman manajemen penyewa dengan table layout
- Features:
  - Summary card: Total penyewa aktif
  - Search & filter penyewa
  - Table dengan informasi lengkap penyewa
  - Modal form untuk daftar penyewa baru
  - Button Edit dan Checkout per baris
  - Dynamic loading dari API

**Akses UI di browser:**
- Kamar: `http://localhost:8000/frontend/kamar.html`
- Penyewa: `http://localhost:8000/frontend/penyewa.html`

## 🔧 Setup & Testing

### 1. Jalankan Migrations
```bash
php artisan migrate
```

### 2. Buat Admin User (untuk testing)
```bash
php artisan tinker
>>> User::create(['name' => 'Admin', 'email' => 'admin@test.com', 'password' => bcrypt('password'), 'role' => 'admin'])
```

### 3. Login via Frontend
- Buka `http://localhost:8000/frontend/login.html`
- Masukkan email: `admin@test.com`, password: `password`
- Dapatkan JWT token dan akan disimpan di localStorage

### 4. Test Kamar Management
- Buka `http://localhost:8000/frontend/kamar.html`
- Klik "Tambah Kamar" untuk membuat kamar baru
- Isi form dan simpan
- Edit dan Delete untuk test CRUD operations

### 5. Test Penyewa Management
- Buka `http://localhost:8000/frontend/penyewa.html`
- Klik "Daftarkan Penyewa" untuk register penyewa baru
- Pilih kamar (hanya kamar dengan status "tersedia" yang tampil)
- Isi data penyewa dan simpan
- Kamar akan otomatis berubah status menjadi "terisi"
- Click "Keluar" untuk checkout penyewa (kamar kembali tersedia)

## 📝 API Testing dengan Postman

### Headers (untuk semua request):
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Testing Endpoints:

#### 1. GET - List Kamar
```
GET http://localhost:8000/api/kamar
```

#### 2. POST - Create Kamar
```
POST http://localhost:8000/api/kamar
Body:
{
  "nomor_kamar": "101",
  "tipe": "standar",
  "harga_per_bulan": 500000,
  "fasilitas": ["AC", "WiFi"],
  "status": "tersedia"
}
```

#### 3. GET - Penyewa List
```
GET http://localhost:8000/api/penyewa
```

#### 4. POST - Register Penyewa
```
POST http://localhost:8000/api/penyewa
Body:
{
  "kamar_id": 1,
  "nama": "Ahmad Fauzi",
  "no_identitas": "3509051995123456",
  "no_telepon": "08123456789",
  "tanggal_masuk": "2026-05-17",
  "durasi_kontrak": 6
}
```

#### 5. DELETE - Checkout Penyewa
```
DELETE http://localhost:8000/api/penyewa/{id}
```

## 🎯 Key Features Implemented

✅ **CRUD Kamar** dengan Soft Deletes
✅ **CRUD Penyewa** dengan validasi relasi kamar
✅ **Auto status update** - Kamar status berubah saat ada penyewa
✅ **Responsive UI** dengan Tailwind CSS
✅ **Real-time validation** di form
✅ **Error handling** yang informatif
✅ **Axios integration** untuk API calls
✅ **JWT authentication** untuk protected routes

## 📂 File Structure

```
app/
  Models/
    ├── Kamar.php
    └── Penyewa.php
  Http/
    Controllers/
      ├── KamarController.php
      └── PenyewaController.php

database/
  migrations/
    ├── 2026_05_17_115509_create_kamar_table.php
    └── 2026_05_17_115536_create_penyewa_table.php

public/frontend/
  ├── kamar.html
  └── penyewa.html

routes/
  └── api.php (updated dengan kamar & penyewa routes)
```

## ⚠️ Notes & Considerations

1. **Soft Deletes**: Data kamar dan penyewa tidak dihapus permanently, hanya di-mark dengan `deleted_at`
2. **Fasilitas JSON**: Fasilitas disimpan sebagai JSON array untuk fleksibilitas
3. **Status Auto-Update**: Saat penyewa didaftarkan, kamar status otomatis menjadi "terisi"
4. **Durasi Kontrak**: Menggunakan integer (bulan) untuk fleksibilitas
5. **UI Responsif**: Layout beradaptasi untuk mobile, tablet, desktop

## 🚀 Next Steps (untuk Developer 3)

Developer 3 akan mengimplementasikan:
- Payment Management (CRUD pembayaran)
- Payment Status (lunas/belum_lunas)
- Monthly Reports & Dashboard
- Delinquency Detection (penyewa yang belum bayar)

---

**Status**: ✅ COMPLETE
**Developer**: Rafi Kamasyamsi (245150700111002)
**Last Updated**: 17 May 2026

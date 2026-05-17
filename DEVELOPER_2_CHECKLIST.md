# ✅ Developer 2 Implementation Checklist

## Completed Tasks

### 1. Database & Models ✅
- [x] Kamar Model dengan SoftDeletes
- [x] Penyewa Model dengan SoftDeletes
- [x] Relasi Kamar → Penyewa (One-to-Many)
- [x] Relasi Penyewa → Kamar (Many-to-One)
- [x] Helper methods (isAktif, akanHabis)

### 2. Database Migrations ✅
- [x] Migration: create_kamar_table
  - nomor_kamar (unique)
  - tipe (standar, deluxe, VIP)
  - harga_per_bulan (decimal)
  - fasilitas (JSON)
  - status (tersedia/terisi)
  - Soft Delete support
- [x] Migration: create_penyewa_table
  - kamar_id (FK → kamar.id)
  - nama, no_identitas, no_telepon
  - tanggal_masuk, tanggal_keluar (nullable)
  - durasi_kontrak
  - Soft Delete support

### 3. API Controllers ✅
- [x] KamarController
  - index() - GET all kamar
  - show() - GET kamar detail
  - store() - POST create kamar
  - update() - PUT update kamar
  - destroy() - DELETE soft delete kamar
  
- [x] PenyewaController
  - index() - GET all active penyewa
  - show() - GET penyewa detail
  - store() - POST register penyewa baru
  - update() - PUT update penyewa data
  - destroy() - DELETE checkout penyewa

### 4. API Routes ✅
- [x] Import KamarController & PenyewaController
- [x] Route::apiResource('kamar', KamarController::class)
- [x] Route::apiResource('penyewa', PenyewaController::class)
- [x] All routes protected with JWT middleware

### 5. Frontend UI ✅
- [x] kamar.html
  - Grid layout dengan card per kamar
  - Modal form untuk add/edit kamar
  - Fasilitas checkbox multiselect
  - Edit & Delete buttons
  - Real-time API integration
  
- [x] penyewa.html
  - Table layout untuk daftar penyewa
  - Summary card untuk total penyewa aktif
  - Search & filter functionality
  - Modal form untuk register penyewa
  - Status per penyewa (aktif/akan habis)
  - Edit & Checkout buttons

### 6. Integration Features ✅
- [x] JWT Token handling (localStorage)
- [x] Axios for API calls
- [x] Error handling & validation
- [x] Responsive design (mobile/tablet/desktop)
- [x] Loading states & user feedback
- [x] Auto room status update on tenant registration/checkout

### 7. Documentation ✅
- [x] DEVELOPER_2_IMPLEMENTATION.md (comprehensive guide)
- [x] This checklist file

---

## Testing Checklist

### Before Going Live:

- [ ] Run migrations: `php artisan migrate`
- [ ] Create test admin user
- [ ] Test kamar CRUD via API (Postman)
- [ ] Test penyewa CRUD via API (Postman)
- [ ] Access kamar.html in browser
- [ ] Access penyewa.html in browser
- [ ] Test add kamar form
- [ ] Test edit kamar form
- [ ] Test delete kamar (soft delete)
- [ ] Test register penyewa
- [ ] Verify kamar status changes to "terisi"
- [ ] Test checkout penyewa
- [ ] Verify kamar status changes back to "tersedia"
- [ ] Test search & filter in penyewa page
- [ ] Verify JWT token validation

---

## Files Created/Modified

### New Files:
```
app/Models/Kamar.php
app/Models/Penyewa.php
app/Http/Controllers/KamarController.php
app/Http/Controllers/PenyewaController.php
database/migrations/2026_05_17_115509_create_kamar_table.php
database/migrations/2026_05_17_115536_create_penyewa_table.php
public/frontend/kamar.html
public/frontend/penyewa.html
DEVELOPER_2_IMPLEMENTATION.md
```

### Modified Files:
```
routes/api.php - Added kamar & penyewa routes
```

---

## API Endpoints Summary

### Kamar Endpoints
```
GET    /api/kamar              - List all rooms
POST   /api/kamar              - Create new room
GET    /api/kamar/{id}         - Get room detail
PUT    /api/kamar/{id}         - Update room
DELETE /api/kamar/{id}         - Soft delete room
```

### Penyewa Endpoints
```
GET    /api/penyewa            - List active tenants
POST   /api/penyewa            - Register new tenant
GET    /api/penyewa/{id}       - Get tenant detail
PUT    /api/penyewa/{id}       - Update tenant
DELETE /api/penyewa/{id}       - Checkout tenant
```

All endpoints require JWT Bearer token in Authorization header.

---

## Key Implementation Details

### Soft Deletes
- Both Kamar and Penyewa use SoftDeletes trait
- Deleted records are preserved in database with deleted_at timestamp
- Queries automatically exclude soft-deleted records

### Room Status Management
- When tenant is registered → room status changes to "terisi"
- When tenant checks out → room status changes back to "tersedia"
- Only "tersedia" rooms appear in dropdown when registering new tenant

### JSON Fasilitas
- Stored as JSON array in database: `["AC", "WiFi", "KM Dalam", "TV"]`
- Easy to query and maintain
- Flexible for future facility additions

### Validation
- All inputs validated at controller level
- Unique room numbers
- Room must exist and be available before registering tenant
- Prevent duplicate active tenants in same room

---

## Notes for Developer 3

When implementing Payment & Report Service, you'll need to:
1. Create Pembayaran model with relations to Penyewa
2. Create migration for pembayaran table
3. Create PembayaranController for payment CRUD
4. Implement monthly report endpoints
5. Implement delinquency detection

The tenant data from this service will be used to:
- Link payments to specific tenants
- Calculate rent due dates
- Generate payment reminders
- Create financial reports

---

**Implementation Date**: 17 May 2026
**Developer**: Rafi Kamasyamsi (245150700111002)
**Status**: ✅ READY FOR TESTING

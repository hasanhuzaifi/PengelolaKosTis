<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\KamarController;
use App\Http\Controllers\PenyewaController;

// ═══════════════════════════════════════════════════════════════════════════
// AUTH SERVICE ROUTES – Dev 1 (Hasan)
// ═══════════════════════════════════════════════════════════════════════════

// Public routes (tidak perlu token)
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes (wajib token JWT)
Route::middleware('jwt.auth')->group(function () {

    // Auth
    Route::post('/logout',  [AuthController::class, 'logout']);
    Route::get('/profile',  [AuthController::class, 'profile']);
    Route::put('/profile',  [AuthController::class, 'updateProfile']);

    // ═══════════════════════════════════════════════════════════════════════
    // PROPERTY MANAGEMENT ROUTES – Dev 2 (Rafi)
    // ═══════════════════════════════════════════════════════════════════════
    Route::apiResource('kamar',   KamarController::class);
    Route::apiResource('penyewa', PenyewaController::class);

    // ═══════════════════════════════════════════════════════════════════════
    // PAYMENT & REPORT ROUTES – Dev 3 (Hazel)
    // Tambahkan di bawah ini setelah merge feature/payment
    // ═══════════════════════════════════════════════════════════════════════
    // Route::get('/pembayaran',               [PembayaranController::class, 'index']);
    // Route::post('/pembayaran',              [PembayaranController::class, 'store']);
    // Route::get('/pembayaran/{id}',          [PembayaranController::class, 'show']);
    // Route::get('/penyewa/{id}/pembayaran',  [PembayaranController::class, 'riwayatPenyewa']);
    // Route::get('/laporan/bulanan',          [PembayaranController::class, 'laporanBulanan']);
    // Route::get('/laporan/tunggakan',        [PembayaranController::class, 'tunggakan']);
    // Route::get('/dashboard',               [PembayaranController::class, 'dashboard']);

});

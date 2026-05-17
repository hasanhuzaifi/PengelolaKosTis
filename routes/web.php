<?php

use Illuminate\Support\Facades\Route;

// ─── Root redirect ke login ───────────────────────────────────────────────────
Route::get('/', fn() => redirect('/login'));

// ─── Auth pages ───────────────────────────────────────────────────────────────
Route::get('/login',    fn() => response()->file(public_path('frontend/login.html')));
Route::get('/register', fn() => response()->file(public_path('frontend/register.html')));

// ─── App pages (guard JWT dilakukan oleh requireAuth() di JS sisi client) ─────
Route::get('/dashboard',  fn() => response()->file(public_path('frontend/index.html')));
Route::get('/kamar',      fn() => response()->file(public_path('frontend/kamar.html')));
Route::get('/penyewa',    fn() => response()->file(public_path('frontend/penyewa.html')));
Route::get('/pembayaran', fn() => response()->file(public_path('frontend/pembayaran.html')));

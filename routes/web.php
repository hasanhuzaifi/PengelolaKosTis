<?php

use Illuminate\Support\Facades\Route;

// Redirect root ke login
Route::get('/', function () {
    return redirect('/login');
});

// Auth pages
Route::get('/login', function () {
    return file_get_contents(public_path('frontend/login.html'));
});

Route::get('/register', function () {
    return file_get_contents(public_path('frontend/register.html'));
});

// Dashboard & halaman lain (Dev 3 - Hazel)
Route::get('/dashboard', function () {
    return file_get_contents(public_path('frontend/index.html'));
});

// Kamar & Penyewa (Dev 2 - Rafi)
Route::get('/kamar', function () {
    return file_get_contents(public_path('frontend/kamar.html'));
});

Route::get('/penyewa', function () {
    return file_get_contents(public_path('frontend/penyewa.html'));
});

// Pembayaran (Dev 3 - Hazel)
Route::get('/pembayaran', function () {
    return file_get_contents(public_path('frontend/pembayaran.html'));
});
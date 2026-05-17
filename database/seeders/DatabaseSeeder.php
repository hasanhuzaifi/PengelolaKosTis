<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Urutan PENTING — jangan diubah:
     * 1. User     → akun admin login
     * 2. Kamar    → data kamar (tidak ada foreign key)
     * 3. Penyewa  → butuh kamar_id, harus setelah Kamar
     * 4. Pembayaran → butuh penyewa_id, harus setelah Penyewa
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            KamarSeeder::class,
            PenyewaSeeder::class,
            PembayaranSeeder::class,
        ]);
    }
}

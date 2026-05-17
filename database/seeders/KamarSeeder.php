<?php

namespace Database\Seeders;

use App\Models\Kamar;
use Illuminate\Database\Seeder;

class KamarSeeder extends Seeder
{
    public function run(): void
    {
        $kamar = [
            // ── Tipe Standar ──────────────────────────────────────────────
            [
                'nomor_kamar'     => 'A01',
                'tipe'            => 'Standar',
                'harga_per_bulan' => 800000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi'],
                'status'          => 'terisi',
            ],
            [
                'nomor_kamar'     => 'A02',
                'tipe'            => 'Standar',
                'harga_per_bulan' => 800000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi'],
                'status'          => 'terisi',
            ],
            [
                'nomor_kamar'     => 'A03',
                'tipe'            => 'Standar',
                'harga_per_bulan' => 800000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi'],
                'status'          => 'tersedia',
            ],
            // ── Tipe Deluxe ───────────────────────────────────────────────
            [
                'nomor_kamar'     => 'B01',
                'tipe'            => 'Deluxe',
                'harga_per_bulan' => 1200000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi', 'AC', 'Kamar Mandi Dalam'],
                'status'          => 'terisi',
            ],
            [
                'nomor_kamar'     => 'B02',
                'tipe'            => 'Deluxe',
                'harga_per_bulan' => 1200000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi', 'AC', 'Kamar Mandi Dalam'],
                'status'          => 'terisi',
            ],
            [
                'nomor_kamar'     => 'B03',
                'tipe'            => 'Deluxe',
                'harga_per_bulan' => 1200000,
                'fasilitas'       => ['Kasur', 'Lemari', 'Meja Belajar', 'WiFi', 'AC', 'Kamar Mandi Dalam'],
                'status'          => 'tersedia',
            ],
            // ── Tipe VIP ──────────────────────────────────────────────────
            [
                'nomor_kamar'     => 'C01',
                'tipe'            => 'VIP',
                'harga_per_bulan' => 1800000,
                'fasilitas'       => ['Kasur Spring Bed', 'Lemari', 'Meja Belajar', 'WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas Mini'],
                'status'          => 'terisi',
            ],
            [
                'nomor_kamar'     => 'C02',
                'tipe'            => 'VIP',
                'harga_per_bulan' => 1800000,
                'fasilitas'       => ['Kasur Spring Bed', 'Lemari', 'Meja Belajar', 'WiFi', 'AC', 'Kamar Mandi Dalam', 'TV', 'Kulkas Mini'],
                'status'          => 'tersedia',
            ],
        ];

        foreach ($kamar as $data) {
            Kamar::create($data);
        }
    }
}

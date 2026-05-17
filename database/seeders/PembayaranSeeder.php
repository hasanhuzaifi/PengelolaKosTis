<?php

namespace Database\Seeders;

use App\Models\Pembayaran;
use Illuminate\Database\Seeder;

class PembayaranSeeder extends Seeder
{
    public function run(): void
    {
        $pembayaran = [

            // ══════════════════════════════════════════════════════════════
            // PENYEWA 1 – Ahmad Fauzi (Kamar A01, Rp 800.000)
            // Masuk Jan 2025 – bayar Januari s/d April lunas, Mei belum
            // ══════════════════════════════════════════════════════════════
            [
                'penyewa_id'   => 1,
                'bulan'        => 1,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Januari 2025',
            ],
            [
                'penyewa_id'   => 1,
                'bulan'        => 2,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Februari 2025',
            ],
            [
                'penyewa_id'   => 1,
                'bulan'        => 3,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Maret 2025',
            ],
            [
                'penyewa_id'   => 1,
                'bulan'        => 4,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran April 2025',
            ],
            [
                'penyewa_id'   => 1,
                'bulan'        => 5,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'belum_lunas',
                'keterangan'   => 'Belum dibayar',
            ],

            // ══════════════════════════════════════════════════════════════
            // PENYEWA 2 – Budi Santoso (Kamar A02, Rp 800.000)
            // Masuk Feb 2025 – bayar Feb s/d April lunas, Mei lunas
            // ══════════════════════════════════════════════════════════════
            [
                'penyewa_id'   => 2,
                'bulan'        => 2,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Februari 2025',
            ],
            [
                'penyewa_id'   => 2,
                'bulan'        => 3,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Maret 2025',
            ],
            [
                'penyewa_id'   => 2,
                'bulan'        => 4,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran April 2025',
            ],
            [
                'penyewa_id'   => 2,
                'bulan'        => 5,
                'tahun'        => 2025,
                'jumlah_bayar' => 800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Mei 2025',
            ],

            // ══════════════════════════════════════════════════════════════
            // PENYEWA 3 – Cahya Dewi (Kamar B01, Rp 1.200.000)
            // Masuk Jan 2025 – bayar Jan s/d Maret lunas, April-Mei belum
            // ══════════════════════════════════════════════════════════════
            [
                'penyewa_id'   => 3,
                'bulan'        => 1,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Januari 2025',
            ],
            [
                'penyewa_id'   => 3,
                'bulan'        => 2,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Februari 2025',
            ],
            [
                'penyewa_id'   => 3,
                'bulan'        => 3,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Maret 2025',
            ],
            [
                'penyewa_id'   => 3,
                'bulan'        => 4,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'belum_lunas',
                'keterangan'   => 'Belum dibayar',
            ],
            [
                'penyewa_id'   => 3,
                'bulan'        => 5,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'belum_lunas',
                'keterangan'   => 'Belum dibayar',
            ],

            // ══════════════════════════════════════════════════════════════
            // PENYEWA 4 – Dimas Pratama (Kamar B02, Rp 1.200.000)
            // Masuk Mar 2025 – bayar Mar s/d Mei lunas semua
            // ══════════════════════════════════════════════════════════════
            [
                'penyewa_id'   => 4,
                'bulan'        => 3,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Maret 2025',
            ],
            [
                'penyewa_id'   => 4,
                'bulan'        => 4,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran April 2025',
            ],
            [
                'penyewa_id'   => 4,
                'bulan'        => 5,
                'tahun'        => 2025,
                'jumlah_bayar' => 1200000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Mei 2025',
            ],

            // ══════════════════════════════════════════════════════════════
            // PENYEWA 5 – Eka Rahmawati (Kamar C01, Rp 1.800.000)
            // Masuk Jan 2025 – bayar Jan s/d April lunas, Mei lunas
            // ══════════════════════════════════════════════════════════════
            [
                'penyewa_id'   => 5,
                'bulan'        => 1,
                'tahun'        => 2025,
                'jumlah_bayar' => 1800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Januari 2025',
            ],
            [
                'penyewa_id'   => 5,
                'bulan'        => 2,
                'tahun'        => 2025,
                'jumlah_bayar' => 1800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Februari 2025',
            ],
            [
                'penyewa_id'   => 5,
                'bulan'        => 3,
                'tahun'        => 2025,
                'jumlah_bayar' => 1800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Maret 2025',
            ],
            [
                'penyewa_id'   => 5,
                'bulan'        => 4,
                'tahun'        => 2025,
                'jumlah_bayar' => 1800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran April 2025',
            ],
            [
                'penyewa_id'   => 5,
                'bulan'        => 5,
                'tahun'        => 2025,
                'jumlah_bayar' => 1800000,
                'status'       => 'lunas',
                'keterangan'   => 'Pembayaran Mei 2025',
            ],
        ];

        foreach ($pembayaran as $data) {
            Pembayaran::create($data);
        }
    }
}

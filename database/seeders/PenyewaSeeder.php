<?php

namespace Database\Seeders;

use App\Models\Penyewa;
use Illuminate\Database\Seeder;

class PenyewaSeeder extends Seeder
{
    public function run(): void
    {
        $penyewa = [
            // ── Kamar A01 (ID: 1) ─────────────────────────────────────────
            [
                'kamar_id'       => 1,
                'nama'           => 'Ahmad Fauzi',
                'no_identitas'   => '3578010101990001',
                'no_telepon'     => '081234567890',
                'tanggal_masuk'  => '2025-01-01',
                'tanggal_keluar' => null,
                'durasi_kontrak' => 12,
            ],
            // ── Kamar A02 (ID: 2) ─────────────────────────────────────────
            [
                'kamar_id'       => 2,
                'nama'           => 'Budi Santoso',
                'no_identitas'   => '3578020202980002',
                'no_telepon'     => '082345678901',
                'tanggal_masuk'  => '2025-02-01',
                'tanggal_keluar' => null,
                'durasi_kontrak' => 6,
            ],
            // ── Kamar B01 (ID: 4) ─────────────────────────────────────────
            [
                'kamar_id'       => 4,
                'nama'           => 'Cahya Dewi',
                'no_identitas'   => '3578030303970003',
                'no_telepon'     => '083456789012',
                'tanggal_masuk'  => '2025-01-15',
                'tanggal_keluar' => null,
                'durasi_kontrak' => 12,
            ],
            // ── Kamar B02 (ID: 5) ─────────────────────────────────────────
            [
                'kamar_id'       => 5,
                'nama'           => 'Dimas Pratama',
                'no_identitas'   => '3578040404960004',
                'no_telepon'     => '084567890123',
                'tanggal_masuk'  => '2025-03-01',
                'tanggal_keluar' => null,
                'durasi_kontrak' => 6,
            ],
            // ── Kamar C01 (ID: 7) ─────────────────────────────────────────
            [
                'kamar_id'       => 7,
                'nama'           => 'Eka Rahmawati',
                'no_identitas'   => '3578050505950005',
                'no_telepon'     => '085678901234',
                'tanggal_masuk'  => '2025-01-01',
                'tanggal_keluar' => null,
                'durasi_kontrak' => 12,
            ],
        ];

        foreach ($penyewa as $data) {
            Penyewa::create($data);
        }
    }
}

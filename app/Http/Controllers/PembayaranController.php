<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use App\Models\Pembayaran;
use App\Models\Penyewa;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PembayaranController extends Controller
{
    /**
     * GET /api/pembayaran [JWT]
     * Menampilkan seluruh riwayat pembayaran (terbaru dulu).
     * Optional query params: ?bulan=&tahun=&penyewa_id=
     */
    public function index(Request $request)
    {
        try {
            $query = Pembayaran::with(['penyewa.kamar']);

            if ($request->filled('bulan')) {
                $query->where('bulan', $request->bulan);
            }
            if ($request->filled('tahun')) {
                $query->where('tahun', $request->tahun);
            }
            if ($request->filled('penyewa_id')) {
                $query->where('penyewa_id', $request->penyewa_id);
            }

            $pembayaran = $query->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data'    => $pembayaran,
                'message' => 'Berhasil mengambil data pembayaran',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * POST /api/pembayaran [JWT]
     * Mencatat pembayaran sewa baru dari penyewa.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'penyewa_id'   => 'required|integer|exists:penyewa,id',
                'bulan'        => 'required|integer|min:1|max:12',
                'tahun'        => 'required|integer|min:2000|max:2100',
                'jumlah_bayar' => 'required|numeric|min:1',
                'status'       => 'required|in:lunas,belum_lunas',
                'keterangan'   => 'nullable|string|max:500',
            ]);

            // Pastikan penyewa masih aktif (belum keluar)
            $penyewa = Penyewa::find($validated['penyewa_id']);
            if (!$penyewa || !is_null($penyewa->tanggal_keluar)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Penyewa tidak aktif atau tidak ditemukan',
                ], 422);
            }

            // Cek duplikasi: satu penyewa satu record per bulan/tahun
            $duplikat = Pembayaran::where('penyewa_id', $validated['penyewa_id'])
                ->where('bulan', $validated['bulan'])
                ->where('tahun', $validated['tahun'])
                ->exists();

            if ($duplikat) {
                return response()->json([
                    'success' => false,
                    'message' => 'Pembayaran untuk bulan dan tahun ini sudah tercatat',
                ], 422);
            }

            $pembayaran = Pembayaran::create($validated);
            $pembayaran->load(['penyewa.kamar']);

            return response()->json([
                'success' => true,
                'data'    => $pembayaran,
                'message' => 'Pembayaran berhasil dicatat',
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/pembayaran/{id} [JWT]
     * Melihat detail 1 data pembayaran.
     */
    public function show($id)
    {
        try {
            $pembayaran = Pembayaran::with(['penyewa.kamar'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data'    => $pembayaran,
                'message' => 'Berhasil mengambil detail pembayaran',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Pembayaran tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/penyewa/{id}/pembayaran [JWT]
     * Melihat riwayat lengkap pembayaran 1 penyewa.
     */
    public function riwayatPenyewa($id)
    {
        try {
            $penyewa = Penyewa::with(['kamar'])->findOrFail($id);
            $pembayaran = Pembayaran::where('penyewa_id', $id)
                ->orderBy('tahun', 'desc')
                ->orderBy('bulan', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data'    => [
                    'penyewa'    => $penyewa,
                    'pembayaran' => $pembayaran,
                ],
                'message' => 'Berhasil mengambil riwayat pembayaran penyewa',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Penyewa tidak ditemukan',
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil riwayat: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/laporan/bulanan [JWT]
     * Rekap pemasukan per bulan.
     * Query params: ?bulan=5&tahun=2025
     */
    public function laporanBulanan(Request $request)
    {
        try {
            $bulan = $request->filled('bulan') ? (int) $request->bulan : (int) date('m');
            $tahun = $request->filled('tahun') ? (int) $request->tahun : (int) date('Y');

            $pembayaran = Pembayaran::with(['penyewa.kamar'])
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->orderBy('created_at', 'desc')
                ->get();

            // Kalkulasi di PHP (sesuai spec: bisa juga di client via .reduce())
            $totalPemasukan  = $pembayaran->where('status', 'lunas')->sum('jumlah_bayar');
            $jumlahLunas     = $pembayaran->where('status', 'lunas')->count();
            $jumlahBelumLunas = $pembayaran->where('status', 'belum_lunas')->count();

            return response()->json([
                'success' => true,
                'data'    => [
                    'bulan'             => $bulan,
                    'tahun'             => $tahun,
                    'total_pemasukan'   => (float) $totalPemasukan,
                    'jumlah_lunas'      => $jumlahLunas,
                    'jumlah_belum_lunas'=> $jumlahBelumLunas,
                    'pembayaran'        => $pembayaran,
                ],
                'message' => 'Berhasil mengambil laporan bulanan',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil laporan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/laporan/tunggakan [JWT]
     * Daftar penyewa aktif yang belum membayar bulan berjalan.
     */
    public function tunggakan(Request $request)
    {
        try {
            $bulan = $request->filled('bulan') ? (int) $request->bulan : (int) date('m');
            $tahun = $request->filled('tahun') ? (int) $request->tahun : (int) date('Y');

            // Ambil semua penyewa aktif
            $penyewaAktif = Penyewa::with(['kamar'])
                ->whereNull('tanggal_keluar')
                ->get();

            // Ambil penyewa yang sudah bayar bulan ini
            $sudahBayarIds = Pembayaran::where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->where('status', 'lunas')
                ->pluck('penyewa_id')
                ->toArray();

            // Filter penyewa yang belum lunas
            $tunggakan = $penyewaAktif->filter(function ($p) use ($sudahBayarIds) {
                return !in_array($p->id, $sudahBayarIds);
            })->values();

            return response()->json([
                'success' => true,
                'data'    => [
                    'bulan'     => $bulan,
                    'tahun'     => $tahun,
                    'tunggakan' => $tunggakan,
                    'total'     => $tunggakan->count(),
                ],
                'message' => 'Berhasil mengambil data tunggakan',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil tunggakan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * GET /api/dashboard [JWT]
     * Ringkasan: kamar tersedia, terisi, total penyewa, total pemasukan.
     */
    public function dashboard()
    {
        try {
            $bulan = (int) date('m');
            $tahun = (int) date('Y');

            $totalKamar    = Kamar::count();
            $kamarTersedia = Kamar::where('status', 'tersedia')->count();
            $kamarTerisi   = Kamar::where('status', 'terisi')->count();
            $totalPenyewa  = Penyewa::whereNull('tanggal_keluar')->count();

            // Pembayaran bulan berjalan
            $pembayaranBulanIni = Pembayaran::with(['penyewa.kamar'])
                ->where('bulan', $bulan)
                ->where('tahun', $tahun)
                ->orderBy('created_at', 'desc')
                ->get();

            $totalPemasukan = $pembayaranBulanIni
                ->where('status', 'lunas')
                ->sum('jumlah_bayar');

            // Pembayaran terbaru (10 terakhir)
            $pembayaranTerbaru = Pembayaran::with(['penyewa.kamar'])
                ->orderBy('created_at', 'desc')
                ->limit(10)
                ->get();

            return response()->json([
                'success' => true,
                'data'    => [
                    'total_kamar'         => $totalKamar,
                    'kamar_tersedia'      => $kamarTersedia,
                    'kamar_terisi'        => $kamarTerisi,
                    'total_penyewa_aktif' => $totalPenyewa,
                    'total_pemasukan'     => (float) $totalPemasukan,
                    'bulan'               => $bulan,
                    'tahun'               => $tahun,
                    'pembayaran_terbaru'  => $pembayaranTerbaru,
                ],
                'message' => 'Berhasil mengambil data dashboard',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data dashboard: ' . $e->getMessage(),
            ], 500);
        }
    }
}

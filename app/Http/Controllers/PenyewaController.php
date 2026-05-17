<?php

namespace App\Http\Controllers;

use App\Models\Penyewa;
use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PenyewaController extends Controller
{
    /**
     * Get all active tenants
     */
    public function index()
    {
        try {
            $penyewa = Penyewa::with('kamar')
                ->whereNull('tanggal_keluar')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $penyewa,
                'message' => 'Berhasil mengambil data penyewa'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data penyewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get tenant detail
     */
    public function show($id)
    {
        try {
            $penyewa = Penyewa::with('kamar')->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $penyewa,
                'message' => 'Berhasil mengambil detail penyewa'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Penyewa tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail penyewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register new tenant
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'kamar_id' => 'required|exists:kamar,id',
                'nama' => 'required|string|max:100',
                'no_identitas' => 'required|string|max:30',
                'no_telepon' => 'required|string|max:20',
                'tanggal_masuk' => 'required|date',
                'durasi_kontrak' => 'required|integer|min:1'
            ]);

            // Check if room exists and is available
            $kamar = Kamar::findOrFail($validated['kamar_id']);
            
            // Check if room has active tenant
            $hasPenyewa = Penyewa::where('kamar_id', $validated['kamar_id'])
                ->whereNull('tanggal_keluar')
                ->exists();

            if ($hasPenyewa) {
                return response()->json([
                    'success' => false,
                    'message' => 'Kamar sudah memiliki penyewa aktif'
                ], 422);
            }

            $penyewa = Penyewa::create($validated);

            // Update room status to 'terisi'
            $kamar->update(['status' => 'terisi']);

            return response()->json([
                'success' => true,
                'data' => $penyewa,
                'message' => 'Penyewa berhasil didaftarkan'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mendaftarkan penyewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update tenant data
     */
    public function update(Request $request, $id)
    {
        try {
            $penyewa = Penyewa::findOrFail($id);

            $validated = $request->validate([
                'nama' => 'sometimes|string|max:100',
                'no_identitas' => 'sometimes|string|max:30',
                'no_telepon' => 'sometimes|string|max:20',
                'tanggal_masuk' => 'sometimes|date',
                'durasi_kontrak' => 'sometimes|integer|min:1'
            ]);

            $penyewa->update($validated);

            return response()->json([
                'success' => true,
                'data' => $penyewa,
                'message' => 'Data penyewa berhasil diperbarui'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Penyewa tidak ditemukan'
            ], 404);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memperbarui penyewa: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark tenant as checked out
     */
    public function destroy($id)
    {
        try {
            $penyewa = Penyewa::findOrFail($id);
            $kamar_id = $penyewa->kamar_id;

            // Update tenant checkout date
            $penyewa->update(['tanggal_keluar' => now()->toDateString()]);

            // Update room status to 'tersedia'
            Kamar::findOrFail($kamar_id)->update(['status' => 'tersedia']);

            return response()->json([
                'success' => true,
                'message' => 'Penyewa berhasil dicatat keluar'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Penyewa tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mencatat penyewa keluar: ' . $e->getMessage()
            ], 500);
        }
    }
}

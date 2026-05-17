<?php

namespace App\Http\Controllers;

use App\Models\Kamar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class KamarController extends Controller
{
    /**
     * Get all rooms
     */
    public function index()
    {
        try {
            $kamar = Kamar::with('penyewaAktif')->get();
            
            return response()->json([
                'success' => true,
                'data' => $kamar,
                'message' => 'Berhasil mengambil data kamar'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data kamar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get room detail
     */
    public function show($id)
    {
        try {
            $kamar = Kamar::with('penyewa', 'penyewaAktif')->findOrFail($id);
            
            return response()->json([
                'success' => true,
                'data' => $kamar,
                'message' => 'Berhasil mengambil detail kamar'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail kamar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create new room
     */
    public function store(Request $request)
    {
        try {
            // Validate input
            $validated = $request->validate([
                'nomor_kamar' => 'required|string|max:10|unique:kamar,nomor_kamar',
                'tipe' => 'required|string|max:50',
                'harga_per_bulan' => 'required|numeric|min:0',
                'fasilitas' => 'nullable|array',
                'status' => 'required|in:tersedia,terisi'
            ]);

            $kamar = Kamar::create($validated);

            return response()->json([
                'success' => true,
                'data' => $kamar,
                'message' => 'Kamar berhasil ditambahkan'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menambahkan kamar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update room
     */
    public function update(Request $request, $id)
    {
        try {
            $kamar = Kamar::findOrFail($id);

            $validated = $request->validate([
                'nomor_kamar' => 'sometimes|string|max:10|unique:kamar,nomor_kamar,' . $id,
                'tipe' => 'sometimes|string|max:50',
                'harga_per_bulan' => 'sometimes|numeric|min:0',
                'fasilitas' => 'nullable|array',
                'status' => 'sometimes|in:tersedia,terisi'
            ]);

            $kamar->update($validated);

            return response()->json([
                'success' => true,
                'data' => $kamar,
                'message' => 'Kamar berhasil diperbarui'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan'
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
                'message' => 'Gagal memperbarui kamar: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Soft delete room
     */
    public function destroy($id)
    {
        try {
            $kamar = Kamar::findOrFail($id);
            $kamar->delete();

            return response()->json([
                'success' => true,
                'message' => 'Kamar berhasil dihapus'
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Kamar tidak ditemukan'
            ], 404);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal menghapus kamar: ' . $e->getMessage()
            ], 500);
        }
    }
}

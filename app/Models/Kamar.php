<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Kamar extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'kamar';

    protected $fillable = [
        'nomor_kamar',
        'tipe',
        'harga_per_bulan',
        'fasilitas',
        'status',
    ];

    protected $casts = [
        'fasilitas' => 'array', // Store facilities as JSON
        'harga_per_bulan' => 'decimal:2',
    ];

    /**
     * Relasi ke Penyewa
     */
    public function penyewa()
    {
        return $this->hasMany(Penyewa::class, 'kamar_id');
    }

    /**
     * Get active tenant for this room
     */
    public function penyewaAktif()
    {
        return $this->hasOne(Penyewa::class, 'kamar_id')
            ->whereNull('tanggal_keluar');
    }
}

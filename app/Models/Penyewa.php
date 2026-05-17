<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Penyewa extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'penyewa';

    protected $fillable = [
        'kamar_id',
        'nama',
        'no_identitas',
        'no_telepon',
        'tanggal_masuk',
        'tanggal_keluar',
        'durasi_kontrak',
    ];

    protected $casts = [
        'tanggal_masuk' => 'date',
        'tanggal_keluar' => 'date',
    ];

    /**
     * Relasi ke Kamar
     */
    public function kamar()
    {
        return $this->belongsTo(Kamar::class, 'kamar_id');
    }

    /**
     * Relasi ke Pembayaran
     */
    public function pembayaran()
    {
        return $this->hasMany(Pembayaran::class, 'penyewa_id');
    }

    /**
     * Check if tenant is still active
     */
    public function isAktif()
    {
        return is_null($this->tanggal_keluar);
    }

    /**
     * Check if tenant is about to exit
     */
    public function akanHabis()
    {
        if (is_null($this->tanggal_keluar)) {
            $tenggat = $this->tanggal_masuk->addMonths($this->durasi_kontrak);
            return $tenggat->diffInDays(now()) <= 30 && $tenggat->diffInDays(now()) > 0;
        }
        return false;
    }
}

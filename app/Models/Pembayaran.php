<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pembayaran extends Model
{
    use HasFactory;

    protected $table = 'pembayaran';

    protected $fillable = [
        'penyewa_id',
        'bulan',
        'tahun',
        'jumlah_bayar',
        'status',
        'keterangan',
    ];

    protected $casts = [
        'jumlah_bayar' => 'decimal:2',
        'bulan'        => 'integer',
        'tahun'        => 'integer',
    ];

    /**
     * Relasi ke Penyewa
     */
    public function penyewa()
    {
        return $this->belongsTo(Penyewa::class, 'penyewa_id');
    }
}

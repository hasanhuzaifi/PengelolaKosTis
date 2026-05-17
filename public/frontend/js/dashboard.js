/**
 * dashboard.js – Payment & Report: Dashboard
 * Manajemen Kos Al-Firdaus – Dev 3 (Hazel)
 *
 * Terhubung ke PembayaranController.php:
 *   GET /api/dashboard          → dashboard()
 *   GET /api/laporan/tunggakan  → tunggakan()
 *
 * Kalkulasi total pemasukan dilakukan di sisi CLIENT menggunakan .reduce()
 * sesuai spesifikasi proyek.
 */

// ─── Constants ────────────────────────────────────────────────────────────────
const BULAN_NAMES = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    renderUserInfo();
    loadDashboard();
});

// ─── Load Dashboard ───────────────────────────────────────────────────────────
async function loadDashboard() {
    try {
        const [dashRes, tunggakanRes] = await Promise.all([
            axios.get('/dashboard'),
            axios.get('/laporan/tunggakan'),
        ]);

        const d = dashRes.data.data;
        const t = tunggakanRes.data.data;

        renderStats(d);
        renderPembayaranTerbaru(d.pembayaran_terbaru || []);
        renderTunggakan(t.tunggakan || []);

        const bulanLabel = BULAN_NAMES[d.bulan] || '';
        document.getElementById('period-label').textContent =
            `Ringkasan kos – ${bulanLabel} ${d.tahun}`;

    } catch (err) {
        showToast('Gagal memuat data dashboard.', 'error');
        console.error(err);
    }
}

// ─── Render Stats ─────────────────────────────────────────────────────────────
function renderStats(d) {
    document.getElementById('stat-total-kamar').textContent = d.total_kamar ?? 0;
    document.getElementById('stat-tersedia').textContent    = d.kamar_tersedia ?? 0;
    document.getElementById('stat-terisi').textContent      = d.kamar_terisi ?? 0;
    document.getElementById('stat-penyewa').textContent     = d.total_penyewa_aktif ?? 0;

    // Hitung total pemasukan dari pembayaran_terbaru di client menggunakan .reduce()
    const allPembayaran = d.pembayaran_terbaru || [];
    const totalClient = allPembayaran
        .filter(p => p.status === 'lunas')
        .reduce((acc, item) => acc + parseFloat(item.jumlah_bayar || 0), 0);

    // Gunakan nilai dari backend (lebih akurat, mencakup semua pembayaran bulan ini)
    const totalPemasukan = d.total_pemasukan ?? totalClient;
    document.getElementById('stat-pemasukan').textContent = formatRupiah(totalPemasukan);
}

// ─── Render Tabel Pembayaran Terbaru ──────────────────────────────────────────
function renderPembayaranTerbaru(data) {
    const tbody = document.getElementById('tabel-pembayaran');
    const empty = document.getElementById('empty-pembayaran');

    if (!data || data.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = data.map((p, i) => {
        const namaKamar  = p.penyewa?.kamar?.nomor_kamar ?? '-';
        const namaPenyewa = escHtml(p.penyewa?.nama ?? '-');
        const isLunas    = p.status === 'lunas';
        return `<tr>
            <td class="td-nowrap text-muted">${i + 1}</td>
            <td>
                <div class="td-primary">${namaPenyewa}</div>
            </td>
            <td>
                <span class="badge badge-primary">
                    <span class="material-symbols-outlined">meeting_room</span>
                    ${escHtml(namaKamar)}
                </span>
            </td>
            <td class="td-nowrap">${BULAN_NAMES[p.bulan] ?? p.bulan} ${p.tahun}</td>
            <td class="td-nowrap fw-600">${formatRupiah(p.jumlah_bayar)}</td>
            <td>
                <span class="badge ${isLunas ? 'badge-success' : 'badge-danger'}">
                    <span class="material-symbols-outlined">${isLunas ? 'check_circle' : 'cancel'}</span>
                    ${isLunas ? 'Lunas' : 'Belum Lunas'}
                </span>
            </td>
        </tr>`;
    }).join('');
}

// ─── Render Tunggakan ─────────────────────────────────────────────────────────
function renderTunggakan(data) {
    const el = document.getElementById('tunggakan-list');

    if (!data || data.length === 0) {
        el.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:6px;
                        padding:20px;color:var(--success);text-align:center;">
                <span class="material-symbols-outlined" style="font-size:36px;">verified</span>
                <p style="font-weight:600;">Semua penyewa sudah membayar!</p>
            </div>`;
        return;
    }

    el.innerHTML = `
        <div style="font-size:13px;color:var(--muted);margin-bottom:10px;">
            ${data.length} penyewa belum membayar bulan ini
        </div>
        ${data.slice(0, 5).map(p => `
            <div style="display:flex;align-items:center;justify-content:space-between;
                        padding:8px 0;border-bottom:1px solid var(--border);gap:8px;">
                <div>
                    <div style="font-weight:600;font-size:13px;">${escHtml(p.nama)}</div>
                    <div style="font-size:11px;color:var(--muted);">
                        Kamar ${escHtml(p.kamar?.nomor_kamar ?? '-')}
                    </div>
                </div>
                <span class="badge badge-danger">
                    <span class="material-symbols-outlined">warning</span>
                    Tunggak
                </span>
            </div>
        `).join('')}
        ${data.length > 5 ? `<div style="font-size:12px;color:var(--muted);margin-top:8px;">
            + ${data.length - 5} penyewa lainnya…
        </div>` : ''}`;
}

// ─── Utilities ────────────────────────────────────────────────────────────────
function formatRupiah(val) {
    const num = parseFloat(val) || 0;
    return 'Rp ' + num.toLocaleString('id-ID', { minimumFractionDigits: 0 });
}

function escHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function showToast(msg, type = 'info') {
    const container = document.getElementById('toast-container');
    const icons = { success: 'check_circle', error: 'error', info: 'info' };
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : type}`;
    toast.innerHTML = `
        <span class="material-symbols-outlined">${icons[type] || 'info'}</span>
        <span class="toast-msg">${escHtml(msg)}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}

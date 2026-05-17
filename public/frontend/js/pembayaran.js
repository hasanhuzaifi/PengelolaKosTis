/**
 * pembayaran.js – Payment & Report Service Frontend
 * Manajemen Kos Al-Firdaus – Dev 3 (Hazel)
 *
 * Terhubung ke PembayaranController.php:
 *   GET  /api/pembayaran         → index()
 *   POST /api/pembayaran         → store()
 *   GET  /api/pembayaran/{id}    → show()
 *
 * Kalkulasi client-side menggunakan .reduce() untuk total pemasukan.
 */

// ─── State ────────────────────────────────────────────────────────────────────
let allPembayaran = [];
let allPenyewa    = [];

const BULAN_NAMES = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    renderUserInfo();
    populateYearFilter();
    setDefaultFilter();
    loadPenyewaList();
    loadPembayaran();
});

// ─── Populate filter tahun ────────────────────────────────────────────────────
function populateYearFilter() {
    const sel  = document.getElementById('filter-tahun');
    const now  = new Date().getFullYear();
    for (let y = now; y >= 2020; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = y;
        sel.appendChild(opt);
    }

    const addSel = document.getElementById('add-tahun');
    if (addSel) addSel.value = now;
}

function setDefaultFilter() {
    const now = new Date();
    document.getElementById('filter-bulan').value = now.getMonth() + 1;
    document.getElementById('filter-tahun').value = now.getFullYear();
}

// ─── Load Penyewa untuk dropdown ──────────────────────────────────────────────
async function loadPenyewaList() {
    try {
        const res  = await axios.get('/penyewa');
        allPenyewa = res.data.data || [];
        const sel  = document.getElementById('add-penyewa');
        sel.innerHTML = '<option value="">Pilih penyewa aktif…</option>';
        allPenyewa.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = `${p.nama} – Kamar ${p.kamar?.nomor_kamar ?? '-'}`;
            // Prefill jumlah dari harga kamar
            opt.dataset.harga = p.kamar?.harga_per_bulan ?? '';
            sel.appendChild(opt);
        });

        // Auto-fill jumlah bayar saat penyewa dipilih
        sel.addEventListener('change', () => {
            const harga = sel.options[sel.selectedIndex]?.dataset?.harga;
            if (harga) document.getElementById('add-jumlah').value = Math.round(parseFloat(harga));
        });
    } catch (err) {
        console.error('Gagal memuat penyewa:', err);
    }
}

// ─── Load & Render Pembayaran ─────────────────────────────────────────────────
async function loadPembayaran() {
    showTableLoading(true);
    try {
        const params = buildFilterParams();
        const res    = await axios.get('/pembayaran', { params });
        allPembayaran = res.data.data || [];
        renderPembayaran(allPembayaran);
        updateStats(allPembayaran);
    } catch (err) {
        showToast('Gagal memuat data pembayaran.', 'error');
        console.error(err);
    } finally {
        showTableLoading(false);
    }
}

function buildFilterParams() {
    const params = {};
    const bulan  = document.getElementById('filter-bulan').value;
    const tahun  = document.getElementById('filter-tahun').value;
    if (bulan)  params.bulan  = bulan;
    if (tahun)  params.tahun  = tahun;
    return params;
}

function applyFilter() {
    loadPembayaran();
}

function renderPembayaran(data) {
    const tbody  = document.getElementById('tabel-pembayaran');
    const empty  = document.getElementById('empty-state');
    const status = document.getElementById('filter-status').value;

    // Filter status di sisi klien
    let filtered = data;
    if (status) filtered = data.filter(p => p.status === status);

    if (!filtered || filtered.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = filtered.map((p, i) => {
        const penyewa  = p.penyewa || {};
        const kamar    = penyewa.kamar || {};
        const isLunas  = p.status === 'lunas';
        return `<tr>
            <td class="td-nowrap text-muted fs-12">${i + 1}</td>
            <td>
                <div class="td-primary">${escHtml(penyewa.nama ?? '-')}</div>
                <div class="td-secondary">${escHtml(penyewa.no_telepon ?? '')}</div>
            </td>
            <td>
                <span class="badge badge-primary">
                    <span class="material-symbols-outlined">meeting_room</span>
                    ${escHtml(kamar.nomor_kamar ?? '-')}
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
            <td class="text-muted fs-12">${escHtml(p.keterangan ?? '-')}</td>
        </tr>`;
    }).join('');
}

// ─── Update Stat Cards (client-side .reduce()) ────────────────────────────────
function updateStats(data) {
    const status = document.getElementById('filter-status').value;
    let filtered = data;
    if (status) filtered = data.filter(p => p.status === status);

    // Hitung total pemasukan (lunas saja) dengan .reduce() – spec project
    const totalPemasukan = filtered
        .filter(p => p.status === 'lunas')
        .reduce((acc, item) => acc + parseFloat(item.jumlah_bayar || 0), 0);

    const jumlahLunas     = filtered.filter(p => p.status === 'lunas').length;
    const jumlahBelumLunas = filtered.filter(p => p.status === 'belum_lunas').length;

    document.getElementById('stat-pemasukan').textContent = formatRupiah(totalPemasukan);
    document.getElementById('stat-lunas').textContent     = jumlahLunas;
    document.getElementById('stat-belum').textContent     = jumlahBelumLunas;
}

// ─── MODAL: Tambah Pembayaran ─────────────────────────────────────────────────
function openAddModal() {
    // Reset form
    document.getElementById('add-penyewa').value    = '';
    document.getElementById('add-bulan').value      = new Date().getMonth() + 1;
    document.getElementById('add-tahun').value      = new Date().getFullYear();
    document.getElementById('add-jumlah').value     = '';
    document.getElementById('add-status').value     = 'lunas';
    document.getElementById('add-keterangan').value = '';
    hideError('add-error');
    openModal('modal-add');
}

async function savePembayaran() {
    const btn = document.getElementById('btn-save-add');

    const penyewaId = document.getElementById('add-penyewa').value;
    const bulan     = document.getElementById('add-bulan').value;
    const tahun     = document.getElementById('add-tahun').value;
    const jumlah    = document.getElementById('add-jumlah').value;
    const status    = document.getElementById('add-status').value;
    const keterangan = document.getElementById('add-keterangan').value.trim();

    // Validasi dasar
    if (!penyewaId) { showFieldError('add-error', 'Pilih penyewa terlebih dahulu.'); return; }
    if (!bulan || !tahun) { showFieldError('add-error', 'Bulan dan tahun wajib diisi.'); return; }
    if (!jumlah || parseFloat(jumlah) <= 0) { showFieldError('add-error', 'Jumlah bayar harus lebih dari 0.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" style="width:14px;height:14px;"></span> Menyimpan…';

    try {
        await axios.post('/pembayaran', {
            penyewa_id:   parseInt(penyewaId),
            bulan:        parseInt(bulan),
            tahun:        parseInt(tahun),
            jumlah_bayar: parseFloat(jumlah),
            status,
            keterangan:   keterangan || null,
        });

        closeModal('modal-add');
        showToast('Pembayaran berhasil dicatat!', 'success');
        loadPembayaran();

    } catch (err) {
        const msg = err.response?.data?.message || 'Gagal menyimpan pembayaran.';
        const errors = err.response?.data?.errors;
        let detail = msg;
        if (errors) {
            detail = Object.values(errors).flat().join(' ');
        }
        showFieldError('add-error', detail);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<span class="material-symbols-outlined">save</span> Simpan';
    }
}

// ─── MODAL: Detail ────────────────────────────────────────────────────────────
async function openDetailModal(id) {
    openModal('modal-detail');
    document.getElementById('detail-body').innerHTML =
        '<div style="text-align:center;padding:24px;"><span class="spinner"></span></div>';
    try {
        const res = await axios.get(`/pembayaran/${id}`);
        const p   = res.data.data;
        const isLunas = p.status === 'lunas';
        document.getElementById('detail-body').innerHTML = `
            <div style="display:flex;flex-direction:column;gap:12px;">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                    <div>
                        <div style="font-size:12px;color:var(--muted);">Penyewa</div>
                        <div style="font-weight:700;font-size:16px;">${escHtml(p.penyewa?.nama ?? '-')}</div>
                    </div>
                    <span class="badge ${isLunas ? 'badge-success' : 'badge-danger'}">
                        <span class="material-symbols-outlined">${isLunas ? 'check_circle' : 'cancel'}</span>
                        ${isLunas ? 'Lunas' : 'Belum Lunas'}
                    </span>
                </div>
                ${detailRow('Kamar', p.penyewa?.kamar?.nomor_kamar ?? '-')}
                ${detailRow('Periode', `${BULAN_NAMES[p.bulan] ?? p.bulan} ${p.tahun}`)}
                ${detailRow('Jumlah Bayar', formatRupiah(p.jumlah_bayar))}
                ${detailRow('Keterangan', p.keterangan || '-')}
                ${detailRow('Dicatat pada', new Date(p.created_at).toLocaleDateString('id-ID', {
                    day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'
                }))}
            </div>`;
    } catch (err) {
        document.getElementById('detail-body').innerHTML =
            `<p style="color:var(--danger)">Gagal memuat detail pembayaran.</p>`;
    }
}

function detailRow(label, value) {
    return `<div style="display:flex;justify-content:space-between;padding:8px 0;
                        border-bottom:1px solid var(--border);">
        <span style="color:var(--muted);font-size:13px;">${escHtml(label)}</span>
        <span style="font-weight:600;font-size:13px;">${escHtml(String(value))}</span>
    </div>`;
}

// ─── Modal helpers ────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

function showTableLoading(show) {
    if (show) {
        document.getElementById('tabel-pembayaran').innerHTML =
            '<tr class="loading-row"><td colspan="7"><span class="spinner"></span></td></tr>';
    }
}

function showFieldError(elId, msg) {
    const el = document.getElementById(elId);
    document.getElementById(elId + '-msg').textContent = msg;
    el.style.display = 'flex';
}
function hideError(elId) {
    document.getElementById(elId).style.display = 'none';
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

// Tutup modal saat klik di luar
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
    }
});

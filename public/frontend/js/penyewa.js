/**
 * penyewa.js – Property Management: Penyewa
 * Manajemen Kos Al-Firdaus – Dev 2 (Rafi)
 *
 * Terhubung ke PenyewaController.php:
 *   GET    /api/penyewa        → index()   — list semua penyewa aktif
 *   POST   /api/penyewa        → store()   — daftarkan penyewa (kamar → 'terisi')
 *   GET    /api/penyewa/{id}   → show()    — detail penyewa
 *   PUT    /api/penyewa/{id}   → update()  — edit data penyewa
 *   DELETE /api/penyewa/{id}   → destroy() — catat keluar + kamar → 'tersedia'
 *
 * Terhubung juga ke KamarController:
 *   GET    /api/kamar          → untuk isi dropdown pilih kamar (status = tersedia)
 */

// ─── State ────────────────────────────────────────────────────────────────────
let allPenyewa    = [];
let allKamar      = [];
let editPenyewaId = null;
let keluarId      = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    renderUserInfo();
    loadPenyewa();
    loadKamarTersedia();
    bindEvents();
});

// ─── Load & Render ────────────────────────────────────────────────────────────
async function loadPenyewa() {
    showLoading(true);
    try {
        const res  = await axios.get('/penyewa');
        allPenyewa = res.data.data || [];
        renderTable(allPenyewa);
        updateStats(allPenyewa);
    } catch (err) {
        showToast('Gagal memuat data penyewa.', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadKamarTersedia() {
    try {
        const res = await axios.get('/kamar');
        allKamar  = (res.data.data || []).filter(k => k.status === 'tersedia');
        renderKamarDropdown(allKamar);
    } catch (err) {
        // silent
    }
}

function renderTable(data) {
    const tbody = document.getElementById('penyewa-tbody');
    const empty = document.getElementById('empty-state');

    if (!data || data.length === 0) {
        tbody.innerHTML = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = data.map((p, i) => {
        const inisial  = getInisial(p.nama);
        const tglMasuk = formatDate(p.tanggal_masuk);
        const kontrak  = `${p.durasi_kontrak} Bulan`;
        const nomorKamar = p.kamar?.nomor_kamar || '-';
        return `
        <tr class="table-row">
            <td class="td-num">${i + 1}</td>
            <td class="td-nama">
                <div class="avatar">${inisial}</div>
                <div>
                    <div class="nama-text">${escHtml(p.nama)}</div>
                    <div class="nik-text">${escHtml(p.no_identitas)}</div>
                </div>
            </td>
            <td><span class="kamar-badge">${escHtml(nomorKamar)}</span></td>
            <td class="td-muted">${escHtml(p.no_telepon)}</td>
            <td class="td-muted">${tglMasuk}</td>
            <td class="td-muted">${kontrak}</td>
            <td class="td-aksi">
                <button class="btn-action btn-edit-sm" onclick="openEditModal(${p.id})">
                    <span class="material-symbols-outlined">edit</span> Edit
                </button>
                <button class="btn-action btn-keluar" onclick="openKeluarModal(${p.id}, '${escHtml(p.nama)}')">
                    <span class="material-symbols-outlined">logout</span> Keluar
                </button>
            </td>
        </tr>`;
    }).join('');
}

function renderKamarDropdown(kamarList) {
    const sel = document.getElementById('f-kamar');
    const cur = sel.value;
    // Hanya option tersedia (untuk tambah baru)
    const options = kamarList.map(k =>
        `<option value="${k.id}">Kamar ${escHtml(k.nomor_kamar)} – ${escHtml(k.tipe)} (Rp ${Number(k.harga_per_bulan).toLocaleString('id-ID')})</option>`
    ).join('');
    sel.innerHTML = `<option value="">-- Pilih Kamar --</option>` + options;
    if (cur) sel.value = cur;
}

function updateStats(data) {
    document.getElementById('stat-total').textContent = data.length;
}

function filterPenyewa() {
    const q = document.getElementById('search-input').value.toLowerCase();
    const filtered = allPenyewa.filter(p =>
        p.nama.toLowerCase().includes(q) ||
        (p.kamar?.nomor_kamar || '').toLowerCase().includes(q) ||
        p.no_telepon.includes(q)
    );
    renderTable(filtered);
}

// ─── Modal: Tambah ────────────────────────────────────────────────────────────
function openAddModal() {
    editPenyewaId = null;
    document.getElementById('modal-title').textContent = 'Daftarkan Penyewa Baru';
    document.getElementById('btn-save-text').textContent = 'Daftarkan';
    document.getElementById('form-kamar-group').style.display = 'block';
    clearForm();
    clearErrors();
    // Reload kamar tersedia untuk dropdown
    loadKamarTersedia();
    openModal('modal-form');
}

async function openEditModal(id) {
    editPenyewaId = id;
    document.getElementById('modal-title').textContent = 'Edit Data Penyewa';
    document.getElementById('btn-save-text').textContent = 'Simpan Perubahan';
    // Saat edit, tidak bisa ganti kamar
    document.getElementById('form-kamar-group').style.display = 'none';
    clearErrors();
    openModal('modal-form');

    try {
        const res = await axios.get(`/penyewa/${id}`);
        const p   = res.data.data;
        document.getElementById('f-nama').value          = p.nama;
        document.getElementById('f-identitas').value     = p.no_identitas;
        document.getElementById('f-telepon').value       = p.no_telepon;
        document.getElementById('f-tgl-masuk').value     = p.tanggal_masuk
            ? p.tanggal_masuk.split('T')[0]
            : '';
        document.getElementById('f-durasi').value        = p.durasi_kontrak;
    } catch (err) {
        showToast('Gagal memuat data penyewa.', 'error');
        closeModal('modal-form');
    }
}

async function savePenyewa() {
    clearErrors();

    const nama      = document.getElementById('f-nama').value.trim();
    const identitas = document.getElementById('f-identitas').value.trim();
    const telepon   = document.getElementById('f-telepon').value.trim();
    const tglMasuk  = document.getElementById('f-tgl-masuk').value;
    const durasi    = document.getElementById('f-durasi').value;
    const kamarId   = document.getElementById('f-kamar').value;

    let valid = true;
    if (!nama)      { showErr('err-nama',      'Nama wajib diisi.');                valid = false; }
    if (!identitas) { showErr('err-identitas', 'No. identitas wajib diisi.');       valid = false; }
    if (!telepon)   { showErr('err-telepon',   'No. telepon wajib diisi.');          valid = false; }
    if (!tglMasuk)  { showErr('err-tgl',       'Tanggal masuk wajib diisi.');       valid = false; }
    if (!durasi || Number(durasi) < 1) {
        showErr('err-durasi', 'Durasi kontrak minimal 1 bulan.');
        valid = false;
    }
    if (!editPenyewaId && !kamarId) {
        showErr('err-kamar', 'Pilih kamar terlebih dahulu.');
        valid = false;
    }
    if (!valid) return;

    const payload = { nama, no_identitas: identitas, no_telepon: telepon, tanggal_masuk: tglMasuk, durasi_kontrak: Number(durasi) };
    if (!editPenyewaId) payload.kamar_id = Number(kamarId);

    setBtnLoading('btn-save', true);
    try {
        if (editPenyewaId) {
            await axios.put(`/penyewa/${editPenyewaId}`, payload);
            showToast('Data penyewa berhasil diperbarui.', 'success');
        } else {
            await axios.post('/penyewa', payload);
            showToast('Penyewa berhasil didaftarkan.', 'success');
        }
        closeModal('modal-form');
        loadPenyewa();
        loadKamarTersedia();
    } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
            if (errors.nama)           showErr('err-nama',      errors.nama[0]);
            if (errors.no_identitas)   showErr('err-identitas', errors.no_identitas[0]);
            if (errors.no_telepon)     showErr('err-telepon',   errors.no_telepon[0]);
            if (errors.tanggal_masuk)  showErr('err-tgl',       errors.tanggal_masuk[0]);
            if (errors.durasi_kontrak) showErr('err-durasi',    errors.durasi_kontrak[0]);
            if (errors.kamar_id)       showErr('err-kamar',     errors.kamar_id[0]);
        } else {
            showToast(err.response?.data?.message || 'Gagal menyimpan data.', 'error');
        }
    } finally {
        setBtnLoading('btn-save', false);
    }
}

// ─── Modal: Penyewa Keluar ────────────────────────────────────────────────────
function openKeluarModal(id, nama) {
    keluarId = id;
    document.getElementById('keluar-nama').textContent = nama;
    openModal('modal-keluar');
}

async function confirmKeluar() {
    if (!keluarId) return;
    setBtnLoading('btn-confirm-keluar', true);
    try {
        // DELETE /api/penyewa/{id} → set tanggal_keluar + kamar status = tersedia
        await axios.delete(`/penyewa/${keluarId}`);
        showToast('Penyewa berhasil dicatat keluar. Kamar kembali tersedia.', 'success');
        closeModal('modal-keluar');
        loadPenyewa();
        loadKamarTersedia();
    } catch (err) {
        showToast(err.response?.data?.message || 'Gagal mencatat penyewa keluar.', 'error');
    } finally {
        setBtnLoading('btn-confirm-keluar', false);
        keluarId = null;
    }
}

// ─── Events ───────────────────────────────────────────────────────────────────
function bindEvents() {
    document.getElementById('btn-add').addEventListener('click', openAddModal);
    document.getElementById('btn-save').addEventListener('click', savePenyewa);
    document.getElementById('btn-confirm-keluar').addEventListener('click', confirmKeluar);
    document.getElementById('search-input').addEventListener('input', filterPenyewa);
    document.getElementById('btn-logout').addEventListener('click', () => logout());

    document.querySelectorAll('.modal-overlay').forEach(el => {
        el.addEventListener('click', e => {
            if (e.target === el) closeModal(el.id);
        });
    });
}

// ─── Helpers UI ───────────────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function clearForm() {
    ['f-nama','f-identitas','f-telepon','f-tgl-masuk','f-durasi'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-kamar').value = '';
}

function clearErrors() {
    ['err-nama','err-identitas','err-telepon','err-tgl','err-durasi','err-kamar'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    });
}

function showErr(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showLoading(on) {
    const el = document.getElementById('loading-state');
    if (el) el.style.display = on ? 'flex' : 'none';
}

function setBtnLoading(id, on) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = on;
    const sp = btn.querySelector('.btn-spinner');
    if (sp) sp.style.display = on ? 'inline-block' : 'none';
}

function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const icon  = document.getElementById('toast-icon');
    const text  = document.getElementById('toast-text');
    toast.className = `toast toast-${type}`;
    icon.textContent = type === 'success' ? 'check_circle' : 'error';
    text.textContent = msg;
    toast.style.display = 'flex';
    setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// ─── Helpers Data ─────────────────────────────────────────────────────────────
function getInisial(nama) {
    if (!nama) return '?';
    const parts = nama.trim().split(' ');
    return parts.length >= 2
        ? (parts[0][0] + parts[1][0]).toUpperCase()
        : parts[0].substring(0, 2).toUpperCase();
}

function formatDate(str) {
    if (!str) return '-';
    const d = new Date(str);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

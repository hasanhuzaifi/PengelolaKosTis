/**
 * kamar.js – Property Management: Kamar
 * Manajemen Kos Al-Firdaus – Dev 2 (Rafi)
 *
 * Terhubung ke KamarController.php:
 *   GET    /api/kamar          → index()   — list semua kamar
 *   POST   /api/kamar          → store()   — tambah kamar
 *   GET    /api/kamar/{id}     → show()    — detail kamar
 *   PUT    /api/kamar/{id}     → update()  — edit kamar
 *   DELETE /api/kamar/{id}     → destroy() — soft delete
 *
 * Struktur response:
 *   { success: true, data: [...], message: '...' }
 */

// ─── State ────────────────────────────────────────────────────────────────────
let allKamar   = [];
let editId     = null;
let deleteId   = null;

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    requireAuth();
    renderUserInfo();
    loadKamar();
    bindEvents();
});

// ─── Load & Render ────────────────────────────────────────────────────────────
async function loadKamar() {
    showListLoading(true);
    try {
        const res   = await axios.get('/kamar');
        allKamar    = res.data.data || [];
        renderKamar(allKamar);
        updateStats(allKamar);
    } catch (err) {
        showToast('Gagal memuat data kamar.', 'error');
    } finally {
        showListLoading(false);
    }
}

function renderKamar(data) {
    const grid  = document.getElementById('kamar-grid');
    const empty = document.getElementById('empty-state');

    if (!data || data.length === 0) {
        grid.innerHTML  = '';
        empty.style.display = 'flex';
        return;
    }
    empty.style.display = 'none';

    grid.innerHTML = data.map(k => {
        const fasilitas = parseFasilitas(k.fasilitas);
        const isTersedia = k.status === 'tersedia';
        return `
        <div class="kamar-card" data-id="${k.id}">
            <div class="kamar-card-header">
                <div class="kamar-number">
                    <span class="material-symbols-outlined">meeting_room</span>
                    ${escHtml(k.nomor_kamar)}
                </div>
                <span class="badge ${isTersedia ? 'badge-success' : 'badge-warning'}">
                    <span class="material-symbols-outlined" style="font-size:12px">
                        ${isTersedia ? 'check_circle' : 'person'}
                    </span>
                    ${isTersedia ? 'Tersedia' : 'Terisi'}
                </span>
            </div>
            <div class="kamar-tipe">${escHtml(k.tipe)}</div>
            <div class="kamar-harga">
                ${formatRupiah(k.harga_per_bulan)}
                <span class="kamar-harga-label">/bulan</span>
            </div>
            <div class="kamar-fasilitas">
                ${fasilitas.length > 0
                    ? fasilitas.map(f => `<span class="fasil-tag"><span class="material-symbols-outlined" style="font-size:12px">check</span>${escHtml(f)}</span>`).join('')
                    : '<span class="fasil-empty">Tidak ada fasilitas</span>'
                }
            </div>
            ${k.penyewa_aktif ? `
            <div class="kamar-tenant">
                <span class="material-symbols-outlined" style="font-size:14px;color:var(--muted)">person</span>
                <span>${escHtml(k.penyewa_aktif.nama)}</span>
            </div>` : ''}
            <div class="kamar-actions">
                <button class="btn-action btn-edit" onclick="openEditModal(${k.id})">
                    <span class="material-symbols-outlined">edit</span> Edit
                </button>
                <button class="btn-action btn-delete" onclick="openDeleteModal(${k.id}, '${escHtml(k.nomor_kamar)}')">
                    <span class="material-symbols-outlined">delete</span> Hapus
                </button>
            </div>
        </div>`;
    }).join('');
}

function updateStats(data) {
    const total    = data.length;
    const tersedia = data.filter(k => k.status === 'tersedia').length;
    const terisi   = data.filter(k => k.status === 'terisi').length;
    document.getElementById('stat-total').textContent    = total;
    document.getElementById('stat-tersedia').textContent = tersedia;
    document.getElementById('stat-terisi').textContent   = terisi;
}

function filterKamar() {
    const q      = document.getElementById('search-input').value.toLowerCase();
    const status = document.getElementById('filter-status').value;
    const tipe   = document.getElementById('filter-tipe').value.toLowerCase();

    const filtered = allKamar.filter(k => {
        const matchSearch = k.nomor_kamar.toLowerCase().includes(q) ||
                            k.tipe.toLowerCase().includes(q);
        const matchStatus = !status || k.status === status;
        const matchTipe   = !tipe || k.tipe.toLowerCase().includes(tipe);
        return matchSearch && matchStatus && matchTipe;
    });
    renderKamar(filtered);
}

// ─── Modal: Tambah / Edit ─────────────────────────────────────────────────────
function openAddModal() {
    editId = null;
    document.getElementById('modal-title').textContent = 'Tambah Kamar Baru';
    document.getElementById('btn-save-text').textContent = 'Simpan Kamar';
    clearForm();
    clearFormErrors();
    openModal('modal-form');
}

async function openEditModal(id) {
    editId = id;
    document.getElementById('modal-title').textContent = 'Edit Data Kamar';
    document.getElementById('btn-save-text').textContent = 'Simpan Perubahan';
    clearFormErrors();
    openModal('modal-form');

    try {
        const res = await axios.get(`/kamar/${id}`);
        const k   = res.data.data;
        document.getElementById('f-nomor').value  = k.nomor_kamar;
        document.getElementById('f-tipe').value   = k.tipe;
        document.getElementById('f-harga').value  = k.harga_per_bulan;
        document.getElementById('f-status').value = k.status;

        const fasilitas = parseFasilitas(k.fasilitas);
        document.getElementById('f-fasilitas').value = fasilitas.join(', ');
    } catch (err) {
        showToast('Gagal memuat data kamar.', 'error');
        closeModal('modal-form');
    }
}

async function saveKamar() {
    clearFormErrors();

    const nomor   = document.getElementById('f-nomor').value.trim();
    const tipe    = document.getElementById('f-tipe').value.trim();
    const harga   = document.getElementById('f-harga').value;
    const status  = document.getElementById('f-status').value;
    const fasText = document.getElementById('f-fasilitas').value.trim();

    let valid = true;
    if (!nomor)  { showFieldError('err-nomor',  'Nomor kamar wajib diisi.');  valid = false; }
    if (!tipe)   { showFieldError('err-tipe',   'Tipe kamar wajib diisi.');   valid = false; }
    if (!harga || isNaN(harga) || Number(harga) < 0) {
        showFieldError('err-harga', 'Harga harus berupa angka positif.');
        valid = false;
    }
    if (!valid) return;

    const fasilitas = fasText ? fasText.split(',').map(f => f.trim()).filter(f => f) : [];
    const payload = { nomor_kamar: nomor, tipe, harga_per_bulan: Number(harga), status, fasilitas };

    setBtnLoading('btn-save', true);
    try {
        if (editId) {
            await axios.put(`/kamar/${editId}`, payload);
            showToast('Kamar berhasil diperbarui.', 'success');
        } else {
            await axios.post('/kamar', payload);
            showToast('Kamar berhasil ditambahkan.', 'success');
        }
        closeModal('modal-form');
        loadKamar();
    } catch (err) {
        const errors = err.response?.data?.errors;
        if (errors) {
            if (errors.nomor_kamar) showFieldError('err-nomor', errors.nomor_kamar[0]);
            if (errors.tipe)        showFieldError('err-tipe',  errors.tipe[0]);
            if (errors.harga_per_bulan) showFieldError('err-harga', errors.harga_per_bulan[0]);
        } else {
            showToast(err.response?.data?.message || 'Gagal menyimpan kamar.', 'error');
        }
    } finally {
        setBtnLoading('btn-save', false);
    }
}

// ─── Modal: Delete ────────────────────────────────────────────────────────────
function openDeleteModal(id, nomor) {
    deleteId = id;
    document.getElementById('delete-kamar-name').textContent = `Kamar ${nomor}`;
    openModal('modal-delete');
}

async function confirmDelete() {
    if (!deleteId) return;
    setBtnLoading('btn-confirm-delete', true);
    try {
        await axios.delete(`/kamar/${deleteId}`);
        showToast('Kamar berhasil dihapus.', 'success');
        closeModal('modal-delete');
        loadKamar();
    } catch (err) {
        const msg = err.response?.data?.message || 'Gagal menghapus kamar.';
        showToast(msg, 'error');
    } finally {
        setBtnLoading('btn-confirm-delete', false);
        deleteId = null;
    }
}

// ─── Events ───────────────────────────────────────────────────────────────────
function bindEvents() {
    document.getElementById('btn-add').addEventListener('click', openAddModal);
    document.getElementById('btn-save').addEventListener('click', saveKamar);
    document.getElementById('btn-confirm-delete').addEventListener('click', confirmDelete);
    document.getElementById('search-input').addEventListener('input', filterKamar);
    document.getElementById('filter-status').addEventListener('change', filterKamar);
    document.getElementById('filter-tipe').addEventListener('change', filterKamar);
    document.getElementById('btn-logout').addEventListener('click', () => logout());

    // Close modal on overlay click
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
    ['f-nomor','f-tipe','f-harga','f-fasilitas'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('f-status').value = 'tersedia';
}

function clearFormErrors() {
    ['err-nomor','err-tipe','err-harga'].forEach(id => {
        const el = document.getElementById(id);
        if (el) { el.textContent = ''; el.style.display = 'none'; }
    });
}

function showFieldError(id, msg) {
    const el = document.getElementById(id);
    if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function showListLoading(on) {
    const el = document.getElementById('loading-state');
    if (el) el.style.display = on ? 'flex' : 'none';
    const grid = document.getElementById('kamar-grid');
    if (grid) grid.style.opacity = on ? '0.4' : '1';
}

function setBtnLoading(id, on) {
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.disabled = on;
    const spinner = btn.querySelector('.btn-spinner');
    if (spinner) spinner.style.display = on ? 'inline-block' : 'none';
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
function parseFasilitas(raw) {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
}

function formatRupiah(num) {
    return 'Rp ' + Number(num).toLocaleString('id-ID');
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

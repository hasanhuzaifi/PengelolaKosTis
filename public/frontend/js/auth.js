/**
 * auth.js – Auth Service Frontend
 * Manajemen Kos Al-Firdaus
 *
 * Tanggung jawab:
 *  - Menyimpan & menghapus JWT token di localStorage
 *  - Auto-inject Authorization header ke semua request Axios
 *  - Fungsi helper: register, login, logout, getProfile, updateProfile
 *  - Guard: redirect ke login jika token tidak ada (gunakan requireAuth())
 */

// ─── Base URL API ────────────────────────────────────────────────────────────
// Sesuaikan jika port berbeda
const API_BASE_URL = 'http://localhost:8000/api';

// ─── Setup Axios defaults ────────────────────────────────────────────────────
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Accept'] = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Inject token dari localStorage ke setiap request jika ada
const storedToken = localStorage.getItem('token');
if (storedToken) {
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + storedToken;
}

// ─── Interceptor: tangani 401 global (token expired / tidak valid) ────────────
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // Hapus token kedaluwarsa & redirect ke login
      clearAuth();
      // Jangan redirect jika sudah di halaman login/register
      const path = window.location.pathname;
      if (!path.includes('login.html') && !path.includes('register.html')) {
        window.location.href = 'login.html';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Helper: simpan token ────────────────────────────────────────────────────
function setToken(token) {
  localStorage.setItem('token', token);
  axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

// ─── Helper: hapus token ─────────────────────────────────────────────────────
function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
}

// ─── Guard: panggil di setiap halaman yang butuh login ───────────────────────
function requireAuth() {
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
  }
}

// ─── Auth API Functions ──────────────────────────────────────────────────────

/**
 * Register akun pemilik kos baru
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
async function register(name, email, password) {
  const response = await axios.post('/register', {
    name,
    email,
    password,
    password_confirmation: password,
    role: 'admin'
  });
  return response.data;
}

/**
 * Login dan simpan token JWT
 * @param {string} email
 * @param {string} password
 * @returns {Promise}
 */
async function login(email, password) {
  const response = await axios.post('/login', { email, password });
  const data = response.data;

  // Simpan token
  const token = data.data?.token || data.token;
  if (token) {
    setToken(token);
  }

  // Simpan info user
  const user = data.data?.user || data.user;
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  return data;
}

/**
 * Logout dan hapus token
 * @returns {Promise}
 */
async function logout() {
  try {
    await axios.post('/logout');
  } finally {
    clearAuth();
    window.location.href = 'login.html';
  }
}

/**
 * Ambil profil pemilik kos yang sedang login
 * @returns {Promise}
 */
async function getProfile() {
  const response = await axios.get('/profile');
  return response.data;
}

/**
 * Update profil pemilik kos
 * @param {Object} payload - { name, email, password? }
 * @returns {Promise}
 */
async function updateProfile(payload) {
  const response = await axios.put('/profile', payload);
  return response.data;
}

// ─── Helper: ambil data user dari localStorage ───────────────────────────────
function getCurrentUser() {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

// ─── Helper: render nama user di navbar ─────────────────────────────────────
function renderUserInfo() {
  const user = getCurrentUser();
  const el = document.getElementById('user-name');
  if (el && user) {
    el.textContent = user.name || 'Admin';
  }
}

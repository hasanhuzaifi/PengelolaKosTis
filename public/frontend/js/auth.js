/**
 * auth.js – Auth Service Frontend
 * Manajemen Kos Al-Firdaus
 * Sinkron dengan AuthController.php (Dev 1 - Hasan)
 *
 * Response structure dari backend:
 *   { status, message, data: { token, user } }  ← login
 *   { status, message, data: { user } }          ← register / profile
 *   { status, message }                          ← logout
 */

// ─── Base URL ─────────────────────────────────────────────────────────────────
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// ─── Axios defaults ───────────────────────────────────────────────────────────
axios.defaults.baseURL = API_BASE_URL;
axios.defaults.headers.common['Accept']       = 'application/json';
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Inject token dari localStorage jika sudah ada
const _storedToken = localStorage.getItem('token');
if (_storedToken) {
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + _storedToken;
}

// ─── Interceptor 401 global ───────────────────────────────────────────────────
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            clearAuth();
            const path = window.location.pathname;
            if (!path.includes('login.html') && !path.includes('register.html')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ─── Helpers token ────────────────────────────────────────────────────────────
function setToken(token) {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
}

function clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
}

function requireAuth() {
    if (!localStorage.getItem('token')) {
        window.location.href = '/login';
    }
}

function getCurrentUser() {
    const raw = localStorage.getItem('user');
    try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function renderUserInfo() {
    const user = getCurrentUser();
    const el = document.getElementById('user-name');
    if (el && user) el.textContent = user.name || 'Admin';
}

// ─── API Functions ────────────────────────────────────────────────────────────

/**
 * Register – POST /api/register
 * Backend expects: name, email, password, password_confirmation
 * Backend returns: { status:'success', message, data:{ user } } 201
 */
async function register(name, email, password) {
    const response = await axios.post('/register', {
        name,
        email,
        password,
        password_confirmation: password,
        role: 'admin'          // backend hardcode 'admin', tapi kirim saja
    });
    return response.data;
}

/**
 * Login – POST /api/login
 * Backend expects: email, password
 * Backend returns: { status:'success', message, data:{ token, user } } 200
 */
async function login(email, password) {
    const response = await axios.post('/login', { email, password });
    const data = response.data;

    // Ambil token & user dari data.data (sesuai struktur AuthController)
    const token = data.data?.token;
    const user  = data.data?.user;

    if (token) setToken(token);
    if (user)  localStorage.setItem('user', JSON.stringify(user));

    return data;
}

/**
 * Logout – POST /api/logout  [JWT]
 * Backend returns: { status:'success', message } 200
 */
async function logout() {
    try {
        await axios.post('/logout');
    } catch (e) {
        // token sudah expired/invalid, tetap lanjut hapus lokal
    } finally {
        clearAuth();
        window.location.href = '/login';
    }
}

/**
 * Get Profile – GET /api/profile  [JWT]
 * Backend returns: { status:'success', data:{ user } } 200
 */
async function getProfile() {
    const response = await axios.get('/profile');
    return response.data;
}

/**
 * Update Profile – PUT /api/profile  [JWT]
 * Backend expects: name?, email?, password?, password_confirmation?
 * Backend returns: { status:'success', message, data:{ user } } 200
 */
async function updateProfile(payload) {
    const response = await axios.put('/profile', payload);
    return response.data;
}
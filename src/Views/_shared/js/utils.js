// src/Views/_shared/js/utils.js
const API_URL = 'http://localhost:3000/api';

// === UTILITÁRIOS DE DATA ===
function formatarData(data) {
    if (!data) return 'Data não disponível';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
    });
}

function formatarDataHora(data) {
    if (!data) return 'Data não disponível';
    return new Date(data).toLocaleString('pt-BR');
}

// === ALERTAS ===
function showAlert(message, type = 'info') {
    const existingAlert = document.querySelector('.alerta');
    if (existingAlert) existingAlert.remove();

    const alertContainer = document.getElementById('alert-container') || 
                          document.querySelector('.auth-card') ||
                          document.body;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alerta alerta-${type === 'error' ? 'erro' : type === 'success' ? 'sucesso' : 'info'}`;
    alertDiv.innerHTML = `<span>${message}</span>`;
    
    alertContainer.insertBefore(alertDiv, alertContainer.firstChild);
    
    setTimeout(() => {
        if (alertDiv.parentElement) alertDiv.remove();
    }, 5000);
}

// === AUTENTICAÇÃO ===
function getUsuarioLogado() {
    try {
        const user = localStorage.getItem('usuario');
        return user ? JSON.parse(user) : null;
    } catch {
        return null;
    }
}

function getToken() {
    return localStorage.getItem('token');
}

function setUsuarioLogado(usuario, token) {
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('token', token);
}

function logout() {
    localStorage.removeItem('usuario');
    localStorage.removeItem('token');
    window.location.href = '/usuario/login';
}

function getAuthHeader() {
    const token = getToken();
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

// === VALIDAÇÕES ===
function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
    return senha && senha.length >= 8;
}

function validarConfirmacao(valor1, valor2) {
    return valor1 === valor2;
}

// === UTILITÁRIOS ===
function gerarSlug(texto) {
    return texto.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

// ✅ EXPORTAÇÕES NAMED (para import)
export {
    formatarData,
    formatarDataHora,
    showAlert,
    getUsuarioLogado,
    getToken,
    setUsuarioLogado,
    logout,
    getAuthHeader,
    validarEmail,
    validarSenha,
    validarConfirmacao,
    gerarSlug,
    debounce,
    API_URL
};

// ✅ GLOBAL (para <script> sem import)
window.API_URL = API_URL;
window.formatarData = formatarData;
window.formatarDataHora = formatarDataHora;
window.showAlert = showAlert;
window.getUsuarioLogado = getUsuarioLogado;
window.getToken = getToken;
window.setUsuarioLogado = setUsuarioLogado;
window.logout = logout;
window.getAuthHeader = getAuthHeader;
window.validarEmail = validarEmail;
window.validarSenha = validarSenha;
window.validarConfirmacao = validarConfirmacao;
window.gerarSlug = gerarSlug;
window.debounce = debounce;

console.log('✅ utils.js carregado com sucesso!');
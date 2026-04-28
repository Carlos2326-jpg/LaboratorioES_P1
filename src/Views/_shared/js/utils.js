const API_URL = 'http://localhost:3000/api';

function formatarData(data) {
    if (!data) return 'Data não disponível';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarDataHora(data) {
    if (!data) return 'Data não disponível';
    return new Date(data).toLocaleString('pt-BR');
}

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    const alertDiv = document.createElement('div');
    alertDiv.className = `alerta alerta-${type === 'error' ? 'erro' : type === 'success' ? 'sucesso' : type}`;
    alertDiv.innerHTML = `<span>${message}</span>`;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);
    setTimeout(() => { if (alertDiv.parentElement) alertDiv.remove(); }, 5000);
}

function getUsuarioLogado() {
    const user = localStorage.getItem('usuario');
    return user ? JSON.parse(user) : null;
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

function validarEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validarSenha(senha) {
    return senha && senha.length >= 8;
}

function validarConfirmacao(valor1, valor2) {
    return valor1 === valor2;
}

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

// Expõe globalmente para scripts sem type="module"
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

// Compatibilidade com import (type="module")
try {
    if (typeof exports !== 'undefined') {
        exports.API_URL = API_URL;
    }
} catch(e) {}
import { API_URL, showAlert, setUsuarioLogado } from '../../_shared/js/utils.js';

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        showAlert('Preencha todos os campos', 'error');
        return;
    }

    try {
        // Corrigido: URL alinhada com api.js
        const response = await fetch(`${API_URL}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha: password })
        });

        const result = await response.json();

        if (result.success) {
            setUsuarioLogado(result.data.usuario, result.data.token);
            showAlert('Login realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showAlert('Erro ao fazer login', 'error');
    }
});
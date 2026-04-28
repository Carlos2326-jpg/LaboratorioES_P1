import { API_URL, showAlert, validarEmail, validarSenha, validarConfirmacao, setUsuarioLogado } from '../../_shared/js/utils.js';

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const confirmEmail = document.getElementById('confirm-email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!nome || !email || !password) {
        showAlert('Preencha todos os campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        showAlert('Digite um e-mail válido', 'error');
        return;
    }

    if (!validarConfirmacao(email, confirmEmail)) {
        showAlert('Os e-mails não coincidem', 'error');
        return;
    }

    if (!validarSenha(password)) {
        showAlert('A senha deve ter no mínimo 8 caracteres', 'error');
        return;
    }

    if (!validarConfirmacao(password, confirmPassword)) {
        showAlert('As senhas não coincidem', 'error');
        return;
    }

    try {
        // Corrigido: URL alinhada com api.js
        const response = await fetch(`${API_URL}/usuario/cadastrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nome,
                email,
                confirmarEmail: confirmEmail,
                senha: password,
                confirmarSenha: confirmPassword
            })
        });

        const result = await response.json();

        if (result.success) {
            setUsuarioLogado(result.data.usuario, result.data.token);
            showAlert('Cadastro realizado com sucesso!', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showAlert('Erro ao cadastrar usuário', 'error');
    }
});
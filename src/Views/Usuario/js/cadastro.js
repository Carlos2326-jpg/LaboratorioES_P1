// utils.js já carregado no HTML — todas as funções disponíveis globalmente

document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const confirmarEmail = document.getElementById('confirmar-email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;

    if (!nome || !email || !senha) {
        showAlert('Preencha todos os campos', 'error');
        return;
    }

    if (!validarEmail(email)) {
        showAlert('Digite um e-mail válido', 'error');
        return;
    }

    if (!validarConfirmacao(email, confirmarEmail)) {
        showAlert('Os e-mails não coincidem', 'error');
        return;
    }

    if (!validarSenha(senha)) {
        showAlert('A senha deve ter no mínimo 8 caracteres', 'error');
        return;
    }

    if (!validarConfirmacao(senha, confirmarSenha)) {
        showAlert('As senhas não coincidem', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuario/cadastrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, confirmarEmail, senha, confirmarSenha })
        });

        const result = await response.json();

        if (result.success) {
            setUsuarioLogado(result.data.usuario, result.data.token);
            showAlert('Cadastro realizado com sucesso!', 'success');
            setTimeout(() => { window.location.href = '/home'; }, 1500);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao cadastrar:', error);
        showAlert('Erro ao cadastrar usuário', 'error');
    }
});
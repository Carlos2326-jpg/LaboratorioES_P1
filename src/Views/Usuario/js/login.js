// utils.js já carregado no HTML — todas as funções disponíveis globalmente

document.getElementById('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
        showAlert('Preencha todos os campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuario/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });

        const result = await response.json();

        if (result.success) {
            setUsuarioLogado(result.data.usuario, result.data.token);
            showAlert('Login realizado com sucesso!', 'success');
            setTimeout(() => { window.location.href = '/home'; }, 1500);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
        showAlert('Erro ao fazer login', 'error');
    }
});
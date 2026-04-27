import { validarEmail, validarSenha, campoVazio } from '../../_shared/js/validacao.js';

const form = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');
const alertaGlobal = document.getElementById('alerta-global');

function mostrarErro(inputEl, erroEl, mensagem) {
    inputEl.classList.add('input-erro');
    erroEl.textContent = mensagem;
}

function limparErro(inputEl, erroEl) {
    inputEl.classList.remove('input-erro');
    erroEl.textContent = '';
}

function validarFormulario() {
    const email = inputEmail.value;
    const senha = inputSenha.value;
    const erroEmail = document.getElementById('erro-email');
    const erroSenha = document.getElementById('erro-senha');
    let valido = true;

    limparErro(inputEmail, erroEmail);
    limparErro(inputSenha, erroSenha);
    alertaGlobal.style.display = 'none';

    if (campoVazio(email)) {
        mostrarErro(inputEmail, erroEmail, 'Informe seu e-mail.');
        valido = false;
    } else if (!validarEmail(email)) {
        mostrarErro(inputEmail, erroEmail, 'E-mail inválido.');
        valido = false;
    }

    if (campoVazio(senha)) {
        mostrarErro(inputSenha, erroSenha, 'Informe sua senha.');
        valido = false;
    } else if (!validarSenha(senha)) {
        mostrarErro(inputSenha, erroSenha, 'A senha deve ter pelo menos 8 caracteres.');
        valido = false;
    }

    return valido;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    // Aí aqui embaixo a gente compara fml depois no caso
    console.log('Login enviado:', { email: inputEmail.value });
    window.location.href = '../Home/index.html';
});

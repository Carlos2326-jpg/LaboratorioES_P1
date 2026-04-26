import { validarEmail, validarSenha, campoVazio } from '../../_shared/js/validacao.js';

const form = document.getElementById('form-login');
const inputEmail = document.getElementById('email');
const inputSenha = document.getElementById('senha');

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

form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validarFormulario()) return;

    document.getElementById("form-login").addEventListener("submit", (e) => {
      e.preventDefault();

      // validação básica (trocar depois)
      
      localStorage.setItem("usuario", "logado");

      window.location.href = "../Home/index.html";
    });
});

import { validarEmail, validarSenha, campoVazio, validarConfirmacao } from '../../_shared/js/validacao.js';

const form = document.getElementById('form-cadastro');
const alertaGlobal = document.getElementById('alerta-global');

function mostrarErro(id, inputId, mensagem) {
    const erroEl = document.getElementById(id);
    const inputEl = document.getElementById(inputId);
    inputEl.classList.add('input-erro');
    erroEl.textContent = mensagem;
}

function limparTodos() {
    ['nome','email','confirmar-email','senha','confirmar-senha'].forEach(id => {
        const input = document.getElementById(id);
        const erro = document.getElementById('erro-' + id);
        if (input) input.classList.remove('input-erro');
        if (erro) erro.textContent = '';
    });
    alertaGlobal.style.display = 'none';
}

function validarFormulario() {
    limparTodos();
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const confirmarEmail = document.getElementById('confirmar-email').value;
    const senha = document.getElementById('senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    let valido = true;

    if (campoVazio(nome)) {
        mostrarErro('erro-nome', 'nome', 'Informe seu nome completo.');
        valido = false;
    }

    if (campoVazio(email)) {
        mostrarErro('erro-email', 'email', 'Informe seu e-mail.');
        valido = false;
    } else if (!validarEmail(email)) {
        mostrarErro('erro-email', 'email', 'E-mail inválido.');
        valido = false;
    }

    if (campoVazio(confirmarEmail)) {
        mostrarErro('erro-confirmar-email', 'confirmar-email', 'Confirme seu e-mail.');
        valido = false;
    } else if (!validarConfirmacao(email, confirmarEmail)) {
        mostrarErro('erro-confirmar-email', 'confirmar-email', 'Os e-mails não coincidem.');
        valido = false;
    }

    if (campoVazio(senha)) {
        mostrarErro('erro-senha', 'senha', 'Informe uma senha.');
        valido = false;
    } else if (!validarSenha(senha)) {
        mostrarErro('erro-senha', 'senha', 'A senha deve ter pelo menos 8 caracteres.');
        valido = false;
    }

    if (campoVazio(confirmarSenha)) {
        mostrarErro('erro-confirmar-senha', 'confirmar-senha', 'Confirme sua senha.');
        valido = false;
    } else if (!validarConfirmacao(senha, confirmarSenha)) {
        mostrarErro('erro-confirmar-senha', 'confirmar-senha', 'As senhas não coincidem.');
        valido = false;
    }

    return valido;
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    //Novamente, depois a gente substitui de novo
    console.log('Cadastro enviado');
    window.location.href = '../Usuario/index.html';
});

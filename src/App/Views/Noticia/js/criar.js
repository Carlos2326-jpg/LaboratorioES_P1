import { campoVazio, validarTitulo } from '../../_shared/js/validacao.js';

const form = document.getElementById('form-postagem');
const statusBadge = document.getElementById('status-badge');
const checkAgendamento = document.getElementById('check-agendamento');
const agendamentoFields = document.getElementById('agendamento-fields');

checkAgendamento.addEventListener('change', () => {
    agendamentoFields.classList.toggle('visivel', checkAgendamento.checked);
    statusBadge.textContent = checkAgendamento.checked ? 'Agendado' : 'Rascunho';
});

function mostrarErro(inputId, erroId, mensagem) {
    const input = document.getElementById(inputId);
    const erro = document.getElementById(erroId);
    if (input) input.classList.add('input-erro');
    if (erro) erro.textContent = mensagem;
}

function limparErros() {
    ['titulo','categoria','conteudo'].forEach(id => {
        const input = document.getElementById(id);
        const erro = document.getElementById('erro-' + id);
        if (input) input.classList.remove('input-erro');
        if (erro) erro.textContent = '';
    });
    document.getElementById('alerta-erro').style.display = 'none';
    document.getElementById('alerta-sucesso').style.display = 'none';
}

function validarFormulario() {
    limparErros();
    const titulo = document.getElementById('titulo').value;
    const categoria = document.getElementById('categoria').value;
    const conteudo = document.getElementById('conteudo').value;
    let valido = true;

    if (!validarTitulo(titulo)) {
        mostrarErro('titulo', 'erro-titulo', 'O título deve ter entre 3 e 200 caracteres.');
        valido = false;
    }

    if (campoVazio(categoria)) {
        mostrarErro('categoria', 'erro-categoria', 'Selecione uma categoria.');
        valido = false;
    }

    if (campoVazio(conteudo) || conteudo.trim().length < 10) {
        mostrarErro('conteudo', 'erro-conteudo', 'O conteúdo deve ter pelo menos 10 caracteres.');
        valido = false;
    }

    if (checkAgendamento.checked) {
        const data = document.getElementById('data-publicacao').value;
        if (campoVazio(data)) {
            mostrarErro('data-publicacao', 'erro-data', 'Informe a data de publicação.');
            valido = false;
        } else {
            const dataEscolhida = new Date(data);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            if (dataEscolhida < hoje) {
                mostrarErro('data-publicacao', 'erro-data', 'A data de publicação não pode ser no passado.');
                valido = false;
            }
        }
    }

    return valido;
}

function coletarDados(status) {
    return {
        titulo: document.getElementById('titulo').value.trim(),
        subTitulo: document.getElementById('subtitulo').value.trim(),
        categoria: document.getElementById('categoria').value,
        resumo: document.getElementById('resumo').value.trim(),
        conteudo: document.getElementById('conteudo').value.trim(),
        imagemURL: document.getElementById('imagem-url').value.trim(),
        status,
        dataPublicacao: checkAgendamento.checked
            ? `${document.getElementById('data-publicacao').value} ${document.getElementById('hora-publicacao').value}`
            : null
    };
}

function exibirSucesso(mensagem) {
    const el = document.getElementById('alerta-sucesso');
    el.textContent = mensagem;
    el.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('btn-rascunho').addEventListener('click', () => {
    limparErros();
    if (campoVazio(document.getElementById('titulo').value)) {
        mostrarErro('titulo', 'erro-titulo', 'Informe um título para salvar o rascunho.');
        return;
    }
    const dados = coletarDados('rascunho');
    
    // Já sabem né?
    console.log('Rascunho salvo:', dados);
    statusBadge.textContent = 'Rascunho';
    exibirSucesso('Rascunho salvo com sucesso!');
});

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const status = checkAgendamento.checked ? 'agendado' : 'publicado';
    const dados = coletarDados(status);

    // Mesmo esquema, depois cadastramos oficialmente
    console.log('Postagem enviada:', dados);
    statusBadge.textContent = status === 'agendado' ? 'Agendado' : 'Publicado';
    exibirSucesso(status === 'agendado'
        ? 'Notícia agendada com sucesso!'
        : 'Notícia publicada com sucesso!'
    );
});

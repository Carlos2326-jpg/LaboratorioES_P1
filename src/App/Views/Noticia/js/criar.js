import { campoVazio, validarTitulo } from '../../_shared/js/validacao.js';

const form = document.getElementById('form-postagem');
const statusBadge = document.getElementById('status-badge');
const checkAgendamento = document.getElementById('check-agendamento');
const agendamentoFields = document.getElementById('agendamento-fields');

// ─── Modo Edição ───
const params = new URLSearchParams(window.location.search);
const idEdicao = params.get('id');

// Mock — substituir por fetch real:
// const res = await fetch(`/api/postagens/${idEdicao}`)
// const noticia = await res.json()
const noticiasMock = [
    { id: 1, titulo: 'Nova lei de tecnologia aprovada no Congresso', subTitulo: 'Medidas impactam empresas de todos os portes.', categorias: ['Política', 'Tecnologia'], resumo: 'O Congresso aprovou...', conteudo: 'Conteúdo completo da notícia aqui.', imagemURL: '', status: 'publicado' },
    { id: 2, titulo: 'Rascunho sobre economia', subTitulo: '', categorias: ['Política'], resumo: '', conteudo: 'Texto em rascunho...', imagemURL: '', status: 'rascunho' },
    { id: 3, titulo: 'Artigo agendado para maio', subTitulo: '', categorias: ['Saúde'], resumo: '', conteudo: 'Conteúdo agendado...', imagemURL: '', status: 'agendado' },
];

if (idEdicao) {
    const noticia = noticiasMock.find(n => n.id === parseInt(idEdicao));
    if (noticia) {
        document.getElementById('editor-titulo').textContent = 'Editar Postagem';
        document.getElementById('btn-publicar').textContent = 'Salvar Alterações';
        statusBadge.textContent = noticia.status.charAt(0).toUpperCase() + noticia.status.slice(1);

        // Preenche campos
        document.getElementById('titulo').value = noticia.titulo;
        document.getElementById('subtitulo').value = noticia.subTitulo || '';
        document.getElementById('resumo').value = noticia.resumo || '';
        document.getElementById('conteudo').value = noticia.conteudo || '';
        document.getElementById('imagem-url').value = noticia.imagemURL || '';

        // Marca categorias
        noticia.categorias.forEach(cat => {
            document.querySelectorAll('.categoria-check').forEach(cb => {
                if (cb.value === cat) cb.checked = true;
            });
        });

        // Botão excluir no modo edição
        const acoes = document.querySelector('.editor-acoes');
        const btnExcluir = document.createElement('button');
        btnExcluir.type = 'button';
        btnExcluir.className = 'btn btn-perigo';
        btnExcluir.style.width = 'auto';
        btnExcluir.textContent = '🗑️ Excluir Postagem';
        btnExcluir.addEventListener('click', () => {
            if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
            // fetch(`/api/postagens/${idEdicao}`, { method: 'DELETE' })
            console.log('Excluir postagem:', idEdicao);
            window.location.href = '../Usuario/minhas-postagens.html';
        });
        acoes.appendChild(btnExcluir);
    }
}

// ─── Toggle agendamento ───
checkAgendamento.addEventListener('change', () => {
    agendamentoFields.classList.toggle('visivel', checkAgendamento.checked);
    if (!idEdicao) {
        statusBadge.textContent = checkAgendamento.checked ? 'Agendado' : 'Rascunho';
    }
});

// ─── Helpers de erro ───
function mostrarErro(inputId, erroId, mensagem) {
    const input = document.getElementById(inputId);
    const erro = document.getElementById(erroId);
    if (input) input.classList.add('input-erro');
    if (erro) erro.textContent = mensagem;
}

function limparErros() {
    ['titulo', 'conteudo'].forEach(id => {
        const input = document.getElementById(id);
        const erro = document.getElementById('erro-' + id);
        if (input) input.classList.remove('input-erro');
        if (erro) erro.textContent = '';
    });
    document.getElementById('erro-categorias').textContent = '';
    document.getElementById('alerta-erro').style.display = 'none';
    document.getElementById('alerta-sucesso').style.display = 'none';
}

// ─── Coleta categorias selecionadas ───
function obterCategorias() {
    return [...document.querySelectorAll('.categoria-check:checked')].map(cb => cb.value);
}

// ─── Validação ───
function validarFormulario() {
    limparErros();
    const titulo = document.getElementById('titulo').value;
    const conteudo = document.getElementById('conteudo').value;
    const categorias = obterCategorias();
    let valido = true;

    if (!validarTitulo(titulo)) {
        mostrarErro('titulo', 'erro-titulo', 'O título deve ter entre 3 e 200 caracteres.');
        valido = false;
    }

    if (categorias.length === 0) {
        document.getElementById('erro-categorias').textContent = 'Selecione pelo menos uma categoria.';
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
                mostrarErro('data-publicacao', 'erro-data', 'A data não pode ser no passado.');
                valido = false;
            }
        }
    }

    return valido;
}

// ─── Coleta dados do form ───
function coletarDados(status) {
    return {
        titulo: document.getElementById('titulo').value.trim(),
        subTitulo: document.getElementById('subtitulo').value.trim(),
        categorias: obterCategorias(),
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

// ─── Salvar rascunho ───
document.getElementById('btn-rascunho').addEventListener('click', () => {
    limparErros();
    if (campoVazio(document.getElementById('titulo').value)) {
        mostrarErro('titulo', 'erro-titulo', 'Informe um título para salvar o rascunho.');
        return;
    }
    const dados = coletarDados('rascunho');
    // fetch('/api/postagens', { method: idEdicao ? 'PUT' : 'POST', body: JSON.stringify(dados) })
    console.log('Rascunho salvo:', dados);
    statusBadge.textContent = 'Rascunho';
    exibirSucesso('Rascunho salvo com sucesso!');
});

// ─── Publicar ───
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    const status = checkAgendamento.checked ? 'agendado' : 'publicado';
    const dados = coletarDados(status);


    console.log('Postagem enviada:', dados);
    statusBadge.textContent = status === 'agendado' ? 'Agendado' : 'Publicado';
    exibirSucesso(status === 'agendado'
        ? 'Notícia agendada com sucesso!'
        : 'Notícia publicada com sucesso!'
    );

    setTimeout(() => {
        window.location.href = '../Usuario/minhasPostagens.html';
    }, 1500);
});

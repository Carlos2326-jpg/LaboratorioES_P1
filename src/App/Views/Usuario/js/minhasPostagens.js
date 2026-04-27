// Simula usuário logado via localStorage
// Quando backend pronto: buscar sessão do servidor
const usuarioLogado = JSON.parse(localStorage.getItem('usuario')) || {
    id: 1,
    nome: 'Marcio Souza',
    nivelAcesso: 'autor'
};

if (!usuarioLogado) {
    window.location.href = '../Usuario/index.html';
}

// Mock de postagens
const todasPostagens = [
    { id: 1, titulo: 'Nova lei de tecnologia aprovada no Congresso', categorias: ['Política', 'Tecnologia'], status: 'publicado', data: '2026-04-20', autorId: 1 },
    { id: 2, titulo: 'Rascunho sobre economia', categorias: ['Política'], status: 'rascunho', data: '2026-04-18', autorId: 1 },
    { id: 3, titulo: 'Artigo agendado para maio', categorias: ['Saúde'], status: 'agendado', data: '2026-05-01', autorId: 1 },
    { id: 4, titulo: 'Postagem de outro usuário', categorias: ['Esportes'], status: 'publicado', data: '2026-04-15', autorId: 2 },
];

const minhasPostagens = todasPostagens.filter(p => p.autorId === usuarioLogado.id);

function formatarData(dataStr) {
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR');
}

function renderizarStatus(status) {
    const mapa = {
        publicado: 'status-publicado',
        rascunho:  'status-rascunho',
        agendado:  'status-agendado'
    };
    return `<span class="status-pill ${mapa[status] || ''}">${status}</span>`;
}

function renderizarTabela(lista) {
    const tbody = document.getElementById('tabela-body');
    const contador = document.getElementById('contador-postagens');

    contador.textContent = `${lista.length} postagem(ns)`;

    if (lista.length === 0) {
        tbody.innerHTML = `
            <tr><td colspan="5">
                <div class="sem-postagens">
                    Você ainda não tem postagens.<br>
                    <a href="../Noticia/criar.html" style="margin-top:0.5rem;display:inline-block;">Criar primeira postagem</a>
                </div>
            </td></tr>`;
        return;
    }

    tbody.innerHTML = lista.map(p => `
        <tr>
            <td>
                <a href="../Noticia/index.html?id=${p.id}" style="color:var(--cor-texto);font-weight:500;">
                    ${p.titulo}
                </a>
            </td>
            <td>${p.categorias.map(c => `<span class="badge" style="margin-right:0.25rem;">${c}</span>`).join('')}</td>
            <td>${renderizarStatus(p.status)}</td>
            <td>${formatarData(p.data)}</td>
            <td>
                <div class="acoes-tabela">
                    <a href="../Noticia/criar.html?id=${p.id}" class="btn btn-secundario btn-sm">✏️ Editar</a>
                    <button class="btn btn-perigo btn-sm" onclick="excluir(${p.id})">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

window.excluir = function(id) {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;

    // Substituir pelo fetch real

    const index = minhasPostagens.findIndex(p => p.id === id);
    if (index !== -1) {
        minhasPostagens.splice(index, 1);
        renderizarTabela(minhasPostagens);
    }
};

// Preenche info do usuário
document.getElementById('usuario-nome').textContent = usuarioLogado.nome;
document.getElementById('usuario-nivel').textContent = usuarioLogado.nivelAcesso;
document.getElementById('usuario-avatar').textContent = usuarioLogado.nome.charAt(0).toUpperCase();

document.getElementById('btn-logout').addEventListener('click', () => {
    localStorage.removeItem('usuario');
    window.location.href = '../Usuario/index.html';
});

// Init
renderizarTabela(minhasPostagens);

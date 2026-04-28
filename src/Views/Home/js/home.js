import { API, showAlert, formatarData, getUsuarioLogado } from '../../_shared/js/utils.js';

let currentPage = 1;
let currentCategoria = '';
let currentBusca = '';

// Carregar layouts
async function loadLayouts() {
    try {
        const headerResponse = await fetch('/_shared/layouts/header.html');
        const headerHtml = await headerResponse.text();
        document.getElementById('header-container').innerHTML = headerHtml;

        const footerResponse = await fetch('/_shared/layouts/footer.html');
        const footerHtml = await footerResponse.text();
        document.getElementById('footer-container').innerHTML = footerHtml;

        // Atualizar menu com usuário logado
        const usuario = getUsuarioLogado();
        if (usuario) {
            const menuAcoes = document.querySelector('.navbar__acoes');
            if (menuAcoes) {
                menuAcoes.innerHTML = `
                    <span class="usuario-nome">Olá, ${usuario.nomeCompleto.split(' ')[0]}</span>
                    <a href="/usuario/minhas-postagens" class="btn btn-secundario btn-sm">📝 Minhas Postagens</a>
                    ${usuario.nivelAcesso === 'admin' ? '<a href="/usuario/gerenciar" class="btn btn-secundario btn-sm">👥 Usuários</a>' : ''}
                    <button class="btn btn-secundario btn-sm" onclick="logout()">Sair</button>
                `;
            }
        }
    } catch (error) {
        console.error('Erro ao carregar layouts:', error);
    }
}

// Carregar categorias para filtro
async function carregarCategorias() {
    try {
        const response = await fetch(`${API}/categorias`);
        const result = await response.json();

        if (result.success && result.data) {
            const filtrosDiv = document.getElementById('filtros-categoria');
            const categoriasHtml = result.data.map(cat => `
                <button class="filtro-btn" data-categoria="${cat.idCategoria}">
                    📁 ${cat.nome}
                </button>
            `).join('');

            filtrosDiv.innerHTML = '<button class="filtro-btn ativo" data-categoria="">📰 Todas</button>' + categoriasHtml;

            // Adicionar eventos
            document.querySelectorAll('.filtro-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
                    btn.classList.add('ativo');
                    currentCategoria = btn.dataset.categoria;
                    currentPage = 1;
                    carregarPostagens();
                });
            });
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

// Carregar postagens
async function carregarPostagens() {
    const loading = document.getElementById('loading');
    const grid = document.getElementById('grid-noticias');
    const semResultados = document.getElementById('sem-resultados');

    loading.style.display = 'block';
    grid.innerHTML = '';
    semResultados.style.display = 'none';

    try {
        let url = `${API}/postagens?page=${currentPage}&limit=9`;
        if (currentCategoria) url += `&categoria=${currentCategoria}`;
        if (currentBusca) url += `&busca=${encodeURIComponent(currentBusca)}`;

        const response = await fetch(url);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
            grid.innerHTML = result.data.map(post => `
                <article class="card-noticia">
                    ${post.imagem_destaque ? `<img src="${post.imagem_destaque}" alt="${post.imagem_alt || post.titulo}" class="card-imagem">` : ''}
                    <div class="card-conteudo">
                        <span class="card-categoria">${post.categorias || 'Sem categoria'}</span>
                        <h2 class="card-titulo">
                            <a href="/noticia/${post.slug}">${post.titulo}</a>
                        </h2>
                        <p class="card-resumo">${post.resumo || post.conteudo.substring(0, 150)}...</p>
                        <div class="card-meta">
                            <span>📅 ${formatarData(post.dataPostagem)}</span>
                            <span>✍️ ${post.autor_nome || 'Autor'}</span>
                        </div>
                    </div>
                </article>
            `).join('');

            // Renderizar paginação
            renderizarPaginacao(result.totalPages, result.page);
        } else {
            semResultados.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao carregar postagens:', error);
        showAlert('Erro ao carregar notícias', 'error');
    } finally {
        loading.style.display = 'none';
    }
}

function renderizarPaginacao(totalPages, currentPage) {
    const paginacao = document.getElementById('paginacao');
    if (totalPages <= 1) {
        paginacao.innerHTML = '';
        return;
    }

    let html = '<div class="paginacao-botoes">';

    // Botão anterior
    if (currentPage > 1) {
        html += `<button class="btn-pagina" data-page="${currentPage - 1}">« Anterior</button>`;
    }

    // Números das páginas
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="btn-pagina ${i === currentPage ? 'ativo' : ''}" data-page="${i}">${i}</button>`;
    }

    // Botão próximo
    if (currentPage < totalPages) {
        html += `<button class="btn-pagina" data-page="${currentPage + 1}">Próximo »</button>`;
    }

    html += '</div>';
    paginacao.innerHTML = html;

    // Adicionar eventos
    document.querySelectorAll('.btn-pagina').forEach(btn => {
        btn.addEventListener('click', () => {
            currentPage = parseInt(btn.dataset.page);
            carregarPostagens();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// Verificar busca na URL
function checkSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    const busca = urlParams.get('busca');
    if (busca) {
        currentBusca = busca;
        document.getElementById('campo-busca').value = busca;
        carregarPostagens();
    }
}

// Inicializar
async function init() {
    await loadLayouts();
    await carregarCategorias();
    checkSearchQuery();
    carregarPostagens();
}

init();
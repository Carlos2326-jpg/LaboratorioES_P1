const POR_PAGINA = 6;
let paginaAtual = 1;
let categoriaAtiva = '';
let termoBusca = '';

// Família isso é tudo mock, depois coloco os dados reais
const noticiasMock = [
    { id: 1, titulo: 'Nova lei de tecnologia aprovada no Congresso', resumo: 'O Congresso Nacional aprovou na última semana uma série de medidas relacionadas à regulação de tecnologia no país.', categoria: 'Política', autor: 'João Silva', data: '2026-04-20', imagem: null },
    { id: 2, titulo: 'Brasil vence campeonato sul-americano de futebol', resumo: 'A seleção brasileira conquistou o título do campeonato após partida emocionante contra a Argentina.', categoria: 'Esportes', autor: 'André Costa', data: '2026-04-19', imagem: null },
    { id: 3, titulo: 'Novo modelo de IA promete revolucionar medicina', resumo: 'Pesquisadores lançaram um modelo de inteligência artificial capaz de diagnosticar doenças com 98% de precisão.', categoria: 'Tecnologia', autor: 'Marcio Souza', data: '2026-04-18', imagem: null },
    { id: 4, titulo: 'Ministério da Saúde lança campanha de vacinação', resumo: 'A campanha nacional de vacinação começa na próxima segunda-feira em todos os postos de saúde do país.', categoria: 'Saúde', autor: 'João Silva', data: '2026-04-17', imagem: null },
    { id: 5, titulo: 'Startup brasileira levanta R$ 50 milhões em rodada', resumo: 'A empresa de fintechs anunciou captação histórica e promete expandir para toda a América Latina.', categoria: 'Tecnologia', autor: 'André Costa', data: '2026-04-16', imagem: null },
    { id: 6, titulo: 'Eleições municipais: pesquisa aponta favoritismo', resumo: 'Nova pesquisa divulgada aponta o candidato A na frente com 12 pontos percentuais de vantagem.', categoria: 'Política', autor: 'Marcio Souza', data: '2026-04-15', imagem: null },
    { id: 7, titulo: 'Atleta brasileiro bate recorde mundial no atletismo', resumo: 'Em competição internacional, o velocista quebrou o recorde dos 100 metros rasos com 9.78 segundos.', categoria: 'Esportes', autor: 'João Silva', data: '2026-04-14', imagem: null },
    { id: 8, titulo: 'Pesquisa aponta aumento de ansiedade entre jovens', resumo: 'Estudo publicado em revista científica revela que 40% dos jovens relatam sintomas de ansiedade moderada.', categoria: 'Saúde', autor: 'André Costa', data: '2026-04-13', imagem: null },
];

function formatarData(dataStr) {
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function filtrarNoticias() {
    return noticiasMock.filter(n => {
        const matchCategoria = categoriaAtiva === '' || n.categoria === categoriaAtiva;
        const matchBusca = termoBusca === '' ||
            n.titulo.toLowerCase().includes(termoBusca.toLowerCase()) ||
            n.resumo.toLowerCase().includes(termoBusca.toLowerCase());
        return matchCategoria && matchBusca;
    });
}

function renderizarCard(noticia) {
    return `
        <article class="noticia-card">
            <div class="noticia-card__imagem--placeholder">Sem imagem</div>
            <div class="noticia-card__corpo">
                <span class="noticia-card__categoria">${noticia.categoria}</span>
                <h2 class="noticia-card__titulo">
                    <a href="../Noticia/index.html?id=${noticia.id}">${noticia.titulo}</a>
                </h2>
                <p class="noticia-card__resumo">${noticia.resumo}</p>
                <div class="noticia-card__meta">
                    <span>${noticia.autor}</span>
                    <span>${formatarData(noticia.data)}</span>
                </div>
            </div>
        </article>
    `;
}

function renderizarPaginacao(total) {
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    const paginacaoEl = document.getElementById('paginacao');
    paginacaoEl.innerHTML = '';

    if (totalPaginas <= 1) return;

    for (let i = 1; i <= totalPaginas; i++) {
        const btn = document.createElement('button');
        btn.className = 'paginacao__btn' + (i === paginaAtual ? ' ativo' : '');
        btn.textContent = i;
        btn.addEventListener('click', () => {
            paginaAtual = i;
            renderizar();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        paginacaoEl.appendChild(btn);
    }
}

function renderizar() {
    const filtradas = filtrarNoticias();
    const grid = document.getElementById('grid-noticias');
    const semResultados = document.getElementById('sem-resultados');
    const resultadoBusca = document.getElementById('resultado-busca');

    if (termoBusca) {
        resultadoBusca.style.display = 'block';
        resultadoBusca.textContent = `${filtradas.length} resultado(s) para "${termoBusca}"`;
    } else {
        resultadoBusca.style.display = 'none';
    }

    if (filtradas.length === 0) {
        grid.innerHTML = '';
        semResultados.style.display = 'block';
        document.getElementById('paginacao').innerHTML = '';
        return;
    }

    semResultados.style.display = 'none';

    const inicio = (paginaAtual - 1) * POR_PAGINA;
    const pagina = filtradas.slice(inicio, inicio + POR_PAGINA);

    grid.innerHTML = pagina.map(renderizarCard).join('');
    renderizarPaginacao(filtradas.length);
}

// Aqui a gente filtra
document.getElementById('filtros-categoria').addEventListener('click', (e) => {
    if (!e.target.classList.contains('filtro-btn')) return;
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('ativo'));
    e.target.classList.add('ativo');
    categoriaAtiva = e.target.dataset.categoria;
    paginaAtual = 1;
    renderizar();
});

// Por causa disso funciona a busca
document.getElementById('btn-buscar').addEventListener('click', () => {
    termoBusca = document.getElementById('campo-busca').value.trim();
    paginaAtual = 1;
    renderizar();
});

document.getElementById('campo-busca').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        termoBusca = e.target.value.trim();
        paginaAtual = 1;
        renderizar();
    }
});

// Init
renderizar();

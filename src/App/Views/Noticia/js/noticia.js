// noticia.js — carrega e exibe a notícia individual pelo ?id= na URL

// Mesmo mock do home — quando tiver backend, substituir por fetch
const noticiasMock = [
    { id: 1, titulo: 'Nova lei de tecnologia aprovada no Congresso', subtitulo: 'Medidas impactam empresas de todos os portes no setor de inovação.', resumo: 'O Congresso Nacional aprovou na última semana uma série de medidas relacionadas à regulação de tecnologia no país.', conteudo: '<p>O Congresso Nacional aprovou na última semana uma série de medidas relacionadas à regulação de tecnologia no país. A votação foi acirrada, com 312 votos a favor e 189 contra.</p><p>As novas leis estabelecem regras claras para uso de dados, responsabilidade de plataformas digitais e proteção ao consumidor online. Especialistas avaliam o impacto como positivo no longo prazo.</p><p>A implementação das novas regras começa em 90 dias, dando tempo para empresas e órgãos públicos se adequarem.</p>', categoria: 'Política', autor: 'João Silva', data: '2026-04-20', tags: ['lei', 'tecnologia', 'congresso'] },
    { id: 2, titulo: 'Brasil vence campeonato sul-americano de futebol', subtitulo: 'Partida histórica garantiu o título para a seleção brasileira.', resumo: 'A seleção brasileira conquistou o título do campeonato após partida emocionante contra a Argentina.', conteudo: '<p>A seleção brasileira conquistou o título do campeonato sul-americano após uma partida emocionante contra a Argentina que terminou em 2 a 1.</p><p>Os gols foram marcados nos minutos finais, em uma virada histórica que foi celebrada em todo o Brasil.</p>', categoria: 'Esportes', autor: 'André Costa', data: '2026-04-19', tags: ['futebol', 'brasil', 'campeão'] },
    { id: 3, titulo: 'Novo modelo de IA promete revolucionar medicina', subtitulo: 'Tecnologia foi desenvolvida em parceria com universidades brasileiras.', resumo: 'Pesquisadores lançaram um modelo de inteligência artificial capaz de diagnosticar doenças com 98% de precisão.', conteudo: '<p>Pesquisadores de universidades brasileiras e internacionais lançaram um modelo de inteligência artificial capaz de diagnosticar mais de 200 doenças com 98% de precisão.</p><p>O modelo foi treinado com mais de 10 milhões de exames e passou por rigorosos testes clínicos antes de ser anunciado.</p>', categoria: 'Tecnologia', autor: 'Marcio Souza', data: '2026-04-18', tags: ['IA', 'medicina', 'tecnologia'] },
];

function formatarData(dataStr) {
    const d = new Date(dataStr + 'T00:00:00');
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

function obterIdDaURL() {
    const params = new URLSearchParams(window.location.search);
    return parseInt(params.get('id'));
}

function renderizarNoticia(noticia) {
    const el = document.getElementById('noticia-conteudo');
    el.innerHTML = `
        <span class="noticia-categoria">${noticia.categoria}</span>
        <h1 class="noticia-titulo">${noticia.titulo}</h1>
        ${noticia.subtitulo ? `<p class="noticia-subtitulo">${noticia.subtitulo}</p>` : ''}
        <div class="noticia-meta">
            <span>✍️ ${noticia.autor}</span>
            <span>📅 ${formatarData(noticia.data)}</span>
        </div>
        <div class="noticia-imagem-destaque" style="display:flex;align-items:center;justify-content:center;color:var(--cor-texto-suave);font-size:0.85rem;">
            Imagem de destaque
        </div>
        <div class="noticia-corpo">${noticia.conteudo}</div>
        <div class="noticia-tags">
            ${noticia.tags.map(t => `<span class="badge">${t}</span>`).join('')}
        </div>
        <div style="margin-top:2rem;">
            <a href="../Home/index.html" class="btn btn-secundario btn-sm">← Voltar</a>
        </div>
    `;
    document.title = `${noticia.titulo} – Blog de Notícias`;
}

function renderizarRelacionadas(atual) {
    const relacionadas = noticiasMock
        .filter(n => n.id !== atual.id && n.categoria === atual.categoria)
        .slice(0, 3);

    const lista = document.getElementById('relacionadas');

    if (relacionadas.length === 0) {
        lista.innerHTML = '<li><span style="font-size:0.8rem;color:var(--cor-texto-suave)">Sem notícias relacionadas.</span></li>';
        return;
    }

    lista.innerHTML = relacionadas.map(n => `
        <li>
            <a href="index.html?id=${n.id}">${n.titulo}</a>
            <span>${formatarData(n.data)}</span>
        </li>
    `).join('');
}

const id = obterIdDaURL();
const noticia = noticiasMock.find(n => n.id === id);

if (noticia) {
    renderizarNoticia(noticia);
    renderizarRelacionadas(noticia);
} else {
    document.getElementById('noticia-conteudo').innerHTML = `
        <h2>Notícia não encontrada</h2>
        <p>A notícia que você procura não existe ou foi removida.</p>
        <a href="../Home/index.html" class="btn btn-primario" style="margin-top:1rem;display:inline-block;">Voltar ao início</a>
    `;
}

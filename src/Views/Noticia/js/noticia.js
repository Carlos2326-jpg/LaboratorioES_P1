async function carregarNoticia() {
    const slug = window.location.pathname.split('/').pop();
    const loading = document.getElementById('loading');
    const conteudo = document.getElementById('noticia-conteudo');
    const erro = document.getElementById('erro-mensagem');

    try {
        const response = await fetch(`${API_URL}/postagens/slug/${slug}`);
        const result = await response.json();

        if (result.success && result.data) {
            const post = result.data;

            document.title = `${post.titulo} - Blog de Notícias`;

            conteudo.innerHTML = `
                ${post.imagem_destaque ? `<img src="${post.imagem_destaque}" alt="${post.imagem_alt || post.titulo}" class="noticia-imagem">` : ''}
                <div class="noticia-conteudo">
                    <span class="noticia-categoria">${post.categorias || 'Sem categoria'}</span>
                    <h1 class="noticia-titulo">${post.titulo}</h1>
                    ${post.subTitulo ? `<p class="noticia-subtitulo">${post.subTitulo}</p>` : ''}
                    <div class="noticia-meta">
                        <span>📅 ${formatarData(post.dataPostagem)}</span>
                        <span>✍️ ${post.autor_nome || 'Autor'}</span>
                        <span>👁️ ${post.visualizacoes || 0} visualizações</span>
                    </div>
                    <div class="noticia-body">
                        ${formatarConteudo(post.conteudo)}
                    </div>
                </div>
            `;

            loading.style.display = 'none';
            conteudo.style.display = 'block';
        } else {
            throw new Error('Notícia não encontrada');
        }
    } catch (error) {
        console.error('Erro:', error);
        loading.style.display = 'none';
        erro.style.display = 'block';
    }
}

function formatarConteudo(conteudo) {
    // Converter markdown básico para HTML
    let html = conteudo
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

    return `<p>${html}</p>`;
}

carregarNoticia();

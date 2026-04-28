import { API, formatarData, getAuthHeader, getUsuarioLogado } from '../../_shared/js/utils.js';

async function carregarPostagens() {
    const usuario = getUsuarioLogado();
    if (!usuario) {
        window.location.href = '/usuario/login';
        return;
    }
    
    try {
        const response = await fetch(`${API}/usuario/minhas-postagens`, {
            headers: getAuthHeader()
        });
        const result = await response.json();
        
        if (result.success && result.data) {
            const tbody = document.getElementById('tabela-postagens');
            
            if (result.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="loading-text">Nenhuma postagem encontrada</td></tr>';
                return;
            }
            
            tbody.innerHTML = result.data.map(post => `
                <tr>
                    <td>
                        <strong><a href="/noticia/${post.slug}">${post.titulo}</a></strong>
                        ${post.resumo ? `<br><small>${post.resumo.substring(0, 100)}...</small>` : ''}
                    </td>
                    <td><span class="status-pill status-${post.status}">${post.status}</span></td>
                    <td>${formatarData(post.dataPostagem)}</td>
                    <td>${post.visualizacoes || 0}</td>
                    <td class="acoes">
                        <button class="btn btn-sm btn-secundario" onclick="editarPostagem(${post.idPostagem})">Editar</button>
                        <button class="btn btn-sm btn-perigo" onclick="excluirPostagem(${post.idPostagem})">Excluir</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Erro:', error);
    }
}

window.editarPostagem = (id) => {
    window.location.href = `/noticia/editar/${id}`;
};

window.excluirPostagem = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta postagem?')) return;
    
    try {
        const response = await fetch(`${API}/postagens/${id}`, {
            method: 'DELETE',
            headers: getAuthHeader()
        });
        const result = await response.json();
        
        if (result.success) {
            carregarPostagens();
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao excluir postagem');
    }
};

carregarPostagens();
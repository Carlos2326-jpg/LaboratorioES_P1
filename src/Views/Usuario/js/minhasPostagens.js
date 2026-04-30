import { API, formatarData, getAuthHeader, getUsuarioLogado } from '../../_shared/js/utils.js';

async function carregarPostagens() {
    const token = getToken();
    if (!token) {
        showAlert('Sessão expirada', 'error');
        logout();
        return;
    }

    try {
        console.log('🔍 Enviando request com token:', token.substring(0, 20) + '...');
        
        const response = await fetch(`${API_URL}/usuario/minhas-postagens`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        console.log('🔍 Status:', response.status);
        
        if (response.status === 401) {
            showAlert('Sessão expirada. Faça login novamente.', 'error');
            logout();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const result = await response.json();
        console.log('🔍 Resultado:', result);
        
        if (result.success && result.data) {
            renderizarPostagens(result.data);
        } else {
            throw new Error(result.error || 'Resposta inválida');
        }
    } catch (error) {
        console.error('❌ Erro completo:', error);
        document.getElementById('tabela-postagens').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 3rem; color: #dc2626;">
                    <strong>Erro: ${error.message}</strong><br><br>
                    <button onclick="carregarPostagens()" style="background: #2563eb; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer;">🔄 Tentar Novamente</button>
                    <br><button onclick="logout()" style="background: #6b7280; color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; margin-top: 0.5rem;">🔐 Fazer Login</button>
                </td>
            </tr>
        `;
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
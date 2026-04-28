import { API_URL, showAlert, getAuthHeader, getUsuarioLogado, gerarSlug } from '../../_shared/js/utils.js';

let categories = [];

async function loadCategories() {
    try {
        const response = await fetch(`${API_URL}/categorias`);
        const result = await response.json();
        
        if (result.success) {
            categories = result.data;
            renderCategories();
        }
    } catch (error) {
        console.error('Erro ao carregar categorias:', error);
    }
}

function renderCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = categories.map(cat => `
        <label class="category-checkbox">
            <input type="checkbox" value="${cat.idCategoria}">
            <span>${cat.nome}</span>
        </label>
    `).join('');
}

function getSelectedCategories() {
    const checkboxes = document.querySelectorAll('#categories-container input:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

document.getElementById('title').addEventListener('input', (e) => {
    const slug = gerarSlug(e.target.value);
    document.getElementById('slug').value = slug;
});

document.getElementById('schedule').addEventListener('change', (e) => {
    const fields = document.getElementById('schedule-fields');
    fields.style.display = e.target.checked ? 'block' : 'none';
});

document.getElementById('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await savePost('published');
});

document.getElementById('save-draft').addEventListener('click', async () => {
    await savePost('draft');
});

async function savePost(status) {
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const categories = getSelectedCategories();
    
    if (!title) {
        showAlert('Digite o título da postagem', 'error');
        return;
    }
    
    if (!content) {
        showAlert('Digite o conteúdo da postagem', 'error');
        return;
    }
    
    if (categories.length === 0) {
        showAlert('Selecione pelo menos uma categoria', 'error');
        return;
    }
    
    const postData = {
        titulo: title,
        subTitulo: document.getElementById('subtitle').value,
        slug: document.getElementById('slug').value || gerarSlug(title),
        resumo: document.getElementById('summary').value,
        conteudo: content,
        imagem_destaque: document.getElementById('image-url').value,
        status: status,
        categorias: categories
    };
    
    if (document.getElementById('schedule').checked) {
        const date = document.getElementById('schedule-date').value;
        const time = document.getElementById('schedule-time').value;
        if (date && time) {
            postData.dataPostagem = `${date} ${time}:00`;
        }
    }
    
    try {
        const response = await fetch(`${API_URL}/postagens`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeader()
            },
            body: JSON.stringify(postData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showAlert(`Postagem ${status === 'published' ? 'publicada' : 'salva como rascunho'} com sucesso!`, 'success');
            setTimeout(() => {
                window.location.href = '/usuario/minhas-postagens';
            }, 2000);
        } else {
            showAlert(result.error, 'error');
        }
    } catch (error) {
        console.error('Erro ao salvar:', error);
        showAlert('Erro ao salvar postagem', 'error');
    }
}

// Verificar autenticação
const user = getUsuarioLogado();
if (!user || !['admin', 'editor', 'autor'].includes(user.nivelAcesso)) {
    window.location.href = '/usuario/login';
}

loadCategories();
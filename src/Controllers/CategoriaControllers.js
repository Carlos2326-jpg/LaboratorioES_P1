const CategoriaService = require('../Services/CategoriaService');

class CategoriaController {
    constructor() {
        this.categoriaService = new CategoriaService();
    }

    async listar(req, res) {
        try {
            const categorias = await this.categoriaService.listarTodas();
            res.json({ success: true, data: categorias });
        } catch (error) {
            console.error('Erro ao listar categorias:', error);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const categoria = await this.categoriaService.buscarPorId(id);
            res.json({ success: true, data: categoria });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async criar(req, res) {
        try {
            const categoria = await this.categoriaService.criarCategoria(req.body, req.usuario);
            res.status(201).json({ success: true, message: 'Categoria criada!', data: categoria });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const categoria = await this.categoriaService.atualizarCategoria(id, req.body, req.usuario);
            res.json({ success: true, message: 'Categoria atualizada!', data: categoria });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            await this.categoriaService.deletarCategoria(id, req.usuario);
            res.json({ success: true, message: 'Categoria excluída!' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = CategoriaController;
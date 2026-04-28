const PostagemService = require('../Services/PostagemService');

class PostagemController {
    constructor() {
        this.postagemService = new PostagemService();
    }

    async listarPublicadas(req, res) {
        try {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const postagens = await this.postagemService.listarPublicadas(page, limit);
            res.json({ success: true, ...postagens });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const postagem = await this.postagemService.buscarPorId(id);
            res.json({ success: true, data: postagem });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async buscarPorSlug(req, res) {
        try {
            const postagem = await this.postagemService.buscarPorSlug(req.params.slug);
            res.json({ success: true, data: postagem });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async buscarPorUsuario(req, res) {
        try {
            const usuarioId = parseInt(req.params.usuarioId) || req.usuario.idUsuario;
            const postagens = await this.postagemService.buscarPorUsuario(usuarioId);
            res.json({ success: true, data: postagens });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async criar(req, res) {
        try {
            const { categorias, ...dadosPostagem } = req.body;
            const postagem = await this.postagemService.criarPostagem(dadosPostagem, categorias, req.usuario);
            res.status(201).json({ success: true, message: 'Postagem criada!', data: postagem });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const { categorias, ...dadosPostagem } = req.body;
            const postagem = await this.postagemService.atualizarPostagem(id, dadosPostagem, categorias, req.usuario);
            res.json({ success: true, message: 'Postagem atualizada!', data: postagem });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async deletar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            await this.postagemService.deletarPostagem(id, req.usuario);
            res.json({ success: true, message: 'Postagem excluída!' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async buscarRecentes(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 5;
            const recentes = await this.postagemService.buscarPostagensRecentes(limit);
            res.json({ success: true, data: recentes });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async buscarPorTermo(req, res) {
        try {
            const { termo, categoriaId } = req.query;
            const resultados = await this.postagemService.buscarPorTermo(termo, categoriaId);
            res.json({ success: true, data: resultados });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = PostagemController;
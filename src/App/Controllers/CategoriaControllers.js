const CategoriaModel = require("../Models/Categorias");

const categoria = new CategoriaModel({
    host: "localhost",
    user: "root",
    password: "",
    database: "BlogNoticias"
});

function temPermissao(req, niveis) {
    return niveis.includes(req.usuario.nivelAcesso);
}

async function listar(req, res) {
    try {
        const dados = await categoria.all();
        res.json(dados);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar categorias", detalhe: error.message });
    }
}

async function buscar(req, res) {
    try {
        const { id } = req.params;
        const dados = await categoria.find(id);

        if (!dados) {
            return res.status(404).json({ erro: "Categoria não encontrada" });
        }

        res.json(dados);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar categoria", detalhe: error.message });
    }
}

async function criar(req, res) {
    try {
        req.usuario = { nivelAcesso: "editor" };

        if (!temPermissao(req, ["admin", "editor"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { nome, slug, Descricao, imagemURL } = req.body;

        // Validação básica
        if (!nome || !slug) {
            return res.status(400).json({ erro: "Nome e slug são obrigatórios" });
        }

        const nova = await categoria.create({ nome, slug, Descricao, imagemURL });

        res.status(201).json({ mensagem: "Categoria criada", categoria: nova });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar categoria", detalhe: error.message });
    }
}

async function atualizar(req, res) {
    try {
        req.usuario = { nivelAcesso: "editor" };

        if (!temPermissao(req, ["admin", "editor"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;
        const { nome, slug, Descricao, imagemURL } = req.body;

        // Verificar se a categoria existe
        const categoriaExistente = await categoria.find(id);
        if (!categoriaExistente) {
            return res.status(404).json({ erro: "Categoria não encontrada" });
        }

        // Validação básica
        if (!nome || !slug) {
            return res.status(400).json({ erro: "Nome e slug são obrigatórios" });
        }

        const atualizado = await categoria.update(id, { nome, slug, Descricao, imagemURL });

        if (!atualizado) {
            return res.status(500).json({ erro: "Erro ao atualizar categoria" });
        }

        const categoriaAtualizada = await categoria.find(id);
        res.json({ mensagem: "Categoria atualizada", categoria: categoriaAtualizada });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar categoria", detalhe: error.message });
    }
}

async function deletar(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;

        // Verificar se a categoria existe antes de deletar
        const categoriaExistente = await categoria.find(id);
        if (!categoriaExistente) {
            return res.status(404).json({ erro: "Categoria não encontrada" });
        }

        const ok = await categoria.delete(id);

        if (!ok) {
            return res.status(500).json({ erro: "Erro ao remover categoria" });
        }

        res.json({ mensagem: "Categoria removida" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar categoria", detalhe: error.message });
    }
}

module.exports = {
    listar,
    buscar,      // Nova função para buscar uma categoria específica
    criar,
    atualizar,   // Nova função para atualizar categoria
    deletar
};
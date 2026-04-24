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

async function listarCategorias(req, res) {
    const dados = await categoria.all();
    res.json(dados);
}

async function criarCategoria(req, res) {
    req.usuario = { nivelAcesso: "editor" };

    if (!temPermissao(req, ["admin", "editor"])) {
        return res.json({ erro: "Sem permissão" });
    }

    const { nome, slug, Descricao, imagemURL } = req.body;

    const nova = await categoria.create({ nome, slug, Descricao, imagemURL });

    res.json({ mensagem: "Categoria criada", categoria: nova });
}

async function deletarCategoria(req, res) {
    req.usuario = { nivelAcesso: "admin" };

    if (!temPermissao(req, ["admin"])) {
        return res.json({ erro: "Sem permissão" });
    }

    const { id } = req.params;

    const ok = await categoria.delete(id);

    if (!ok) return res.json({ erro: "Categoria não encontrada" });

    res.json({ mensagem: "Categoria removida" });
}

module.exports = {
    listarCategorias,
    criarCategoria,
    deletarCategoria
};
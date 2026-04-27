const PostagemModel = require("../Models/Postagem");

const postagem = new PostagemModel({
    host: "localhost",
    user: "root",
    password: "",
    database: "BlogNoticias"
});

function temPermissao(req, niveis) {
    return niveis.includes(req.usuario.nivelAcesso);
}

async function listarPostagens(req, res) {
    const dados = await postagem.all();
    res.json(dados);
}

async function verPostagem(req, res) {
    const { id } = req.params;

    const post = await postagem.find(id);

    if (!post) {
        return res.json({ erro: "Postagem não encontrada" });
    }

    res.json(post);
}

async function criarPostagem(req, res) {
    req.usuario = { nivelAcesso: "autor" }; 

    if (!temPermissao(req, ["admin", "editor", "autor"])) {
        return res.json({ erro: "Sem permissão" });
    }

    const dados = req.body;

    if (req.usuario.nivelAcesso === "autor") {
        dados.status = "rascunho";
    } else {
        dados.status = "publicado";
    }

    const nova = await postagem.create(dados);
    res.json({ mensagem: "Postagem criada", postagem: nova });
}

async function deletarPostagem(req, res) {
    req.usuario = { nivelAcesso: "admin" };

    if (!temPermissao(req, ["admin"])) {
        return res.json({ erro: "Sem permissão" });
    }

    const { id } = req.params;

    const ok = await postagem.delete(id);

    if (!ok) return res.json({ erro: "Postagem não encontrada" });

    res.json({ mensagem: "Postagem removida" });
}

module.exports = {
    listarPostagens,
    verPostagem,
    criarPostagem,
    deletarPostagem
};
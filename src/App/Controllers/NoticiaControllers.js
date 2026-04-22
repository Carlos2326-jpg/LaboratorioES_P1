// App/Controllers/NoticiaController.js

const Noticia = require("../Models/Noticia");

async function listarNoticias(req, res) {
    const noticias = await Noticia.buscarTodas();
    res.json(noticias);
}

async function verNoticia(req, res) {
    const { id } = req.params;

    const noticia = await Noticia.buscarPorId(id);

    if (!noticia) {
        return res.status(404).json({ erro: "Notícia não encontrada" });
    }

    await Noticia.incrementarVisualizacao(id);

    res.json(noticia);
}

async function filtrarNoticias(req, res) {
    const filtros = req.query;

    const resultado = await Noticia.filtrar(filtros);

    if (resultado.length === 0) {
        return res.json({ mensagem: "Nenhuma notícia encontrada" });
    }

    res.json(resultado);
}

module.exports = {
    listarNoticias,
    verNoticia,
    filtrarNoticias
};
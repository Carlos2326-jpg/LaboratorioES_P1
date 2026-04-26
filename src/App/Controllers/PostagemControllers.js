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

async function listar(req, res) {
    try {
        const dados = await postagem.all();
        res.json(dados);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar postagens", detalhe: error.message });
    }
}

async function buscar(req, res) {
    try {
        const { id } = req.params;
        const post = await postagem.find(id);

        if (!post) {
            return res.status(404).json({ erro: "Postagem não encontrada" });
        }

        res.json(post);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar postagem", detalhe: error.message });
    }
}

async function buscarPorUsuario(req, res) {
    try {
        const { usuarioId } = req.params;
        const posts = await postagem.findByUsuario(usuarioId);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar postagens do usuário", detalhe: error.message });
    }
}

async function listarRecentes(req, res) {
    try {
        const limit = req.query.limit || 10;
        const posts = await postagem.findRecentes(limit);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar postagens recentes", detalhe: error.message });
    }
}

async function criar(req, res) {
    try {
        req.usuario = { nivelAcesso: "autor", id: 1 }; // Exemplo: id do usuário logado

        if (!temPermissao(req, ["admin", "editor", "autor"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const dados = req.body;

        // Validação básica
        if (!dados.titulo || !dados.slug || !dados.conteudo) {
            return res.status(400).json({ erro: "Título, slug e conteúdo são obrigatórios" });
        }

        // Verificar se o slug já existe
        const slugExistente = await postagem.findBySlug(dados.slug);
        if (slugExistente) {
            return res.status(400).json({ erro: "Slug já existe. Escolha outro." });
        }

        // Configurar status baseado no nível de acesso
        if (req.usuario.nivelAcesso === "autor") {
            dados.status = "rascunho";
        } else {
            dados.status = "publicado";
        }

        // Adicionar datas
        dados.dataPostagem = dados.dataPostagem || new Date();
        dados.dataAtualizacao = new Date();
        
        // Associar ao usuário logado
        dados.usuario_idUsuario = req.usuario.id;

        const nova = await postagem.create(dados);
        res.status(201).json({ mensagem: "Postagem criada", postagem: nova });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar postagem", detalhe: error.message });
    }
}

async function atualizar(req, res) {
    try {
        req.usuario = { nivelAcesso: "editor", id: 1 }; // Exemplo

        if (!temPermissao(req, ["admin", "editor"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;
        const dados = req.body;

        // Verificar se a postagem existe
        const postagemExistente = await postagem.find(id);
        if (!postagemExistente) {
            return res.status(404).json({ erro: "Postagem não encontrada" });
        }

        // Verificar se o slug já existe (exceto para a própria postagem)
        if (dados.slug && dados.slug !== postagemExistente.slug) {
            const slugExistente = await postagem.findBySlug(dados.slug);
            if (slugExistente) {
                return res.status(400).json({ erro: "Slug já existe. Escolha outro." });
            }
        }

        // Atualizar data de atualização
        dados.dataAtualizacao = new Date();

        const atualizado = await postagem.update(id, dados);

        if (!atualizado) {
            return res.status(500).json({ erro: "Erro ao atualizar postagem" });
        }

        const postagemAtualizada = await postagem.find(id);
        res.json({ mensagem: "Postagem atualizada", postagem: postagemAtualizada });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar postagem", detalhe: error.message });
    }
}

async function deletar(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;

        // Verificar se a postagem existe antes de deletar
        const postagemExistente = await postagem.find(id);
        if (!postagemExistente) {
            return res.status(404).json({ erro: "Postagem não encontrada" });
        }

        const ok = await postagem.delete(id);

        if (!ok) {
            return res.status(500).json({ erro: "Erro ao remover postagem" });
        }

        res.json({ mensagem: "Postagem removida" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar postagem", detalhe: error.message });
    }
}

module.exports = {
    listar,           // Listar todas as postagens
    buscar,          // Buscar postagem por ID
    buscarPorUsuario,// Buscar postagens por usuário
    listarRecentes,  // Listar postagens recentes
    criar,           // Criar nova postagem
    atualizar,       // Atualizar postagem
    deletar          // Deletar postagem
};
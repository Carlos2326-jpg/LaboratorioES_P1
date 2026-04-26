const UsuarioModel = require("../Models/Usuario");

const usuario = new UsuarioModel({
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
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const usuarios = await usuario.all();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar usuários", detalhe: error.message });
    }
}

async function buscar(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;
        const user = await usuario.find(id);

        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuário", detalhe: error.message });
    }
}

async function buscarPorEmail(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { email } = req.params;
        const user = await usuario.findByEmail(email);

        if (!user) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuário por email", detalhe: error.message });
    }
}

async function buscarPorNivel(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { nivel } = req.params;
        const usuarios = await usuario.findByNivelAcesso(nivel);
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar usuários por nível", detalhe: error.message });
    }
}

async function login(req, res) {
    try {
        const { email, senha } = req.body;

        // Validação básica
        if (!email || !senha) {
            return res.status(400).json({ erro: "Email e senha são obrigatórios" });
        }

        const user = await usuario.login(email, senha);

        if (!user) {
            return res.status(401).json({ erro: "Email ou senha inválidos" });
        }

        // Simula token JWT (em produção, use JWT)
        const token = `token_simulado_${user.idUsuario}_${Date.now()}`;

        res.json({
            mensagem: "Login realizado com sucesso",
            usuario: user,
            token: token
        });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao realizar login", detalhe: error.message });
    }
}

async function cadastrar(req, res) {
    try {
        const { nome, email, confirmarEmail, senha, confirmarSenha } = req.body;

        // Validações
        if (!nome || !email || !senha) {
            return res.status(400).json({ erro: "Nome, email e senha são obrigatórios" });
        }

        if (email !== confirmarEmail) {
            return res.status(400).json({ erro: "Emails não coincidem" });
        }

        if (senha !== confirmarSenha) {
            return res.status(400).json({ erro: "Senhas não coincidem" });
        }

        if (senha.length < 8) {
            return res.status(400).json({ erro: "Senha fraca - deve ter no mínimo 8 caracteres" });
        }

        // Verificar se email já existe
        const emailExiste = await usuario.emailExists(email);
        if (emailExiste) {
            return res.status(400).json({ erro: "Email já cadastrado" });
        }

        const novo = await usuario.create({
            nomeCompleto: nome,
            email,
            senha,
            nivelAcesso: "autor"
        });

        res.status(201).json({ mensagem: "Usuário criado com sucesso", usuario: novo });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao cadastrar usuário", detalhe: error.message });
    }
}

async function atualizar(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;
        const { nomeCompleto, email, nivelAcesso, senha } = req.body;

        // Verificar se o usuário existe
        const usuarioExistente = await usuario.find(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Se for alterar o email, verificar se já existe
        if (email && email !== usuarioExistente.email) {
            const emailExiste = await usuario.emailExists(email);
            if (emailExiste) {
                return res.status(400).json({ erro: "Email já cadastrado por outro usuário" });
            }
        }

        const dadosAtualizados = {
            nomeCompleto: nomeCompleto || usuarioExistente.nomeCompleto,
            email: email || usuarioExistente.email,
            nivelAcesso: nivelAcesso || usuarioExistente.nivelAcesso
        };

        // Se veio senha, inclui no update
        if (senha) {
            if (senha.length < 8) {
                return res.status(400).json({ erro: "Senha deve ter no mínimo 8 caracteres" });
            }
            dadosAtualizados.senha = senha;
        }

        let atualizado;
        if (senha) {
            atualizado = await usuario.update(id, dadosAtualizados);
        } else {
            atualizado = await usuario.updateWithoutPassword(id, dadosAtualizados);
        }

        if (!atualizado) {
            return res.status(500).json({ erro: "Erro ao atualizar usuário" });
        }

        const usuarioAtualizado = await usuario.find(id);
        res.json({ mensagem: "Usuário atualizado com sucesso", usuario: usuarioAtualizado });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar usuário", detalhe: error.message });
    }
}

async function atualizarSenha(req, res) {
    try {
        const { id } = req.params;
        const { senhaAtual, novaSenha, confirmarNovaSenha } = req.body;

        // Verificar se o usuário existe
        const usuarioExistente = await usuario.find(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        // Verificar senha atual (simplificado - em produção use hash)
        const loginCheck = await usuario.login(usuarioExistente.email, senhaAtual);
        if (!loginCheck) {
            return res.status(401).json({ erro: "Senha atual incorreta" });
        }

        // Validações da nova senha
        if (novaSenha !== confirmarNovaSenha) {
            return res.status(400).json({ erro: "Nova senha e confirmação não coincidem" });
        }

        if (novaSenha.length < 8) {
            return res.status(400).json({ erro: "Nova senha deve ter no mínimo 8 caracteres" });
        }

        const atualizado = await usuario.updatePassword(id, novaSenha);

        if (!atualizado) {
            return res.status(500).json({ erro: "Erro ao atualizar senha" });
        }

        res.json({ mensagem: "Senha atualizada com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar senha", detalhe: error.message });
    }
}

async function deletar(req, res) {
    try {
        req.usuario = { nivelAcesso: "admin" };

        if (!temPermissao(req, ["admin"])) {
            return res.status(403).json({ erro: "Sem permissão" });
        }

        const { id } = req.params;

        // Verificar se o usuário existe
        const usuarioExistente = await usuario.find(id);
        if (!usuarioExistente) {
            return res.status(404).json({ erro: "Usuário não encontrado" });
        }

        const ok = await usuario.delete(id);

        if (!ok) {
            return res.status(500).json({ erro: "Erro ao remover usuário" });
        }

        res.json({ mensagem: "Usuário removido com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar usuário", detalhe: error.message });
    }
}

module.exports = {
    listar,           // Listar todos os usuários (admin)
    buscar,           // Buscar usuário por ID (admin)
    buscarPorEmail,   // Buscar usuário por email (admin)
    buscarPorNivel,   // Buscar usuários por nível de acesso (admin)
    login,            // Login do usuário
    cadastrar,        // Cadastrar novo usuário
    atualizar,        // Atualizar dados do usuário (admin)
    atualizarSenha,   // Atualizar apenas a senha
    deletar           // Deletar usuário (admin)
};
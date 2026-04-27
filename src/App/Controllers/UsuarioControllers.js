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

async function login(req, res) {
    const { email, senha } = req.body;

    const user = await usuario.login(email, senha);

    if (!user) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    res.json({ mensagem: "Login realizado com sucesso", user });
}

async function cadastrar(req, res) {
    const { nome, email, confirmarEmail, senha, confirmarSenha } = req.body;

    if (email !== confirmarEmail) return res.json({ erro: "Emails não coincidem" });
    if (senha !== confirmarSenha) return res.json({ erro: "Senhas não coincidem" });
    if (senha.length < 8) return res.json({ erro: "Senha fraca" });

    try {
        const novo = await usuario.create({
            nomeCompleto: nome,
            email,
            senha,
            nivelAcesso: "autor" 
        });

        res.json({ mensagem: "Usuário criado", usuario: novo });

    } catch (e) {
        res.json({ erro: e.message });
    }
}

async function listarUsuarios(req, res) {
    req.usuario = { nivelAcesso: "admin" }; 

    if (!temPermissao(req, ["admin"])) {
        return res.json({ erro: "Sem permissão" });
    }

    const usuarios = await usuario.all();
    res.json(usuarios);
}

module.exports = {
    login,
    cadastrar,
    listarUsuarios
};
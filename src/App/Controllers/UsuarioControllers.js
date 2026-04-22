// App/Controllers/UsuarioController.js

const Usuario = require("../Models/Usuario");

function login(req, res) {
    const { email, senha } = req.body;

    const usuario = Usuario.buscarPorEmail(email);

    if (!usuario || usuario.senha !== senha) {
        return res.status(401).json({ erro: "Email ou senha inválidos" });
    }

    res.json({ mensagem: "Login realizado com sucesso" });
}

function cadastrar(req, res) {
    const { nome, email, confirmarEmail, senha, confirmarSenha } = req.body;

    if (email !== confirmarEmail) {
        return res.json({ erro: "Emails não coincidem" });
    }

    if (senha !== confirmarSenha) {
        return res.json({ erro: "Senhas não coincidem" });
    }

    if (senha.length < 8) {
        return res.json({ erro: "Senha muito fraca" });
    }

    const existe = Usuario.buscarPorEmail(email);

    if (existe) {
        return res.json({ erro: "Email já cadastrado" });
    }

    Usuario.criar({ nome, email, senha, role: "leitor" });

    res.json({ mensagem: "Usuário cadastrado" });
}

function listarUsuarios(req, res) {
    // simulando usuário logado
    req.usuario = { role: "admin" };

    if (req.usuario.role !== "admin") {
        return res.json({ erro: "Sem permissão" });
    }

    const usuarios = Usuario.buscarTodos();

    res.json(usuarios);
}

module.exports = {
    login,
    cadastrar,
    listarUsuarios
};
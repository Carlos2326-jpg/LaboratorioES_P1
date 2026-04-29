const express = require('express');
const path = require('path');
const router = express.Router();

// Rota raiz → redireciona para login
router.get('/', (req, res) => {
    res.redirect('/usuario/login');
});

router.get('/usuario/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Usuario/index.html'));
});

router.get('/usuario/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Usuario/cadastro.html'));
});

router.get('/usuario/gerenciar', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Usuario/gerenciar.html'));
});

router.get('/usuario/minhas-postagens', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Usuario/minhasPostagens.html'));
});

router.get('/usuario/redefinir-senha', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Usuario/redefinirSenha.html'));
});

router.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Home/index.html'));
});

router.get('/noticia/criar', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Noticia/criar.html'));
});

router.get('/noticia/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Noticia/index.html'));
});

router.get('/categorias', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Categorias/index.html'));
});

module.exports = router;
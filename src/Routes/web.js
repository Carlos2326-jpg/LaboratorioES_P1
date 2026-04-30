// src/Routes/web.js
const express = require('express');
const path    = require('path');
const router  = express.Router();

// Rota raiz → redireciona para login
router.get('/', (req, res) => {
    res.redirect('/usuario/login');
});

// ─── USUÁRIO ───
router.get('/usuario/login',          (req, res) => res.sendFile(path.join(__dirname, '../Views/Usuario/index.html')));
router.get('/usuario/cadastro',       (req, res) => res.sendFile(path.join(__dirname, '../Views/Usuario/cadastro.html')));
router.get('/usuario/gerenciar',      (req, res) => res.sendFile(path.join(__dirname, '../Views/Usuario/gerenciar.html')));
router.get('/usuario/minhas-postagens', (req, res) => res.sendFile(path.join(__dirname, '../Views/Usuario/minhasPostagens.html')));
router.get('/usuario/redefinir-senha', (req, res) => res.sendFile(path.join(__dirname, '../Views/Usuario/redefinirSenha.html')));

// ─── HOME ───
router.get('/home', (req, res) => res.sendFile(path.join(__dirname, '../Views/Home/index.html')));

// ─── CATEGORIAS ───
router.get('/categorias', (req, res) => res.sendFile(path.join(__dirname, '../Views/Categorias/index.html')));

// ─── NOTÍCIA ───
// FIX: rotas específicas ANTES de /:slug para evitar conflito de rotas
router.get('/noticia/criar', (req, res) => res.sendFile(path.join(__dirname, '../Views/Noticia/criar.html')));

// Editar por query string (?id=123) ou por path (/editar/123)
router.get('/noticia/editar', (req, res) => {
    if (!req.query.id) return res.redirect('/usuario/minhas-postagens');
    res.sendFile(path.join(__dirname, '../Views/Noticia/editar.html'));
});
router.get('/noticia/editar/:id', (req, res) => {
    res.sendFile(path.join(__dirname, '../Views/Noticia/editar.html'));
});

// Slug deve vir por ÚLTIMO para não engolir "criar" e "editar"
router.get('/noticia/:slug', (req, res) => res.sendFile(path.join(__dirname, '../Views/Noticia/index.html')));

module.exports = router;
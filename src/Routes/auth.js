const express = require('express');
const router = express.Router();
const UsuarioController = require('../Controllers/UsuarioControllers');
const { authMiddleware } = require('../Middlewares/authMiddleware');

const usuarioController = new UsuarioController();

// Rotas públicas de autenticação
router.post('/login', usuarioController.login.bind(usuarioController));
router.post('/register', usuarioController.cadastrar.bind(usuarioController));

// FIX: era solicitarRedefinicaoSenha (inexistente) → corrigido para solicitarRedefinicao
router.post('/forgot-password', usuarioController.solicitarRedefinicao.bind(usuarioController));
router.post('/reset-password', usuarioController.redefinirSenha.bind(usuarioController));

// Rotas protegidas
router.get('/me', authMiddleware, usuarioController.getPerfil.bind(usuarioController));

// FIX: req.usuario.id → req.usuario.idUsuario (campo correto do JWT payload)
router.put('/me', authMiddleware, (req, res, next) => {
    req.params.id = req.usuario.idUsuario;
    next();
}, usuarioController.atualizar.bind(usuarioController));

router.post('/logout', authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Logout realizado com sucesso' });
});

module.exports = router;
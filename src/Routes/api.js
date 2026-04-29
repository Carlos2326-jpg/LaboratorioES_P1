// src/Routes/api.js
const express = require('express');
const CategoriaController = require('../Controllers/CategoriaControllers');
const PostagemController = require('../Controllers/PostagemControllers');
const UsuarioController = require('../Controllers/UsuarioControllers');
const {
    authMiddleware,
    adminOnly,
    editorOrAdmin,
    autorOrHigher
} = require('../Middlewares/authMiddleware');

const router = express.Router();

// === INSTÂNCIAS DOS CONTROLADORES ===
const categoriaController = new CategoriaController();
const postagemController = new PostagemController();
const usuarioController = new UsuarioController();

// ═══════════════════════════════════════════════════════
// ROTAS PÚBLICAS (sem autenticação)
// ═══════════════════════════════════════════════════════

router.post('/usuario/login',        usuarioController.login.bind(usuarioController));
router.post('/usuario/cadastrar',    usuarioController.cadastrar.bind(usuarioController));

// OTP
router.post('/usuario/solicitar-otp',        usuarioController.solicitarOTP.bind(usuarioController));
router.post('/usuario/verificar-otp',        usuarioController.verificarOTP.bind(usuarioController));

// Recuperação de senha
router.post('/usuario/solicitar-redefinicao', usuarioController.solicitarRedefinicao.bind(usuarioController));
router.post('/usuario/verificar-reset-token', usuarioController.verificarResetToken.bind(usuarioController));
router.post('/usuario/redefinir-senha',        usuarioController.redefinirSenha.bind(usuarioController));

// Conteúdo público — ATENÇÃO: rotas específicas antes das genéricas com :param
router.get('/categorias',             categoriaController.listar.bind(categoriaController));

// FIX: rotas de path específico (/recentes, /buscar) ANTES de /:slug
// para evitar conflito onde "recentes" e "buscar" seriam interpretados como slugs
router.get('/postagens/recentes',     postagemController.buscarRecentes.bind(postagemController));
router.get('/postagens/buscar',       postagemController.buscarPorTermo.bind(postagemController));
router.get('/postagens',              postagemController.listarPublicadas.bind(postagemController));

// Rota de slug pública (leitura de notícia)
router.get('/postagens/slug/:slug',   postagemController.buscarPorSlug.bind(postagemController));

// ═══════════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICAÇÃO (tudo abaixo requer token)
// ═══════════════════════════════════════════════════════
router.use(authMiddleware);

// ═══════════════════════════════════════════════════════
// ROTAS PROTEGIDAS
// ═══════════════════════════════════════════════════════

// Perfil e minhas postagens
router.get('/usuario/perfil',           usuarioController.getPerfil.bind(usuarioController));
router.get('/usuario/minhas-postagens', postagemController.buscarPorUsuario.bind(postagemController));

// Usuários (admin only)
router.get('/usuarios',     adminOnly, usuarioController.listar.bind(usuarioController));
router.get('/usuarios/:id', adminOnly, usuarioController.buscarPorId.bind(usuarioController));
router.put('/usuarios/:id', adminOnly, usuarioController.atualizar.bind(usuarioController));

// Postagens — rota de edição (carrega dados pré-preenchidos) antes de /:id genérico
// FIX: registrar buscarPorIdParaEdicao que estava definida no controller mas sem rota
router.get('/postagens/editar/:id', autorOrHigher, postagemController.buscarPorIdParaEdicao.bind(postagemController));

// Postagens por ID (autenticado — pode ver rascunhos próprios)
router.get('/postagens/:id', autorOrHigher, postagemController.buscarPorId.bind(postagemController));

// CRUD de postagens
router.post('/postagens',      autorOrHigher, postagemController.criar.bind(postagemController));
router.put('/postagens/:id',   autorOrHigher, postagemController.atualizar.bind(postagemController));
router.delete('/postagens/:id', autorOrHigher, postagemController.deletar.bind(postagemController));

// Categorias
router.get('/categorias/:id',    categoriaController.buscarPorId.bind(categoriaController));
router.post('/categorias',       editorOrAdmin, categoriaController.criar.bind(categoriaController));
router.put('/categorias/:id',    editorOrAdmin, categoriaController.atualizar.bind(categoriaController));
router.delete('/categorias/:id', adminOnly,     categoriaController.deletar.bind(categoriaController));

module.exports = router;
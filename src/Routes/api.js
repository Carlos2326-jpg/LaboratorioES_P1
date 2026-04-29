const express = require('express');
const CategoriaController = require('../Controllers/CategoriaControllers');
const PostagemController = require('../Controllers/PostagemControllers');
const UsuarioController = require('../Controllers/UsuarioControllers');
const { authMiddleware, adminOnly, editorOrAdmin, autorOrHigher } = require('../Middlewares/authMiddleware');

const router = express.Router();

// === INSTÂNCIAS DOS CONTROLADORES ===
const categoriaController = new CategoriaController();
const postagemController = new PostagemController();
const usuarioController = new UsuarioController();

// === ROTAS PÚBLICAS (SEM AUTENTICAÇÃO) ===
router.post('/usuario/login', usuarioController.login.bind(usuarioController));
router.post('/usuario/cadastrar', usuarioController.cadastrar.bind(usuarioController));

// === OTP (PÚBLICAS - 2FA/Verificação) ===
router.post('/usuario/solicitar-otp', usuarioController.solicitarOTP.bind(usuarioController));
router.post('/usuario/verificar-otp', usuarioController.verificarOTP.bind(usuarioController));

// === Recuperação de Senha ===
router.post('/usuario/solicitar-redefinicao', usuarioController.solicitarRedefinicao.bind(usuarioController));
router.post('/usuario/verificar-reset-token', usuarioController.verificarResetToken.bind(usuarioController));
router.post('/usuario/redefinir-senha', usuarioController.redefinirSenha.bind(usuarioController));

// === Conteúdo Público ===
router.get('/categorias', categoriaController.listar.bind(categoriaController));
router.get('/postagens', postagemController.listarPublicadas.bind(postagemController));
router.get('/postagens/recentes', postagemController.buscarRecentes.bind(postagemController));
router.get('/postagens/:slug', postagemController.buscarPorSlug.bind(postagemController));
router.get('/postagens/buscar', postagemController.buscarPorTermo.bind(postagemController));

// === MIDDLEWARE DE AUTENTICAÇÃO ===
router.use(authMiddleware);

// === ROTAS PROTEGIDAS (COM AUTENTICAÇÃO) ===

// === PERFIL E MINHAS POSTAGENS ===
router.get('/usuario/perfil', usuarioController.getPerfil.bind(usuarioController));
router.get('/usuario/minhas-postagens', postagemController.buscarPorUsuario.bind(postagemController));

// === USUÁRIOS (ADMIN ONLY) ===
router.get('/usuarios', adminOnly, usuarioController.listar.bind(usuarioController));
router.get('/usuarios/:id', adminOnly, usuarioController.buscarPorId.bind(usuarioController));
router.put('/usuarios/:id', adminOnly, usuarioController.atualizar.bind(usuarioController));

// === POSTAGENS (AUTOR OU SUPERIOR) ===
router.post('/postagens', autorOrHigher, postagemController.criar.bind(postagemController));
router.put('/postagens/:id', autorOrHigher, postagemController.atualizar.bind(postagemController));
router.delete('/postagens/:id', autorOrHigher, postagemController.deletar.bind(postagemController));

// === CATEGORIAS (EDITOR OU ADMIN) ===
router.post('/categorias', editorOrAdmin, categoriaController.criar.bind(categoriaController));
router.put('/categorias/:id', editorOrAdmin, categoriaController.atualizar.bind(categoriaController));
router.delete('/categorias/:id', adminOnly, categoriaController.deletar.bind(categoriaController));

module.exports = router;
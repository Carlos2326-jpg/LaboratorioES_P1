const express = require('express');
const CategoriaController = require('../Controllers/CategoriaControllers');
const PostagemController = require('../Controllers/PostagemControllers');
const UsuarioController = require('../Controllers/UsuarioControllers');
const { authMiddleware, adminOnly, editorOrAdmin } = require('../Middlewares/authMiddleware');
const { postagemValidation, usuarioValidation } = require('../Middlewares/validationMiddleware');

const router = express.Router();

const categoriaController = new CategoriaController();
const postagemController = new PostagemController();
const usuarioController = new UsuarioController();

// Rotas públicas
router.post('/usuario/login', usuarioController.login.bind(usuarioController));
router.post('/usuario/cadastrar', usuarioValidation, usuarioController.cadastrar.bind(usuarioController));
router.post('/usuario/solicitar-redefinicao', usuarioController.solicitarRedefinicaoSenha.bind(usuarioController));
router.post('/usuario/redefinir-senha', usuarioController.redefinirSenha.bind(usuarioController));

router.get('/postagens', postagemController.listarPublicadas.bind(postagemController));
router.get('/postagens/recentes', postagemController.buscarRecentes.bind(postagemController));
router.get('/postagens/buscar', postagemController.buscarPorTermo.bind(postagemController));
router.get('/postagens/:slug', postagemController.buscarPorSlug.bind(postagemController));

router.get('/categorias', categoriaController.listar.bind(categoriaController));

// Rotas protegidas (requer autenticação)
router.use(authMiddleware);

router.get('/usuario/perfil', usuarioController.getPerfil.bind(usuarioController));

// Corrigido: usa o id do usuário logado em vez de req.params.usuarioId inexistente
router.get('/usuario/minhas-postagens', (req, res, next) => {
  req.params = { ...req.params, usuarioId: req.usuario.id };
  next();
}, postagemController.buscarPorUsuario.bind(postagemController));

router.put('/usuario/:id', usuarioController.atualizar.bind(usuarioController));

router.post('/postagens', postagemValidation, postagemController.criar.bind(postagemController));
router.put('/postagens/:id', postagemValidation, postagemController.atualizar.bind(postagemController));
router.delete('/postagens/:id', postagemController.deletar.bind(postagemController));

// Rotas administrativas
router.get('/usuarios', adminOnly, usuarioController.listar.bind(usuarioController));
router.get('/usuarios/:id', adminOnly, usuarioController.buscarPorId.bind(usuarioController));

router.post('/categorias', editorOrAdmin, categoriaController.criar.bind(categoriaController));
router.put('/categorias/:id', editorOrAdmin, categoriaController.atualizar.bind(categoriaController));
router.delete('/categorias/:id', adminOnly, categoriaController.deletar.bind(categoriaController));

module.exports = router;
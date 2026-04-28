const UsuarioService = require('../Services/UsuarioService');

class UsuarioController {
    constructor() {
        this.usuarioService = new UsuarioService();
    }

    async login(req, res) {
        try {
            const { email, senha } = req.body;
            const { usuario, token } = await this.usuarioService.login(email, senha);
            res.json({
                success: true,
                message: 'Login realizado!',
                data: { usuario, token }
            });
        } catch (error) {
            res.status(401).json({ success: false, error: error.message });
        }
    }

    async cadastrar(req, res) {
        try {
            const { usuario, token } = await this.usuarioService.cadastrar(req.body);
            res.status(201).json({
                success: true,
                message: 'Usuário cadastrado!',
                data: { usuario, token }
            });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async listar(req, res) {
        try {
            const { busca, nivelAcesso } = req.query;
            const usuarios = await this.usuarioService.listarUsuarios({ busca, nivelAcesso }, req.usuario);
            res.json({ success: true, data: usuarios });
        } catch (error) {
            res.status(403).json({ success: false, error: error.message });
        }
    }

    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const usuario = await this.usuarioService.buscarPorId(id, req.usuario);
            res.json({ success: true, data: usuario });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id)) return res.status(400).json({ success: false, error: 'ID inválido' });
            const usuario = await this.usuarioService.atualizarUsuario(id, req.body, req.usuario);
            res.json({ success: true, message: 'Usuário atualizado!', data: usuario });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async getPerfil(req, res) {
        try {
            const usuario = await this.usuarioService.buscarPorId(req.usuario.idUsuario || req.usuario.id);
            res.json({ success: true, data: usuario });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async solicitarRedefinicaoSenha(req, res) {
        try {
            const { email } = req.body;
            await this.usuarioService.gerarTokenRedefinicao(email);
            res.json({ success: true, message: 'Email de recuperação enviado!' });
        } catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async redefinirSenha(req, res) {
        try {
            const { token, novaSenha } = req.body;
            await this.usuarioService.redefinirSenha(token, novaSenha);
            res.json({ success: true, message: 'Senha redefinida!' });
        } catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = UsuarioController;
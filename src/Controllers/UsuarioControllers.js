const UsuarioService = require('../Services/UsuarioService');

class UsuarioController {
    constructor() {
        this.usuarioService = new UsuarioService();
    }

    // 🔐 LOGIN
    async login(req, res) {
        try {
            const { email, senha } = req.body;
            
            if (!email || !senha) {
                return res.status(400).json({
                    success: false,
                    error: 'Email e senha são obrigatórios'
                });
            }

            const { usuario, token } = await this.usuarioService.login(email, senha);
            
            res.json({
                success: true,
                message: 'Login realizado com sucesso!',
                data: { 
                    usuario: {
                        idUsuario: usuario.idUsuario,
                        nomeCompleto: usuario.nomeCompleto,
                        email: usuario.email,
                        nivelAcesso: usuario.nivelAcesso,
                        status: usuario.status
                    },
                    token 
                }
            });
        } catch (error) {
            console.error('❌ Erro no login:', error.message);
            res.status(401).json({ 
                success: false, 
                error: 'Credenciais inválidas' 
            });
        }
    }

    // 👤 CADASTRO
    async cadastrar(req, res) {
        try {
            const { nome, email, confirmarEmail, senha, confirmarSenha } = req.body;

            if (!nome || !email || !senha) {
                return res.status(400).json({
                    success: false,
                    error: 'Nome, email e senha são obrigatórios'
                });
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ success: false, error: 'Email inválido' });
            }
            if (confirmarEmail && email.trim().toLowerCase() !== confirmarEmail.trim().toLowerCase()) {
                return res.status(400).json({ success: false, error: 'Os emails não coincidem' });
            }

            const resultado = await this.usuarioService.cadastrar({
                nome,
                email: email.trim().toLowerCase(),
                confirmarEmail: confirmarEmail?.trim().toLowerCase(),
                senha,
                confirmarSenha
            });

            res.status(201).json({
                success: true,
                message: 'Cadastro realizado com sucesso!',
                redirectTo: '/dashboard',
                data: {
                    usuario: {
                        idUsuario: resultado.usuario.idUsuario,
                        nomeCompleto: resultado.usuario.nomeCompleto,
                        email: resultado.usuario.email,
                        nivelAcesso: resultado.usuario.nivelAcesso
                    },
                    token: resultado.token
                }
            });
        } catch (error) {
            console.error('❌ Erro no cadastro:', error.message);
            res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // 📧 OTP - SOLICITAR
    async solicitarOTP(req, res) {
        try {
            const { email } = req.body;
            
            if (!email || !email.includes('@')) {
                return res.status(400).json({
                    success: false,
                    error: 'Email válido é obrigatório'
                });
            }

            await this.usuarioService.solicitarRedefinicao(email);
            
            res.json({
                success: true,
                message: 'Código de verificação enviado para seu email!',
                data: { email }
            });
        } catch (error) {
            console.error('❌ Erro solicitar OTP:', error.message);
            res.status(500).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // ✅ VERIFICAR OTP
    async verificarOTP(req, res) {
        try {
            const { email, otp } = req.body;
            
            if (!email || !otp || otp.length !== 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Email e código de 6 dígitos são obrigatórios'
                });
            }

            const usuario = await this.usuarioService.verificarOTP(email, otp);
            const token = this.usuarioService.gerarToken(usuario);

            res.json({
                success: true,
                message: 'Código verificado com sucesso!',
                data: {
                    usuario: {
                        idUsuario: usuario.idUsuario,
                        nomeCompleto: usuario.nomeCompleto,
                        email: usuario.email,
                        nivelAcesso: usuario.nivelAcesso
                    },
                    token
                }
            });
        } catch (error) {
            console.error('❌ Erro verificar OTP:', error.message);
            res.status(400).json({ 
                success: false, 
                error: error.message 
            });
        }
    }

    // 🔄 RESET SENHA - SOLICITAR
    async solicitarRedefinicao(req, res) {
        try {
            const { email } = req.body;
            if (!email || !email.includes('@')) {
                return res.status(400).json({
                    success: false,
                    error: 'Email válido é obrigatório'
                });
            }

            await this.usuarioService.solicitarRedefinicao(email);
            
            res.json({
                success: true,
                message: 'Se o email existir em nosso sistema, você receberá instruções para redefinir sua senha'
            });
        } catch (error) {
            console.error('❌ Erro solicitação reset:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // 🔄 RESET SENHA - VERIFICAR TOKEN
    async verificarResetToken(req, res) {
        try {
            const { email, otp } = req.body;
            
            if (!email || !otp || otp.length !== 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Email e código de 6 dígitos são obrigatórios'
                });
            }

            const result = await this.usuarioService.verificarResetToken(email, otp);
            
            res.json({ 
                success: true, 
                message: 'Código verificado! Você pode redefinir sua senha.',
                data: { token: result.token } 
            });
        } catch (error) {
            console.error('❌ Erro verificar reset token:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // 🔄 RESET SENHA - REDEFINIR
    async redefinirSenha(req, res) {
        try {
            const { token, novaSenha } = req.body;
            if (!token || !novaSenha || novaSenha.length < 8) {
                return res.status(400).json({
                    success: false,
                    error: 'Token e senha válida (mín. 8 caracteres) são obrigatórios'
                });
            }

            await this.usuarioService.redefinirSenha(token, novaSenha);
            
            res.json({ 
                success: true, 
                message: 'Senha redefinida com sucesso! Faça login com a nova senha.',
                redirectTo: '/usuario/login'
            });
        } catch (error) {
            console.error('❌ Erro redefinição senha:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }

    // 👤 MEU PERFIL (ROTA PROTEGIDA)
    async getPerfil(req, res) {
        try {
            const usuario = await this.usuarioService.buscarPorId(req.usuario.idUsuario, req.usuario);
            res.json({ 
                success: true, 
                data: {
                    idUsuario: usuario.idUsuario,
                    nomeCompleto: usuario.nomeCompleto,
                    email: usuario.email,
                    nivelAcesso: usuario.nivelAcesso,
                    status: usuario.status,
                    total_postagens: usuario.total_postagens || 0,
                    total_categorias: usuario.total_categorias || 0
                }
            });
        } catch (error) {
            console.error('❌ Erro ao buscar perfil:', error.message);
            res.status(500).json({ success: false, error: 'Erro ao buscar perfil' });
        }
    }

    // 📋 ADMIN - LISTAR USUÁRIOS (ROTA PROTEGIDA) ✅ CORRIGIDO
    async listar(req, res) {
        try {
            const { busca, nivelAcesso, status, pagina = 1, limite = 10 } = req.query;
            
            const filtros = {
                busca: busca || '',  // ✅ CORRIGIDO: '' ao invés de vírgula solta
                nivelAcesso: nivelAcesso || undefined,
                status: status || undefined,
                pagina: parseInt(pagina),
                limite: parseInt(limite)
            };

            const usuarios = await this.usuarioService.listarUsuarios(filtros, req.usuario);
            
            res.json({ 
                success: true, 
                data: usuarios.data || usuarios,
                pagination: usuarios.pagination || {
                    pagina: filtros.pagina,
                    limite: filtros.limite,
                    total: usuarios.length || 0
                }
            });
        } catch (error) {
            console.error('❌ Erro ao listar usuários:', error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    // 👁️ ADMIN - BUSCAR USUÁRIO POR ID (ROTA PROTEGIDA)
    async buscarPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }
            
            const usuario = await this.usuarioService.buscarPorId(id, req.usuario);
            
            res.json({ 
                success: true, 
                data: {
                    idUsuario: usuario.idUsuario,
                    nomeCompleto: usuario.nomeCompleto,
                    email: usuario.email,
                    nivelAcesso: usuario.nivelAcesso,
                    status: usuario.status,
                    total_postagens: usuario.total_postagens || 0,
                    total_categorias: usuario.total_categorias || 0
                }
            });
        } catch (error) {
            console.error('❌ Erro ao buscar usuário:', error.message);
            if (error.message.includes('Acesso negado')) {
                return res.status(403).json({ success: false, error: 'Acesso negado' });
            }
            res.status(404).json({ success: false, error: 'Usuário não encontrado' });
        }
    }

    // ✏️ ADMIN - ATUALIZAR USUÁRIO (ROTA PROTEGIDA)
    async atualizar(req, res) {
        try {
            const id = parseInt(req.params.id);
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({ success: false, error: 'ID inválido' });
            }

            const usuario = await this.usuarioService.atualizarUsuario(id, req.body, req.usuario);
            
            res.json({
                success: true,
                message: 'Usuário atualizado com sucesso!',
                data: {
                    idUsuario: usuario.idUsuario,
                    nomeCompleto: usuario.nomeCompleto,
                    email: usuario.email,
                    nivelAcesso: usuario.nivelAcesso,
                    status: usuario.status
                }
            });
        } catch (error) {
            console.error('❌ Erro ao atualizar usuário:', error.message);
            res.status(400).json({ success: false, error: error.message });
        }
    }
}

module.exports = UsuarioController;

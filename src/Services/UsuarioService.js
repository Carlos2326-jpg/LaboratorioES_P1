// src/Services/UsuarioService.js
const UsuarioModel = require('../Models/Usuario');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

class UsuarioService {
    constructor() {
        this.usuarioModel = new UsuarioModel();

        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: { rejectUnauthorized: false }
        });
    }

    // ─── TOKEN JWT ───
    gerarToken(usuario) {
        return jwt.sign(
            {
                idUsuario: usuario.idUsuario,
                email: usuario.email,
                nomeCompleto: usuario.nomeCompleto,
                nivelAcesso: usuario.nivelAcesso
            },
            process.env.JWT_SECRET || 'fallback-secret-key-change-me',
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
    }

    // ─── LOGIN ───
    async login(email, senha) {
        const usuario = await this.usuarioModel.login(email, senha);
        if (!usuario) {
            throw new Error('Email ou senha inválidos');
        }
        const token = this.gerarToken(usuario);
        return { usuario, token };
    }

    // ─── CADASTRO ───
    async cadastrar(dados) {
        if (dados.confirmarEmail && dados.email !== dados.confirmarEmail) {
            throw new Error('Emails não coincidem');
        }
        if (dados.confirmarSenha && dados.senha !== dados.confirmarSenha) {
            throw new Error('Senhas não coincidem');
        }
        if (dados.senha.length < 8) {
            throw new Error('Senha deve ter no mínimo 8 caracteres');
        }

        const usuario = await this.usuarioModel.create({
            nomeCompleto: dados.nome.trim(),
            email: dados.email.trim().toLowerCase(),
            senha: dados.senha,
            nivelAcesso: 'autor',
            status: 'ativo'
        });

        const token = this.gerarToken(usuario);
        return { usuario, token };
    }

    // ─── ADMIN: LISTAR USUÁRIOS ───
    async listarUsuarios(filtros = {}, usuarioLogado) {
        if (usuarioLogado.nivelAcesso !== 'admin') {
            throw new Error('Apenas administradores podem listar usuários');
        }
        return await this.usuarioModel.search(filtros);
    }

    // ─── BUSCAR USUÁRIO ───
    async buscarPorId(id, usuarioLogado = null) {
        const usuario = await this.usuarioModel.getUserWithStats(id);
        if (!usuario) throw new Error('Usuário não encontrado');

        if (
            usuarioLogado &&
            usuarioLogado.nivelAcesso !== 'admin' &&
            usuarioLogado.idUsuario !== parseInt(id)
        ) {
            throw new Error('Acesso negado');
        }
        return usuario;
    }

    // ─── ATUALIZAR USUÁRIO ───
    async atualizarUsuario(id, dados, usuarioLogado) {
        if (
            usuarioLogado.nivelAcesso !== 'admin' &&
            usuarioLogado.idUsuario !== parseInt(id)
        ) {
            throw new Error('Sem permissão para editar este usuário');
        }

        const usuarioExistente = await this.usuarioModel.find(id);
        if (!usuarioExistente) throw new Error('Usuário não encontrado');

        // Proteção: não rebaixar último admin
        if (usuarioLogado.nivelAcesso === 'admin' && dados.nivelAcesso) {
            const admins = await this.usuarioModel.findByNivelAcesso('admin');
            if (
                usuarioExistente.nivelAcesso === 'admin' &&
                dados.nivelAcesso !== 'admin' &&
                admins.length <= 1
            ) {
                throw new Error('Não é possível rebaixar o único administrador');
            }
        }

        const camposPermitidos = {};
        if (dados.nomeCompleto) camposPermitidos.nomeCompleto = dados.nomeCompleto.trim();
        if (dados.nivelAcesso && usuarioLogado.nivelAcesso === 'admin') {
            camposPermitidos.nivelAcesso = dados.nivelAcesso;
        }
        if (dados.status && usuarioLogado.nivelAcesso === 'admin') {
            camposPermitidos.status = dados.status;
        }

        if (Object.keys(camposPermitidos).length === 0) {
            throw new Error('Nenhum campo válido para atualizar');
        }

        const updated = await this.usuarioModel.update(id, camposPermitidos);
        if (!updated) throw new Error('Erro ao atualizar usuário');

        return await this.usuarioModel.getUserWithStats(id);
    }

    // ─── OTP ───

    gerarOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    async enviarOTP(email, usuario, tipo = 'verificacao') {
        const otp = this.gerarOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

        // Salvar OTP no banco
        await this.usuarioModel.update(usuario.idUsuario, {
            otp,
            otp_expires: expiresAt
        });

        const htmlEmail = this.criarTemplateOTP(otp, email, tipo, usuario.nomeCompleto);

        try {
            await this.transporter.sendMail({
                from: `"Blog de Notícias" <${process.env.SMTP_USER}>`,
                to: email,
                subject: tipo === 'reset'
                    ? `Redefinir senha (${otp}) - Blog de Notícias`
                    : `Seu código de verificação (${otp})`,
                html: htmlEmail,
                text: `Seu código: ${otp} (válido por 10 minutos)`
            });
        } catch (error) {
            console.error('❌ Erro ao enviar email OTP:', error.message);
            // Limpa OTP salvo se email falhou
            await this.usuarioModel.clearOTP(usuario.idUsuario);
            throw new Error('Erro ao enviar código por email. Verifique a configuração SMTP.');
        }

        console.log(`✅ OTP enviado para ${email}`);
        return otp;
    }

    async verificarOTP(email, otpInput) {
        const usuario = await this.usuarioModel.verifyOTP(email, otpInput);
        if (!usuario) {
            throw new Error('Código incorreto ou expirado');
        }
        await this.usuarioModel.clearOTP(usuario.idUsuario);
        return usuario;
    }

    async temOTPPendente(email) {
        return await this.usuarioModel.hasPendingOTP(email);
    }

    criarTemplateOTP(otp, email, tipo, nomeUsuario) {
        const titulo = tipo === 'reset' ? 'Redefinir Senha' : 'Verificação';
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #f8f9fa; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
                .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 40px 30px; text-align: center; }
                .header h1 { font-size: 28px; margin-bottom: 8px; }
                .otp-container { padding: 50px 30px; text-align: center; background: #f8fafc; }
                .otp-code { font-size: 4rem; font-weight: 800; color: #2563eb; letter-spacing: 0.4em; font-family: 'Courier New', monospace; margin: 0 0 20px 0; }
                .expires { color: #64748b; font-size: 16px; margin-bottom: 30px; }
                .footer { padding: 30px; text-align: center; background: #f1f5f9; color: #64748b; font-size: 14px; border-top: 1px solid #e2e8f0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>📰 Blog de Notícias</h1>
                    <p>${titulo}</p>
                </div>
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <p class="expires">Válido por 10 minutos</p>
                    <p>Use este código para ${tipo === 'reset' ? 'redefinir sua senha' : 'verificar sua identidade'}.</p>
                    <p><strong>Nunca compartilhe este código!</strong></p>
                </div>
                <div class="footer">
                    <p>Se você não solicitou este código, ignore este email.</p>
                    <p style="margin-top:1rem;">© 2024 Blog de Notícias</p>
                </div>
            </div>
        </body>
        </html>`;
    }

    // ─── RECUPERAÇÃO DE SENHA ───

    async solicitarRedefinicao(email) {
        const usuario = await this.usuarioModel.findByEmail(email);

        // Segurança: não revela se email existe ou não
        if (!usuario || usuario.status !== 'ativo') {
            // Retorna true silenciosamente para não vazar info
            return true;
        }

        if (await this.temOTPPendente(email)) {
            throw new Error('Você já tem um código pendente. Aguarde 10 minutos.');
        }

        await this.enviarOTP(email, usuario, 'reset');
        return true;
    }

    async verificarResetToken(email, otp) {
        // verificarOTP já limpa o OTP após verificação
        const usuario = await this.verificarOTP(email, otp);

        const resetToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        await this.usuarioModel.update(usuario.idUsuario, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: expiresAt
        });

        return { token: resetToken, usuario };
    }

    async redefinirSenha(token, novaSenha) {
        const usuario = await this.usuarioModel.findByResetToken(token);
        if (!usuario) {
            throw new Error('Token inválido ou expirado');
        }

        if (novaSenha.length < 8) {
            throw new Error('Senha deve ter no mínimo 8 caracteres');
        }

        // FIX: usar db.transaction ao invés de usuarioModel.transaction (que não existe)
        await this.usuarioModel.db.transaction(async (connection) => {
            const hashedPassword = await bcrypt.hash(novaSenha, 12);
            await connection.query(
                `UPDATE Usuario SET senha = ? WHERE idUsuario = ?`,
                [hashedPassword, usuario.idUsuario]
            );
            await connection.query(
                `UPDATE Usuario SET resetPasswordToken = NULL, resetPasswordExpires = NULL,
                otp = NULL, otp_expires = NULL WHERE idUsuario = ?`,
                [usuario.idUsuario]
            );
        });

        return true;
    }

    async testarSMTP() {
        await this.transporter.verify();
        console.log('✅ SMTP configurado corretamente!');
        return true;
    }
}

module.exports = UsuarioService;
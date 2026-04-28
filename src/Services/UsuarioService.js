const UsuarioModel = require('../Models/Usuario');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

class UsuarioService {
  constructor() {
    this.usuarioModel = new UsuarioModel();
  }

  gerarToken(usuario) {
    return jwt.sign(
      { id: usuario.idUsuario, email: usuario.email, nivelAcesso: usuario.nivelAcesso },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
  }

  async login(email, senha) {
    const usuario = await this.usuarioModel.login(email, senha);
    if (!usuario) {
      throw new Error('Email ou senha inválidos');
    }

    const token = this.gerarToken(usuario);
    return { usuario, token };
  }

  async cadastrar(dados) {
    if (dados.email !== dados.confirmarEmail) {
      throw new Error('Emails não coincidem');
    }

    if (dados.senha !== dados.confirmarSenha) {
      throw new Error('Senhas não coincidem');
    }

    if (dados.senha.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    const usuario = await this.usuarioModel.create({
      nomeCompleto: dados.nome,
      email: dados.email,
      senha: dados.senha,
      nivelAcesso: 'autor'
    });

    const token = this.gerarToken(usuario);
    return { usuario, token };
  }

  async listarUsuarios(filtros = {}, usuario) {
    if (usuario.nivelAcesso !== 'admin') {
      throw new Error('Apenas administradores podem listar usuários');
    }

    let usuarios = await this.usuarioModel.all();

    if (filtros.busca) {
      usuarios = usuarios.filter(u =>
        u.nomeCompleto.toLowerCase().includes(filtros.busca.toLowerCase()) ||
        u.email.toLowerCase().includes(filtros.busca.toLowerCase())
      );
    }

    if (filtros.nivelAcesso) {
      usuarios = usuarios.filter(u => u.nivelAcesso === filtros.nivelAcesso);
    }

    return usuarios;
  }

  async buscarPorId(id, usuarioLogado = null) {
    const usuario = await this.usuarioModel.getUserWithStats(id);
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }
    return usuario;
  }

  async atualizarUsuario(id, dados, usuarioLogado) {
    if (usuarioLogado.nivelAcesso !== 'admin' && usuarioLogado.id !== parseInt(id)) {
      throw new Error('Sem permissão para editar este usuário');
    }

    const usuario = await this.usuarioModel.find(id, 'idUsuario');
    if (!usuario) {
      throw new Error('Usuário não encontrado');
    }

    if (dados.nivelAcesso && usuario.nivelAcesso === 'admin' && dados.nivelAcesso !== 'admin') {
      const admins = await this.usuarioModel.findByNivelAcesso('admin');
      if (admins.length <= 1) {
        throw new Error('Não é possível rebaixar o único administrador do sistema');
      }
    }

    const updated = await this.usuarioModel.update(id, dados, 'idUsuario');
    if (!updated) {
      throw new Error('Erro ao atualizar usuário');
    }

    return await this.usuarioModel.find(id, 'idUsuario');
  }

  async gerarTokenRedefinicao(email) {
    const usuario = await this.usuarioModel.findByEmail(email);
    if (!usuario) {
      throw new Error('Email não encontrado');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000);

    await this.usuarioModel.update(usuario.idUsuario, {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt
    }, 'idUsuario');

    return { token, usuario };
  }

  async redefinirSenha(token, novaSenha) {
    const usuario = await this.usuarioModel.findByResetToken(token);
    if (!usuario || usuario.resetPasswordExpires < new Date()) {
      throw new Error('Token inválido ou expirado');
    }

    if (novaSenha.length < 8) {
      throw new Error('A senha deve ter no mínimo 8 caracteres');
    }

    await this.usuarioModel.updatePassword(usuario.idUsuario, novaSenha);
    await this.usuarioModel.update(usuario.idUsuario, {
      resetPasswordToken: null,
      resetPasswordExpires: null
    }, 'idUsuario');

    return true;
  }
}

module.exports = UsuarioService;
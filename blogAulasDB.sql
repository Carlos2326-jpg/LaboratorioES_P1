-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS BlogNoticias CHARACTER
SET
    utf8mb4 COLLATE utf8mb4_unicode_ci;

USE BlogNoticias;

-- Tabela de Usuários
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nomeCompleto VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivelAcesso ENUM ('admin', 'editor', 'autor', 'leitor') DEFAULT 'leitor',
    status ENUM ('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    resetPasswordToken VARCHAR(255) NULL,
    resetPasswordExpires DATETIME NULL,
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimoAcesso TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
);

-- Tabela de Categorias
CREATE TABLE Categorias (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    descricao TEXT NULL,
    imagemURL VARCHAR(255) NULL,
    status ENUM ('ativo', 'inativo') DEFAULT 'ativo',
    dataCriacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status)
);

-- Tabela de Postagens
CREATE TABLE Postagem (
    idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    subTitulo VARCHAR(200) NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    resumo TEXT NULL,
    conteudo LONGTEXT NOT NULL,
    imagem_destaque VARCHAR(500) NULL,
    imagem_alt VARCHAR(200) NULL,
    dataPostagem DATETIME NOT NULL,
    dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    destaque BOOLEAN DEFAULT FALSE,
    status ENUM ('rascunho', 'publicado', 'agendado') DEFAULT 'rascunho',
    visualizacoes INT DEFAULT 0,
    usuario_idUsuario INT NOT NULL,
    FOREIGN KEY (usuario_idUsuario) REFERENCES Usuario (idUsuario) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_status_data (status, dataPostagem),
    INDEX idx_usuario (usuario_idUsuario)
);

-- Tabela de Relacionamento Postagem-Categoria
CREATE TABLE Postagem_Categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    postagem_id INT NOT NULL,
    categoria_id INT NOT NULL,
    FOREIGN KEY (postagem_id) REFERENCES Postagem (idPostagem) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES Categorias (idCategoria) ON DELETE CASCADE,
    UNIQUE KEY unique_postagem_categoria (postagem_id, categoria_id),
    INDEX idx_postagem (postagem_id),
    INDEX idx_categoria (categoria_id)
);

-- Dados iniciais
INSERT INTO
    Usuario (nomeCompleto, email, senha, nivelAcesso, status)
VALUES
    (
        'Administrador Master',
        'admin@blog.com',
        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
        'admin',
        'ativo'
    );

INSERT INTO
    Categorias (nome, slug, descricao, status)
VALUES
    (
        'Política',
        'politica',
        'Notícias sobre política nacional e internacional',
        'ativo'
    ),
    (
        'Esportes',
        'esportes',
        'Cobertura completa do mundo esportivo',
        'ativo'
    ),
    (
        'Tecnologia',
        'tecnologia',
        'Inovações e notícias de tecnologia',
        'ativo'
    ),
    (
        'Saúde',
        'saude',
        'Saúde, bem-estar e medicina',
        'ativo'
    ),
    (
        'Economia',
        'economia',
        'Economia, negócios e finanças',
        'ativo'
    )
    -- Adicionar coluna OTP na tabela Usuario
ALTER TABLE Usuario
ADD COLUMN otp VARCHAR(6) NULL;

ALTER TABLE Usuario
ADD COLUMN otp_expires DATETIME NULL;
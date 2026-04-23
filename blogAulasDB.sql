-- DROP DATABASE IF EXISTS BlogNoticias;
CREATE DATABASE BlogNoticias;

USE BlogNoticias;

-- Tabela Usuario (corrigida)
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nomeCompleto VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL, -- Aumentado para hash seguro (bcrypt/argon2)
    nivelAcesso ENUM ('admin', 'editor', 'leitor', 'autor') DEFAULT 'leitor',
    dataCadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultimoAcesso DATETIME,
    avatar VARCHAR(255),
    bio TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    INDEX idx_email (email),
    INDEX idx_nivel_ativo (nivelAcesso, ativo)
);

-- Tabela Categorias (mantida)
CREATE TABLE Categorias (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    slug VARCHAR(45) NOT NULL UNIQUE,
    Descricao VARCHAR(45),
    imagem BLOB,
    status ENUM ('ativo', 'inativo') DEFAULT 'ativo'
);

-- Tabela Postagem (melhorada)
CREATE TABLE Postagem (
    idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    subTitulo VARCHAR(200),
    slug VARCHAR(100) NOT NULL UNIQUE,
    resumo TEXT,
    conteudo LONGTEXT NOT NULL,
    imagem_destaque VARCHAR(255),
    imagem_alt VARCHAR(100),
    dataPostagem DATETIME DEFAULT CURRENT_TIMESTAMP,
    dataAtualizacao DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    destaque BOOLEAN DEFAULT FALSE,
    usuario_idUsuario INT NOT NULL,
    INDEX idx_slug (slug),
    INDEX idx_dataPostagem (dataPostagem),
    INDEX idx_usuario (usuario_idUsuario),
    FOREIGN KEY (usuario_idUsuario) REFERENCES Usuario (idUsuario) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- Tabela N:N — Categorias e Postagem
CREATE TABLE Categorias_has_Postagem (
    Categorias_idCategoria INT NOT NULL,
    Postagem_idPostagem INT NOT NULL,
    PRIMARY KEY (Categorias_idCategoria, Postagem_idPostagem),
    FOREIGN KEY (Categorias_idCategoria) REFERENCES Categorias (idCategoria) ON DELETE CASCADE,
    FOREIGN KEY (Postagem_idPostagem) REFERENCES Postagem (idPostagem) ON DELETE CASCADE
);
create database BlogNoticias;
use BlogNoticias;

-- Tabela Usuario
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nomeCompleto VARCHAR(45) NOT NULL,
    email VARCHAR(45) NOT NULL UNIQUE,
    senha VARCHAR(60) NOT NULL, 
    nivelAcesso ENUM('admin', 'editor', 'Leitor', 'Autor')
);

-- Tabela Categorias
CREATE TABLE Categorias (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(45) NOT NULL,
    slug VARCHAR(45) NOT NULL UNIQUE,
    Descricao VARCHAR(45),
    imagem BLOB,
    status ENUM('ativo', 'inativo') DEFAULT 'ativo'
);

-- Tabela Postagem
CREATE TABLE Postagem (
    idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    subTitulo VARCHAR(160),
    slug VARCHAR(45) NOT NULL UNIQUE,
    Resumo VARCHAR(400),
    img BLOB,
    dataPostagem DATETIME DEFAULT CURRENT_TIMESTAMP,
    Usuario_idUsuario INT NOT NULL,
    FOREIGN KEY (Usuario_idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE
);

-- Tabela de relacionamento N:N entre Categorias e Postagem
CREATE TABLE Categorias_has_Postagem (
    Categorias_idCategoria INT NOT NULL,
    Postagem_idPostagem INT NOT NULL,
    PRIMARY KEY (Categorias_idCategoria, Postagem_idPostagem),
    FOREIGN KEY (Categorias_idCategoria) REFERENCES Categorias(idCategoria) ON DELETE CASCADE,
    FOREIGN KEY (Postagem_idPostagem) REFERENCES Postagem(idPostagem) ON DELETE CASCADE
);
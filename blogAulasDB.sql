-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS BlogNoticias;

USE BlogNoticias;

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    nomeCompleto VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivelAcesso ENUM ('admin', 'editor', 'autor', 'leitor') DEFAULT 'leitor',
    status ENUM ('ativo', 'inativo', 'bloqueado') DEFAULT 'ativo',
    resetPasswordToken VARCHAR(255),
    resetPasswordExpires DATETIME,
    dataCadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ultimoAcesso TIMESTAMP NULL,
    INDEX idx_email (email)
);

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS Categorias (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    Descricao TEXT,
    imagemURL VARCHAR(255),
    status ENUM ('ativo', 'inativo') DEFAULT 'ativo',
    INDEX idx_slug (slug)
);

-- Tabela de Postagens
CREATE TABLE IF NOT EXISTS Postagem (
    idPostagem INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    subTitulo VARCHAR(200),
    slug VARCHAR(200) UNIQUE NOT NULL,
    resumo TEXT,
    conteudo LONGTEXT NOT NULL,
    imagem_destaque VARCHAR(255),
    imagem_alt VARCHAR(200),
    dataPostagem DATETIME NOT NULL,
    dataAtualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    destaque BOOLEAN DEFAULT FALSE,
    status ENUM ('rascunho', 'publicado', 'agendado') DEFAULT 'rascunho',
    visualizacoes INT DEFAULT 0,
    usuario_idUsuario INT NOT NULL,
    FOREIGN KEY (usuario_idUsuario) REFERENCES Usuario (idUsuario) ON DELETE CASCADE,
    INDEX idx_slug (slug),
    INDEX idx_status_data (status, dataPostagem)
);

-- Tabela de Relacionamento Postagem-Categoria
CREATE TABLE IF NOT EXISTS Postagem_Categoria (
    id INT PRIMARY KEY AUTO_INCREMENT,
    postagem_id INT NOT NULL,
    categoria_id INT NOT NULL,
    FOREIGN KEY (postagem_id) REFERENCES Postagem (idPostagem) ON DELETE CASCADE,
    FOREIGN KEY (categoria_id) REFERENCES Categorias (idCategoria) ON DELETE CASCADE,
    UNIQUE KEY unique_postagem_categoria (postagem_id, categoria_id)
);

-- Inserir dados iniciais
INSERT INTO
    Usuario (nomeCompleto, email, senha, nivelAcesso, status)
VALUES
    (
        'Administrador',
        'admin@blog.com',
        '$2a$10$N9qo8uLOickgx2ZMRZoMy.MrCqXrXqXrXqXrXqXrXqXrXqXrXqX',
        'admin',
        'ativo'
    );

INSERT INTO
    Categorias (nome, slug, descricao)
VALUES
    ('Política', 'politica', 'Notícias sobre política'),
    ('Esportes', 'esportes', 'Cobertura esportiva'),
    (
        'Tecnologia',
        'tecnologia',
        'Inovação e tecnologia'
    ),
    ('Saúde', 'saude', 'Saúde e bem-estar'),
    ('Economia', 'economia', 'Economia e negócios');
CREATE DATABASE IF NOT EXISTS PACE;
USE PACE;

CREATE TABLE Instituicao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    endereco VARCHAR(100),
    codigo INT NOT NULL
);
CREATE TABLE Usuario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    cpf VARCHAR(14) NOT NULL UNIQUE, 
    senha VARCHAR(255) NOT NULL,
    status ENUM ('1','2','3') NOT NULL, -- 1: Ativo, 2: Inativo, 3: Banido
    cargo ENUM ('1','2','3','4','5') NOT NULL, -- 1: Administrador, 2: Pedagogo, 3: Profissional da Saúde, 4: Professor, 5: Responsável Legal
    telefone VARCHAR(14) NOT NULL
);
-- alter table Usuario modify column status ENUM ('1','2','3') NOT NULL;
-- alter table Usuario modify column cargo ENUM ('1','2','3','4','5') NOT NULL;

CREATE TABLE Administrador (
    id_usuario INT PRIMARY KEY,
    nivel_permissao ENUM ('0','1') NOT NULL, -- 0: Global, 1: Institucional
    id_instituicao INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id)
);
-- alter table Administrador modify column nivel_permissao ENUM ('0','1') NOT NULL;

CREATE TABLE Pedagogo (
    id_usuario INT PRIMARY KEY,
    cndb VARCHAR(20),
    id_instituicao INT NOT NULL,
    foto MEDIUMBLOB,
    especializacao VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id)
);
CREATE TABLE Profissional_Saude (
    id_usuario INT PRIMARY KEY,
    crm VARCHAR(50),
    crp VARCHAR(50),
    foto MEDIUMBLOB,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);
CREATE TABLE Professor (
    id_usuario INT PRIMARY KEY,
    cndb VARCHAR(20),
    id_instituicao INT NOT NULL,
    foto MEDIUMBLOB,
    materia VARCHAR(50),
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id)
);
CREATE TABLE Responsavel_Legal (
    id_usuario INT PRIMARY KEY,
    data_nasc DATE,
    foto MEDIUMBLOB,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id)
);
CREATE TABLE Turma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL,
    serie INT NOT NULL,
    ano YEAR,
    qntd_alunos INT NOT NULL,
    id_instituicao INT NOT NULL,
    FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id)
);
CREATE TABLE Professor_Turma (
	id_professor INT NOT NULL,
    id_turma INT NOT NULL,
    FOREIGN KEY (id_professor) REFERENCES Professor(id_usuario),
    FOREIGN KEY (id_turma) REFERENCES Turma(id)
);
CREATE TABLE Aluno (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    nome VARCHAR(100) NOT NULL,
    data_nascimento DATE,
    matricula INT,
    id_turma INT NOT NULL,
    id_instituicao INT NOT NULL,
    serie INT NOT NULL,
    foto MEDIUMBLOB,
    status ENUM ('0','1','2') NOT NULL, -- 0: Matriculado, 1: Transferido, 2: Concluinte
    FOREIGN KEY (id_turma) REFERENCES Turma(id),
    FOREIGN KEY (id_instituicao) REFERENCES Instituicao(id)
);
-- alter table Aluno modify column status ENUM ('0','1','2') NOT NULL;

CREATE TABLE Responsavel_Aluno (
	id_aluno INT NOT NULL,
    id_responsavel INT NOT NULL,
    parentesco VARCHAR(10) NOT NULL,
    FOREIGN KEY (id_aluno) REFERENCES Aluno(id),
    FOREIGN KEY (id_responsavel) REFERENCES Responsavel_Legal(id_usuario)
);
CREATE TABLE Relatorio (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    data_emissao DATETIME,
    id_aluno INT NOT NULL,
    id_remetente INT NOT NULL,
    id_recebedor INT NOT NULL,
    conteudo TEXT NOT NULL,
    anexo_arquivo MEDIUMBLOB,
    FOREIGN KEY (id_aluno) REFERENCES Aluno(id),
    FOREIGN KEY (id_remetente) REFERENCES Usuario(id),
    FOREIGN KEY (id_recebedor) REFERENCES Usuario(id)
);
CREATE TABLE Laudo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    data_emissao DATETIME,
    id_aluno INT NOT NULL,
    id_profissional_saude INT NOT NULL,
    anexo_arquivo MEDIUMBLOB,
    FOREIGN KEY (id_aluno) REFERENCES Aluno(id),
    FOREIGN KEY (id_profissional_saude) REFERENCES Profissional_Saude(id_usuario)
);
CREATE TABLE Log_Eventos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_autor INT NOT NULL,
    acao VARCHAR(50) NOT NULL,
    campo_alterado VARCHAR(50) NOT NULL,
    tabela_alterada VARCHAR(50) NOT NULL,
    valor_antigo TEXT,
    valor_novo TEXT,
    data_hora DATETIME NOT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id),
    FOREIGN KEY (id_autor) REFERENCES Usuario(id)
);
CREATE TABLE Avisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(50) NOT NULL,
    data_hora DATETIME NOT NULL,
    conteudo TEXT NOT NULL,
    id_administrador INT NOT NULL,
    FOREIGN KEY (id_administrador) REFERENCES Administrador(id_usuario)
);

-- Login: admin@pace.com
-- Senha: password

INSERT INTO Usuario (nome, email, cpf, senha, status, cargo, telefone) 
VALUES (
    'Administrador Global', 
    'admin@pace.com', 
    '000.000.000-00', 
    '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- Hash para "password"
    '1', 
    '1', 
    '(00)00000-0000'
);

INSERT INTO Administrador (id_usuario, nivel_permissao, id_instituicao)
VALUES (1, '0', NULL);


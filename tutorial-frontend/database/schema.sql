-- =====================================================================
-- schema.sql  —  ESTRUTURA DO BANCO (rode UMA vez, antes de tudo)
-- Como rodar:   mysql -u root -p < database/schema.sql
-- =====================================================================

-- 1) Cria o banco (o "armário" onde ficam as tabelas)
CREATE DATABASE IF NOT EXISTS hospital
  CHARACTER SET utf8mb4          -- aceita acentos e emojis
  COLLATE utf8mb4_unicode_ci;    -- regras de comparação/ordenação de texto

USE hospital;

-- 2) Tabela de pacientes (a "gaveta" principal)
CREATE TABLE IF NOT EXISTS pacientes (
  id              INT AUTO_INCREMENT PRIMARY KEY,   -- o banco gera 1, 2, 3...
  nome            VARCHAR(100) NOT NULL,            -- obrigatório
  cpf             CHAR(11)     NOT NULL UNIQUE,     -- não pode repetir
  data_nascimento DATE         NULL,                -- AAAA-MM-DD
  telefone        VARCHAR(20)  NULL,
  criado_em       TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_pacientes_nome (nome)   -- índice: busca por nome rápida (como o índice de um livro)
) ENGINE = InnoDB;   -- InnoDB = motor que suporta transações e chaves estrangeiras

-- 3) Tabela de consultas, ligada a pacientes por CHAVE ESTRANGEIRA
CREATE TABLE IF NOT EXISTS consultas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  paciente_id INT          NOT NULL,
  medico      VARCHAR(100) NOT NULL,
  data_hora   DATETIME     NOT NULL,
  status      ENUM('agendada','realizada','cancelada') DEFAULT 'agendada',
  CONSTRAINT fk_consulta_paciente
    FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
    ON DELETE CASCADE      -- apagou o paciente? apaga as consultas dele
) ENGINE = InnoDB;

-- -- 4) Usuário da APLICAÇÃO (nunca use root no código!)
-- CREATE USER IF NOT EXISTS 'aluno'@'localhost' IDENTIFIED BY 'senha123';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON hospital.* TO 'aluno'@'localhost';
-- FLUSH PRIVILEGES;

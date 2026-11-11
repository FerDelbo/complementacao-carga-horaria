-- =====================================================================
-- seed.sql  —  DADOS DE EXEMPLO (opcional)
-- Com Docker o container executa este arquivo sozinho na primeira subida,
-- logo depois do schema.sql.
-- (Sem Docker:  mysql -u root -p hospital < database/seed.sql)
-- =====================================================================
USE hospital;

INSERT IGNORE INTO pacientes (nome, cpf, data_nascimento, telefone) VALUES
  ('Ana Souza',      '11122233344', '1990-04-12', '(44) 99901-0001'),
  ('Bruno Lima',     '22233344455', '1985-09-30', '(44) 99901-0002'),
  ('Carla Mendes',   '33344455566', '2001-01-05', NULL);

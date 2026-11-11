/**
 * pacientesRepo.js — AS FUNÇÕES QUE CONVERSAM COM A TABELA
 * ========================================================
 * São as mesmas funções de CRUD da parte 1. Repare que aqui NÃO existe
 * nada de HTTP nem de HTML: este arquivo só sabe SQL.
 * Quem chama estas funções agora é o server.js (antes era o main.js).
 */
const { pool } = require('./db');

// ---------------------------------------------------------------- CREATE
async function inserirPaciente(nome, cpf, dataNascimento = null, telefone = null) {
  const [res] = await pool.execute(
    'INSERT INTO pacientes (nome, cpf, data_nascimento, telefone) VALUES (?, ?, ?, ?)',
    [nome, cpf, dataNascimento, telefone]
  );
  return res.insertId;                     // id gerado pelo AUTO_INCREMENT
}

// ---------------------------------------------------------------- READ
async function listarPacientes() {
  const [rows] = await pool.execute(
    'SELECT id, nome, cpf, data_nascimento, telefone FROM pacientes ORDER BY id'
  );
  return rows;                             // array de objetos
}

// ---------------------------------------------------------------- UPDATE
async function atualizarTelefone(id, telefone) {
  const [res] = await pool.execute(
    'UPDATE pacientes SET telefone = ? WHERE id = ?', [telefone, id]
  );
  return res.affectedRows;                 // 1 = achou, 0 = id não existe
}

// ---------------------------------------------------------------- DELETE
async function excluirPaciente(id) {
  const [res] = await pool.execute('DELETE FROM pacientes WHERE id = ?', [id]);
  return res.affectedRows;
}

module.exports = { inserirPaciente, listarPacientes, atualizarTelefone, excluirPaciente };

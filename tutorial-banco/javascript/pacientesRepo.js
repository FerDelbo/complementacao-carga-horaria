/**
 * pacientesRepo.js — FUNÇÕES QUE CONVERSAM COM AS TABELAS
 * ========================================================
 * Padrão que se repete:
 *   const [resultado] = await pool.execute(SQL, [valores]);
 *
 * - execute() usa PREPARED STATEMENT: o SQL vai para o servidor com "?"
 *   e os valores viajam separados. SQL injection fica impossível.
 * - O retorno é um array [resultado, campos]; quase sempre só
 *   precisamos do primeiro item, por isso a desestruturação [rows].
 * - Em SELECT, "rows" é um array de objetos.
 *   Em INSERT/UPDATE/DELETE, é um objeto com insertId e affectedRows.
 */
const { pool, emTransacao } = require('./db');

// ---------------------------------------------------------------- CREATE
async function inserirPaciente(nome, cpf, dataNascimento = null, telefone = null) {
  try {
    const [res] = await pool.execute(
      'INSERT INTO pacientes (nome, cpf, data_nascimento, telefone) VALUES (?, ?, ?, ?)',
      [nome, cpf, dataNascimento, telefone]
    );
    return res.insertId;                     // id gerado pelo AUTO_INCREMENT
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') throw new Error(`CPF ${cpf} já cadastrado`);
    throw err;
  }
}

// ---------------------------------------------------------------- READ
async function listarPacientes() {
  const [rows] = await pool.execute(
    'SELECT id, nome, cpf, data_nascimento FROM pacientes ORDER BY id'
  );
  return rows;                               // array de objetos
}

async function buscarPorId(id) {
  const [rows] = await pool.execute('SELECT * FROM pacientes WHERE id = ?', [id]);
  return rows[0] ?? null;                    // 1 objeto ou null
}

async function buscarPorNome(trecho) {
  const [rows] = await pool.execute(
    'SELECT id, nome FROM pacientes WHERE nome LIKE ?', [`%${trecho}%`]
  );
  return rows;
}

// ---------------------------------------------------------------- UPDATE
async function atualizarTelefone(id, telefone) {
  const [res] = await pool.execute(
    'UPDATE pacientes SET telefone = ? WHERE id = ?', [telefone, id]
  );
  return res.affectedRows;                   // quantas linhas mudaram
}

// ---------------------------------------------------------------- DELETE
async function excluirPaciente(id) {
  const [res] = await pool.execute('DELETE FROM pacientes WHERE id = ?', [id]);
  return res.affectedRows;
}

// ---------------------------------------------------------------- TRANSAÇÃO
// Paciente + 1ª consulta: OU grava os dois, OU nenhum.
// Atenção: dentro da transação usamos "conn", NÃO "pool" — a transação
// pertence a UMA conexão específica.
async function cadastrarComConsulta(nome, cpf, medico, dataHora) {
  return emTransacao(async (conn) => {
    const [p] = await conn.execute(
      'INSERT INTO pacientes (nome, cpf) VALUES (?, ?)', [nome, cpf]
    );
    await conn.execute(
      'INSERT INTO consultas (paciente_id, medico, data_hora) VALUES (?, ?, ?)',
      [p.insertId, medico, dataHora]
    );
    return p.insertId;
  });
}

async function consultasComPaciente() {
  const [rows] = await pool.execute(`
    SELECT c.id, p.nome AS paciente, c.medico, c.data_hora, c.status
    FROM consultas c
    JOIN pacientes p ON p.id = c.paciente_id
    ORDER BY c.data_hora`);
  return rows;
}

module.exports = {
  inserirPaciente, listarPacientes, buscarPorId, buscarPorNome,
  atualizarTelefone, excluirPaciente, cadastrarComConsulta, consultasComPaciente,
};

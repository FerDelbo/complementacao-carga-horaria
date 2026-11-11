/**
 * db.js — CAMADA DE CONEXÃO (Node.js + MySQL)
 * ===========================================
 * Pipeline: seu código -> driver (mysql2) -> TCP :3306 -> servidor MySQL
 *
 * Diferença principal para o Python: em JS, falar com o banco é
 * ASSÍNCRONO. A query sai pela rede e o Node continua livre; quando a
 * resposta chega, a Promise "resolve". Por isso usamos async/await.
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const mysql = require('mysql2/promise');   // versão com Promises (await)

// 1) POOL DE CONEXÕES ------------------------------------------------------
//    Criado UMA vez quando o arquivo é carregado. Ainda não conecta:
//    as conexões são abertas sob demanda, até o limite.
const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER || 'aluno',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital',
  charset:  'utf8mb4',
  connectionLimit: 5,       // no máximo 5 conexões abertas ao mesmo tempo
  waitForConnections: true, // a 6ª requisição espera na fila
  dateStrings: true,        // datas voltam como texto "2026-11-20 14:30:00"
});

// 2) TRANSAÇÃO COM SEGURANÇA ----------------------------------------------
//    Equivalente ao "with conexao()" do Python.
async function emTransacao(trabalho) {
  const conn = await pool.getConnection();  // empresta uma conexão
  try {
    await conn.beginTransaction();          // START TRANSACTION
    const resultado = await trabalho(conn); // suas queries aqui
    await conn.commit();                    // grava
    return resultado;
  } catch (err) {
    await conn.rollback();                  // desfaz
    throw err;
  } finally {
    conn.release();                         // devolve ao pool (SEMPRE)
  }
}

async function testarConexao() {
  try {
    const [rows] = await pool.query('SELECT VERSION() AS versao, DATABASE() AS banco');
    console.log(`[OK] Conectado ao banco '${rows[0].banco}' (servidor ${rows[0].versao})`);
    return true;
  } catch (err) {
    const msgs = {
      ER_ACCESS_DENIED_ERROR: 'Usuário ou senha errados (confira o .env)',
      ER_BAD_DB_ERROR:        'O banco não existe (rode database/schema.sql)',
      ECONNREFUSED:           'Servidor MySQL não está rodando ou porta errada',
    };
    console.log('[ERRO]', msgs[err.code] || err.message);
    return false;
  }
}

module.exports = { pool, emTransacao, testarConexao };

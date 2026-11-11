/**
 * db.js — CAMADA DE CONEXÃO (igual à da parte 1, só mais enxuta)
 * =============================================================
 * Cria o POOL uma única vez. Quem precisa falar com o banco
 * importa este arquivo e usa pool.execute(...).
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env'), quiet: true });
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  port:     Number(process.env.DB_PORT || 3306),
  user:     process.env.DB_USER || 'aluno',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hospital',
  charset:  'utf8mb4',
  connectionLimit: 5,
  waitForConnections: true,
  dateStrings: true,        // datas voltam como texto "1990-04-12"
});

async function testarConexao() {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS banco');
    console.log(`[OK] Conectado ao banco '${rows[0].banco}'`);
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

module.exports = { pool, testarConexao };

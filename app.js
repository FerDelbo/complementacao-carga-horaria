const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'app',
  password: 'senha123',
  database: 'hs',
});

module.exports = pool;

async function listarAlunos() {
  const [rows] = await pool.query('SELECT nomeAlun FROM Paciente');
  return rows;
}

// const servidor = http.createServer(async (req, res) => {
//   try {
//     if (req.url === '/') {
//       // Entrega a página com o botão
//       const html = fs.readFileSync(path.join(__dirname, 'index.html'));
//       res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//       res.end(html);
//     } else if (req.url === '/alunos') {
//       // Chamado pelo clique do botão
//       const alunos = await listarAlunos();
//       res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
//       res.end(JSON.stringify(alunos));
//     } else {
//       res.writeHead(404);
//       res.end('Não encontrado');
//     }
//   } catch (erro) {
//     console.error(erro);
//     res.writeHead(500);
//     res.end('Erro no servidor');
//   }
// });

// servidor.listen(3000, () => {
//   console.log('Abra http://localhost:3000 no navegador');
// });

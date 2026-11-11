/**
 * server.js — A PONTE ENTRE A PÁGINA E O BANCO (rode: node server.js)
 * ===================================================================
 * O navegador não consegue chamar as funções do pacientesRepo.js: elas
 * vivem aqui, no Node. Então este arquivo fica "escutando" pedidos HTTP
 * e, para cada pedido, chama a função certa e devolve a resposta em JSON.
 *
 *   página (fetch)  ->  ROTA aqui  ->  função do repo  ->  MySQL
 */
const path = require('path');
const express = require('express');
const repo = require('./pacientesRepo');
const { testarConexao } = require('./db');

const app = express();

app.use(express.json());   // lê o JSON que a página envia e coloca em req.body
app.use(express.static(path.join(__dirname, '..', 'frontend')));   // entrega index.html, script.js, style.css

// ---------------------------------------------------------------- READ
// A página pede a lista -> devolvemos o array de pacientes em JSON.
app.get('/api/pacientes', async (req, res) => {
  const pacientes = await repo.listarPacientes();
  res.json(pacientes);
});

// ---------------------------------------------------------------- CREATE
// Os dados do formulário chegam em req.body.
app.post('/api/pacientes', async (req, res) => {
  const { nome, cpf, data_nascimento, telefone } = req.body ?? {};

  // Nunca confie só na validação da página: confira de novo aqui.
  if (!nome || !/^\d{11}$/.test(cpf ?? '')) {
    return res.status(400).json({ erro: 'Informe o nome e um CPF com 11 números' });
  }

  const id = await repo.inserirPaciente(nome, cpf, data_nascimento || null, telefone || null);
  res.status(201).json({ id });            // 201 = criado
});

// ---------------------------------------------------------------- UPDATE
// O id vem na URL (req.params) e o novo telefone vem no corpo (req.body).
app.put('/api/pacientes/:id', async (req, res) => {
  const { telefone } = req.body ?? {};
  const alterados = await repo.atualizarTelefone(req.params.id, telefone || null);

  if (alterados === 0) return res.status(404).json({ erro: 'Paciente não encontrado' });
  res.json({ mensagem: 'Telefone atualizado' });
});

// ---------------------------------------------------------------- DELETE
app.delete('/api/pacientes/:id', async (req, res) => {
  const removidos = await repo.excluirPaciente(req.params.id);

  if (removidos === 0) return res.status(404).json({ erro: 'Paciente não encontrado' });
  res.json({ mensagem: 'Paciente excluído' });
});

// ---------------------------------------------------------------- ERROS
// Qualquer erro lançado nas rotas acima cai aqui.
app.use((err, req, res, next) => {
  if (err.code === 'ER_DUP_ENTRY') {       // o UNIQUE do banco barrou
    return res.status(409).json({ erro: 'Este CPF já está cadastrado' });
  }
  if (err.type === 'entity.parse.failed') {   // o corpo não era um JSON válido
    return res.status(400).json({ erro: 'JSON inválido' });
  }
  console.error(err);                      // o detalhe fica só no terminal
  res.status(500).json({ erro: 'Erro no servidor' });
});

const PORTA = 3000;
app.listen(PORTA, async () => {
  console.log(`Servidor no ar: abra http://localhost:${PORTA}`);
  await testarConexao();
});

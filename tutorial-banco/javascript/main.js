/**
 * main.js — ROTEIRO PRÁTICO (rode: node main.js)
 */
const repo = require('./pacientesRepo');
const { pool, testarConexao } = require('./db');

const titulo = (t) => console.log(`\n=== ${t} ===`);

async function main() {
  if (!(await testarConexao())) process.exit(1);

  titulo('1. INSERT');
  const novoId = await repo.inserirPaciente('Diego Rocha', '44455566677', '1995-07-20', '(44) 99901-0004');
  console.log('Paciente criado com id =', novoId);

  titulo('2. INSERT repetido (CPF UNIQUE)');
  try {
    await repo.inserirPaciente('Diego Clone', '44455566677');
  } catch (e) {
    console.log('Banco recusou:', e.message);
  }

  titulo('3. SELECT (todos)');
  console.table(await repo.listarPacientes());

  titulo('4. SELECT com LIKE');
  console.log(await repo.buscarPorNome('Diego'));

  titulo('5. UPDATE');
  console.log('Linhas alteradas:', await repo.atualizarTelefone(novoId, '(44) 98888-7777'));
  console.log(await repo.buscarPorId(novoId));

  titulo('6. TRANSAÇÃO que dá certo');
  const pid = await repo.cadastrarComConsulta('Elisa Prado', '55566677788', 'Dra. Marta', '2026-11-20 14:30:00');
  console.log('Paciente + consulta gravados, id =', pid);

  titulo('7. TRANSAÇÃO que falha (CPF repetido -> ROLLBACK)');
  try {
    await repo.cadastrarComConsulta('Elisa Clone', '55566677788', 'Dr. João', '2026-11-21 09:00:00');
  } catch (e) {
    console.log('Falhou e nada foi gravado:', e.code);
  }

  titulo('8. JOIN consultas + pacientes');
  console.table(await repo.consultasComPaciente());

  titulo('9. DELETE (limpando o que o roteiro criou)');
  const removidos = (await repo.excluirPaciente(novoId)) + (await repo.excluirPaciente(pid));
  console.log('Removidos:', removidos);
}

main()
  .catch((err) => console.error('Erro inesperado:', err))
  .finally(() => pool.end());   // fecha o pool, senão o Node não termina

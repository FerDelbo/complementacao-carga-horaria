/**
 * script.js — O LADO DO NAVEGADOR
 * ================================
 * Este arquivo roda no navegador, não no Node. Ele NÃO enxerga o banco
 * nem as funções do pacientesRepo.js. Tudo o que ele sabe fazer é mandar
 * pedidos HTTP para o servidor (fetch) e mostrar a resposta na tela.
 */
const API = '/api/pacientes';

const corpoTabela = document.getElementById('corpoTabela');
const mensagem = document.getElementById('mensagem');
const form = document.getElementById('formPaciente');

// Manda um pedido ao servidor e devolve a resposta já convertida de JSON.
async function pedir(metodo, url, dados) {
  const resposta = await fetch(url, {
    method: metodo,
    headers: { 'Content-Type': 'application/json' },
    body: dados ? JSON.stringify(dados) : undefined,   // objeto -> texto JSON
  });
  const corpo = await resposta.json();                 // texto JSON -> objeto

  // fetch só lança erro se a rede falhar. Status 400, 404, 409, 500...
  // chegam como resposta normal, então conferimos aqui.
  if (!resposta.ok) throw new Error(corpo.erro);
  return corpo;
}

function avisar(texto, erro = false) {
  mensagem.textContent = texto;
  mensagem.className = erro ? 'erro' : 'ok';
}

// ---------------------------------------------------------------- READ
async function carregarPacientes() {
  const pacientes = await pedir('GET', API);

  corpoTabela.innerHTML = '';
  for (const p of pacientes) {
    const linha = corpoTabela.insertRow();
    // textContent (e não innerHTML): o que veio do banco entra como TEXTO
    linha.insertCell().textContent = p.id;
    linha.insertCell().textContent = p.nome;
    linha.insertCell().textContent = p.cpf;
    linha.insertCell().textContent = formatarData(p.data_nascimento);
    linha.insertCell().textContent = p.telefone ?? '—';

    const acoes = linha.insertCell();
    acoes.append(
      criarBotao('Editar telefone', () => editarTelefone(p)),
      criarBotao('Excluir', () => excluir(p))
    );
  }
}

// ---------------------------------------------------------------- CREATE
form.addEventListener('submit', async (evento) => {
  evento.preventDefault();   // impede o navegador de recarregar a página

  // Pega os campos do formulário: { nome: '...', cpf: '...', ... }
  const dados = Object.fromEntries(new FormData(form));

  try {
    const { id } = await pedir('POST', API, dados);
    avisar(`Paciente cadastrado com id ${id}`);
    form.reset();
    await carregarPacientes();   // busca a lista de novo para mostrar o novo paciente
  } catch (err) {
    avisar(err.message, true);
  }
});

// ---------------------------------------------------------------- UPDATE
async function editarTelefone(paciente) {
  const telefone = prompt(`Novo telefone de ${paciente.nome}:`, paciente.telefone ?? '');
  if (telefone === null) return;   // clicou em Cancelar

  try {
    await pedir('PUT', `${API}/${paciente.id}`, { telefone });
    avisar('Telefone atualizado');
    await carregarPacientes();
  } catch (err) {
    avisar(err.message, true);
  }
}

// ---------------------------------------------------------------- DELETE
async function excluir(paciente) {
  if (!confirm(`Excluir ${paciente.nome}?`)) return;

  try {
    await pedir('DELETE', `${API}/${paciente.id}`);
    avisar('Paciente excluído');
    await carregarPacientes();
  } catch (err) {
    avisar(err.message, true);
  }
}

// ---------------------------------------------------------------- AJUDANTES
function criarBotao(texto, aoClicar) {
  const botao = document.createElement('button');
  botao.type = 'button';
  botao.textContent = texto;
  botao.addEventListener('click', aoClicar);
  return botao;
}

function formatarData(texto) {     // "1990-04-12" -> "12/04/1990"
  if (!texto) return '—';
  const [ano, mes, dia] = texto.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Assim que a página abre, já busca a lista no servidor.
carregarPacientes().catch(() => avisar('Não foi possível falar com o servidor', true));

# Complementação de carga horaria: Projeto integrador
Material de duas aulas sobre como uma aplicação conversa com um banco de dados
MySQL. O exemplo é o mesmo nas duas: um banco `hospital` com cadastro de pacientes.

| Aula | Pasta | O que você aprende |
|---|---|---|
| 1 | [`tutorial-banco/`](tutorial-banco/) | Conectar o **backend** ao banco, em Python e em Node.js |
| 2 | [`tutorial-frontend/`](tutorial-frontend/) | Conectar uma **página HTML** ao banco, passando por um servidor Node |

Cada pasta é independente: tem o próprio `README.md` com o passo a passo completo,
os slides da aula e a tabela de erros comuns. Este arquivo é só o mapa.

## Aula 1 — Conectando o banco ao backend

Pasta: [`tutorial-banco/`](tutorial-banco/) · Slides: `tutorial-banco/slides_conexao_banco.html`

A mesma camada de dados escrita duas vezes, em **Python** e em **JavaScript**,
para você comparar lado a lado.

- Criar o banco, as tabelas e o usuário da aplicação (`database/schema.sql`)
- Abrir conexão e usar *pool* de conexões (`db.py` / `db.js`)
- CRUD completo, transação com commit/rollback e consulta com JOIN
  (`pacientes_repo.py` / `pacientesRepo.js`)
- Guardar credenciais no `.env`, fora do código
- **SQL Injection**: por que acontece e como consultas parametrizadas evitam
  (`python/demo_sql_injection.py`)

Precisa de: MySQL 8 (ou MariaDB) instalado, Python 3 e/ou Node.

## Aula 2 — Conectando o frontend ao banco

Pasta: [`tutorial-frontend/`](tutorial-frontend/) · Slides: `tutorial-frontend/slides_frontend_backend.html`

Continuação da aula 1. O CRUD é o mesmo, mas agora quem o aciona é uma página:
cada botão faz um pedido HTTP ao servidor, que executa o SQL e devolve JSON.

```
página (fetch)  →  rota no server.js  →  função do pacientesRepo.js  →  MySQL (Docker)
```

- Por que o navegador não fala direto com o banco
- Servidor com Express e rotas `GET`, `POST`, `PUT` e `DELETE` (`backend/server.js`)
- `fetch` no navegador e atualização da tabela na tela (`frontend/script.js`)
- Códigos de status HTTP (`200`, `201`, `400`, `404`, `409`, `500`)
- Subir o MySQL num container com Docker Compose, sem instalar nada na máquina

Precisa de: Docker com o plugin Compose e Node 18+.

## Como começar

```bash
git clone https://github.com/FerDelbo/complementacao-carga-horaria
cd complementacao-carga-horaria
```

Depois entre na pasta da aula e siga o `README.md` de lá:

```bash
cd tutorial-banco        # aula 1
cd tutorial-frontend     # aula 2
```

Nas duas aulas o primeiro passo é o mesmo: copiar o modelo de credenciais.

```bash
cp .env.exemplo .env
```

Para ver os slides, abra o arquivo `.html` da aula no navegador.

## Atenção às portas

As duas aulas usam bancos separados, e cada uma numa porta:

| Aula | Onde o MySQL roda | Porta |
|---|---|---|
| 1 | instalado na sua máquina | `3306` |
| 2 | container Docker | `3307` |

Por isso dá para ter as duas funcionando ao mesmo tempo. Se der erro de conexão,
confira primeiro o `DB_PORT` no `.env` da aula que você está rodando.

## O que não vai para o Git

O `.gitignore` deixa de fora o que não deve ser versionado:

- `.env` — tem usuário e senha. Só o `.env.exemplo` é versionado.
- `node_modules/` e `.venv/` — são recriados com `npm install` e `pip install`.

Se você fizer um fork para entregar exercícios, mantenha essa regra: senha em
repositório público é o erro mais comum (e mais caro) de quem está começando.

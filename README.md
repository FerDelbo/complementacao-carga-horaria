# Complementação de carga horaria: Projeto integrador
Material de duas aulas sobre como uma aplicação conversa com um banco de dados
MySQL. O exemplo é o mesmo nas duas: um banco `hospital` com cadastro de pacientes.

| Aula | Pasta | O que você aprende |
|---|---|---|
| 1 | [`tutorial-banco/`](tutorial-banco/) | Conectar o **backend** ao banco, em Python e em Node.js |
| 2 | [`tutorial-frontend/`](tutorial-frontend/) | Conectar uma **página HTML** ao banco, passando por um servidor Node |

Cada pasta é independente: tem o próprio `README.md` com o passo a passo completo,
os exercícios, os slides da aula e a tabela de erros comuns. Este arquivo é só o mapa.

Nas duas aulas o MySQL roda num **container Docker**: você não precisa instalar o
MySQL na máquina.

## Aula 1 — Conectando o banco ao backend

Pasta: [`tutorial-banco/`](tutorial-banco/) · Slides: `tutorial-banco/slides_conexao_banco.html`

A mesma camada de dados escrita duas vezes, em **Python** e em **JavaScript**,
para você comparar lado a lado.

- Subir o MySQL num container com Docker Compose
- Criar o banco e as tabelas (`database/schema.sql`)
- Abrir conexão e usar *pool* de conexões (`db.py` / `db.js`)
- CRUD completo, transação com commit/rollback e consulta com JOIN
  (`pacientes_repo.py` / `pacientesRepo.js`)
- Guardar credenciais no `.env`, fora do código
- **SQL Injection**: por que acontece e como consultas parametrizadas evitam
  (`python/demo_sql_injection.py`)

Precisa de: Docker com o plugin Compose, Python 3.10+ e/ou Node 18+.

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
- Um segundo banco em Docker, separado do da aula 1

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

Nas duas aulas o começo é o mesmo: copiar o modelo de credenciais e subir o banco.

```bash
cp .env.exemplo .env          # Windows (cmd): copy .env.exemplo .env
docker compose up -d
docker compose ps             # espere aparecer (healthy)
```

Na primeira vez o Docker baixa a imagem `mysql:8.0`, o que pode demorar alguns
minutos. Daí em diante cada aula segue o próprio roteiro:

| Aula | Depois do banco no ar | Você sabe que deu certo quando... |
|---|---|---|
| 1 | `python main.py` e `node main.js` | o terminal mostra `[OK] Conectado ao banco 'hospital'` e os 9 blocos do roteiro |
| 2 | `node server.js` e abrir http://localhost:3000 | a página lista os pacientes e você consegue cadastrar, editar e excluir |

Ao terminar, `docker compose down` na pasta da aula para parar o banco (os dados
ficam guardados).

Para ver os slides, abra o arquivo `.html` da aula no navegador.

## Atenção às portas

As duas aulas usam bancos separados (um container cada), e cada um numa porta:

| Aula | Container | Porta no seu computador |
|---|---|---|
| 1 | `hospital-mysql-aula1` | `3308` |
| 2 | `hospital-mysql` | `3307` |

Dentro de cada container o MySQL escuta na porta padrão, `3306` — é a porta que
aparece nos slides. A `3306` do seu computador fica livre, então um MySQL já
instalado na máquina não atrapalha.

Dá para ter as duas aulas funcionando ao mesmo tempo. Se der erro de conexão,
confira primeiro o `DB_PORT` no `.env` da aula que você está rodando, e lembre que
os comandos `docker compose` valem para a pasta onde você está.

## O que não vai para o Git

O `.gitignore` deixa de fora o que não deve ser versionado:

- `.env` — tem usuário e senha. Só o `.env.exemplo` é versionado.
- `node_modules/` e `.venv/` — são recriados com `npm install` e `pip install`.

Se você fizer um fork para entregar exercícios, mantenha essa regra: senha em
repositório público é o erro mais comum (e mais caro) de quem está começando.

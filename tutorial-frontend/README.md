# Aula 2 — Conectando o frontend ao banco de dados (HTML + Node + MySQL)

Continuação do `tutorial-banco`. Lá o CRUD era chamado por um roteiro (`main.js`).
Aqui quem chama é uma **página HTML**: cada botão faz um pedido HTTP ao servidor
Node, que executa a função de CRUD e devolve o resultado em JSON.

```
página (fetch)  →  rota no server.js  →  função do pacientesRepo.js  →  MySQL (Docker)
```

Slides da aula: abra `slides_frontend_backend.html` no navegador.

## O que você vai fazer nesta aula

1. Subir o MySQL desta aula num container Docker (passos 1 a 3).
2. Subir o servidor Node e abrir a página (passos 4 e 5).
3. Cadastrar, editar e excluir pacientes olhando a aba **Rede** do navegador, para
   ver cada pedido HTTP passar (passo 6).
4. Seguir um clique do começo ao fim no código: `frontend/script.js` →
   `backend/server.js` → `backend/pacientesRepo.js`.
5. Fazer os [exercícios](#exercícios).

## O que tem na pasta

```
tutorial-frontend/
├── .env.exemplo             ← credenciais (copie para .env)
├── docker-compose.yml       ← sobe o MySQL num container
├── slides_frontend_backend.html
├── database/
│   ├── schema.sql           ← igual à parte 1 (o container roda sozinho)
│   └── seed.sql             ← igual à parte 1 (o container roda sozinho)
├── backend/                 ← roda no NODE
│   ├── package.json
│   ├── db.js                ← conexão + pool
│   ├── pacientesRepo.js     ← CRUD (o SQL de cada operação)
│   └── server.js            ← rotas HTTP que chamam o repo
└── frontend/                ← roda no NAVEGADOR
    ├── index.html           ← formulário + tabela
    ├── script.js            ← fetch para cada operação
    └── style.css
```

## O que você precisa ter instalado

- **Docker** com o plugin Compose (`docker compose version` deve responder)
- **Node 18+** (`node -v`)

Você **não** precisa ter o MySQL instalado na máquina: o banco roda dentro de um
container Docker. Se já tiver um MySQL local, não tem problema — o container usa a
porta **3307**, e o local continua na 3306.

O banco desta aula é **separado** do da aula 1 (outro container, outra porta: lá
era a 3308). Você não precisa ter a aula 1 rodando, e o que cadastrou lá não
aparece aqui.

## Passo a passo

Todos os comandos partem da pasta `tutorial-frontend`.

1. **Credenciais**: copie o arquivo de exemplo. Os valores padrão já funcionam.
   ```bash
   cp .env.exemplo .env          # Windows (cmd): copy .env.exemplo .env
   ```
   O mesmo `.env` é lido pelo Docker (para criar o banco) e pelo backend (para
   conectar), então usuário, senha e porta sempre batem.

2. **Subir o banco**
   ```bash
   docker compose up -d
   ```
   Na primeira vez o Docker baixa a imagem `mysql:8.0` (pode demorar alguns
   minutos) e o MySQL roda sozinho o `database/schema.sql` e o `database/seed.sql`:
   o banco `hospital` nasce com as tabelas e três pacientes de exemplo.

3. **Conferir se o banco está pronto**
   ```bash
   docker compose ps
   ```
   Espere a coluna STATUS mostrar `(healthy)` — leva uns 20 a 40 segundos na
   primeira subida. Enquanto estiver `(health: starting)`, o banco ainda não aceita
   conexões.

4. **Subir o servidor**
   ```bash
   cd backend
   npm install
   node server.js
   ```
   Deve aparecer:
   ```
   Servidor no ar: abra http://localhost:3000
   [OK] Conectado ao banco 'hospital'
   ```

5. **Abrir a página**: http://localhost:3000 (não abra o `index.html` com dois cliques).

6. Aperte **F12 → aba Rede** (Network) e use a página: cada clique aparece como um
   pedido HTTP. Para cada um, repare no **método**, na **URL**, no **status** e na
   aba **Resposta**. Experimente cadastrar duas vezes o mesmo CPF e veja o `409`.

7. **Conferir no banco** que o que apareceu na tela foi gravado de verdade
   (em outro terminal, na pasta `tutorial-frontend`):
   ```bash
   docker compose exec mysql mysql -ualuno -psenha123 hospital -e "SELECT * FROM pacientes"
   ```

Para parar o servidor: `Ctrl+C` no terminal. Para parar o banco: `docker compose down`
(os dados ficam guardados e voltam no próximo `docker compose up -d`).

## Comandos do banco (Docker)

| Quero... | Comando |
|---|---|
| Subir o banco | `docker compose up -d` |
| Ver se está no ar | `docker compose ps` |
| Ver o log do MySQL | `docker compose logs -f mysql` |
| Abrir o terminal SQL | `docker compose exec mysql mysql -ualuno -psenha123 hospital` |
| "Desligar o MySQL" (para os exercícios) | `docker compose stop` — e `docker compose start` para religar |
| Parar (mantém os dados) | `docker compose down` |
| **Zerar tudo** e recriar do zero | `docker compose down -v` e depois `docker compose up -d` |

O `schema.sql` e o `seed.sql` só rodam quando o banco é criado pela **primeira
vez**. Se você mudar esses arquivos (ou a senha no `.env`), precisa zerar com
`docker compose down -v` para a mudança valer — isso apaga os dados cadastrados.

Para conectar por um programa como DBeaver ou MySQL Workbench: host `127.0.0.1`,
porta `3307`, usuário `aluno`, senha `senha123`, banco `hospital`.

## As rotas (a API)

| Na tela | Pedido HTTP | Função do repo | Resposta |
|---|---|---|---|
| Abrir a página | `GET /api/pacientes` | `listarPacientes()` | `200` + array |
| Cadastrar | `POST /api/pacientes` | `inserirPaciente()` | `201` + `{ id }` |
| Editar telefone | `PUT /api/pacientes/:id` | `atualizarTelefone()` | `200` ou `404` |
| Excluir | `DELETE /api/pacientes/:id` | `excluirPaciente()` | `200` ou `404` |

Erros voltam como `{ "erro": "mensagem" }` com status `400` (dados inválidos),
`404` (id não existe), `409` (CPF repetido) ou `500` (falha no servidor).

Dá para testar as rotas sem a página, pelo terminal:

```bash
curl localhost:3000/api/pacientes
curl -X POST -H "Content-Type: application/json" \
     -d '{"nome":"Diego Rocha","cpf":"44455566677"}' localhost:3000/api/pacientes
```

## Exercícios

1. **Busca por nome** — crie a rota `GET /api/pacientes/busca?nome=ana` usando o
   `buscarPorNome` da aula 1 (`req.query.nome`) e um campo de busca na página.
2. **Editar o nome** — hoje só o telefone muda. Faça o `PUT` aceitar também o
   nome: nova função no repo, rota e tela.
3. **Quebre de propósito** — desligue o banco (`docker compose stop`) com o
   servidor no ar e clique em Cadastrar. Que status aparece na aba Rede? O que a
   página mostra? Depois religue com `docker compose start`.
4. **Valide o id** — peça `DELETE /api/pacientes/abc`. Que status volta? Faça a
   rota responder `400` quando o id não for um número.
5. **Tire o `resposta.ok`** — comente o `if (!resposta.ok)` no `script.js` e
   cadastre um CPF repetido. O que a página diz? Por quê?
6. **Consultas** — crie `GET /api/consultas` com o JOIN da aula 1 e mostre o
   resultado em uma segunda tabela.

Lembre: mudou algo em `backend/`, reinicie o servidor (`Ctrl+C` e `node server.js`).
Mudou algo em `frontend/`, basta recarregar a página (`Ctrl+Shift+R` ignora o cache).

## Erros comuns

| Sintoma | Causa | Solução |
|---|---|---|
| `permission denied ... docker.sock` | seu usuário não está no grupo `docker` | `sudo usermod -aG docker $USER`, sair da sessão e entrar de novo (ou usar `sudo docker compose ...`) |
| `port is already allocated` ao subir o banco | a porta 3307 já está em uso | trocar `DB_PORT` no `.env` e rodar `docker compose up -d` de novo |
| `[ERRO] Servidor MySQL não está rodando ou porta errada` | container parado, ainda iniciando, ou `.env` não existe (o backend cai na porta 3306) | `docker compose ps` até aparecer `(healthy)`; conferir se o `.env` existe e tem `DB_PORT=3307` |
| `[ERRO] Usuário ou senha errados` no terminal | o `.env` mudou depois que o banco já tinha sido criado | voltar a senha antiga, ou zerar com `docker compose down -v` e subir de novo |
| `[ERRO] O banco não existe` | `DB_NAME` do `.env` diferente do banco criado | conferir o `.env`; se preciso, zerar com `docker compose down -v` |
| Tabela vazia / tabelas não existem | os `.sql` não rodaram (o volume já existia) | `docker compose down -v` e `docker compose up -d` |
| Página mostra "Não foi possível falar com o servidor" | abriu o arquivo direto (`file://`) ou o servidor está parado | rodar `node server.js` e abrir `http://localhost:3000` |
| `EADDRINUSE ... 3000` | já existe um servidor na porta 3000 | fechar o outro terminal ou mudar `PORTA` no `server.js` |
| `Cannot find module 'express'` | faltou instalar | `npm install` dentro de `backend/` |
| Mudou o `server.js` e nada aconteceu | o Node não recarrega sozinho | `Ctrl+C` e `node server.js` de novo |
| "Erro no servidor" na página | exceção numa rota | ler o erro completo no terminal do servidor |

Testado com MySQL 8.0 (imagem Docker `mysql:8.0`), Node 18 (express 5, mysql2 3) e Chrome.

# Aula 1 — Conectando o banco de dados ao backend (Python e JavaScript)

Um banco MySQL chamado `hospital` e a mesma camada de dados escrita duas vezes:
uma em **Python** e outra em **Node.js**, para você comparar lado a lado.

```
seu código (main)  →  repo (o SQL)  →  db (a conexão)  →  MySQL (Docker)
```

Slides da aula: abra `slides_conexao_banco.html` no navegador.

## O que você vai fazer nesta aula

1. Subir um MySQL num container Docker (passos 1 a 3).
2. Rodar o roteiro pronto em Python e em JavaScript e **ler a saída** junto com o
   código (passos 4 e 5).
3. Rodar a demonstração de SQL Injection (passo 6).
4. Conferir direto no banco o que o código gravou (passo 7).
5. Fazer os [exercícios](#exercícios).

## O que tem na pasta

```
tutorial-banco/
├── .env.exemplo            ← credenciais (copie para .env)
├── docker-compose.yml      ← sobe o MySQL num container
├── slides_conexao_banco.html
├── database/
│   ├── schema.sql          ← cria banco, tabelas e índice (o container roda sozinho)
│   └── seed.sql            ← 3 pacientes de exemplo (o container roda sozinho)
├── python/
│   ├── requirements.txt
│   ├── db.py               ← conexão + pool + commit/rollback
│   ├── pacientes_repo.py   ← CRUD, transação e JOIN
│   ├── main.py             ← roteiro que executa tudo
│   └── demo_sql_injection.py
└── javascript/
    ├── package.json
    ├── db.js               ← conexão + pool + transação
    ├── pacientesRepo.js    ← CRUD, transação e JOIN
    └── main.js             ← roteiro que executa tudo
```

Ordem sugerida de leitura: `schema.sql` → `db` → `repo` → `main`.

## O que você precisa ter instalado

- **Docker** com o plugin Compose (`docker compose version` deve responder)
- **Python 3.10+** (`python3 --version`) e/ou **Node 18+** (`node -v`)

Você **não** precisa instalar o MySQL: o banco roda dentro de um container. Se a
máquina já tiver um MySQL instalado, não tem problema — o container desta aula usa
a porta **3308**, e o MySQL local continua na 3306.

## Passo a passo

Os passos 1 a 3 partem da pasta `tutorial-banco`.

1. **Credenciais**: copie o arquivo de exemplo. Os valores padrão já funcionam.
   ```bash
   cp .env.exemplo .env          # Windows (cmd): copy .env.exemplo .env
   ```
   O mesmo `.env` é lido pelo Docker (para criar o banco) e pelo código (para
   conectar), então usuário, senha e porta sempre batem.

2. **Subir o banco**
   ```bash
   docker compose up -d
   ```
   Na primeira vez o Docker baixa a imagem `mysql:8.0` (pode demorar alguns
   minutos) e o MySQL roda sozinho o `database/schema.sql` e o `database/seed.sql`:
   o banco `hospital` nasce com as tabelas e três pacientes de exemplo. Você não
   precisa rodar nenhum `.sql` na mão.

3. **Conferir se o banco está pronto**
   ```bash
   docker compose ps
   ```
   Espere a coluna STATUS mostrar `(healthy)` — leva uns 20 a 40 segundos na
   primeira subida. Enquanto estiver `(health: starting)`, o banco ainda não aceita
   conexões.

4. **Python** (a partir de `tutorial-banco`)
   ```bash
   cd python
   python3 -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   ```
   A saída deve começar assim (os ids podem ser outros):
   ```
   [OK] Conectado ao banco 'hospital' (servidor 8.0.x)

   === 1. INSERT ===
   Paciente criado com id = 4

   === 2. INSERT repetido (CPF UNIQUE) ===
   Banco recusou: CPF 44455566677 já cadastrado
   ```
   e terminar com `Removidos: 2`. O roteiro apaga o que ele mesmo criou, então dá
   para rodar quantas vezes quiser.

5. **JavaScript** (a partir de `tutorial-banco`; se você está em `python/`, volte com `cd ..`)
   ```bash
   cd javascript
   npm install
   node main.js
   ```
   A saída é a mesma do Python, com as listas em formato de tabela.

6. **SQL Injection** (na pasta `python`, com a venv ativa)
   ```bash
   python demo_sql_injection.py
   ```
   Compare os dois resultados: com o SQL concatenado a tabela inteira vaza; com
   `%s` volta uma lista vazia. O script só faz `SELECT`, não estraga nada.

7. **Conferir no banco**: abra o terminal SQL dentro do container (a partir de `tutorial-banco`)
   ```bash
   docker compose exec mysql mysql -ualuno -psenha123 hospital
   ```
   ```sql
   SELECT * FROM pacientes;
   SELECT * FROM consultas;
   exit
   ```
   Repare que a "Elisa Clone" (passo 7 do roteiro) **não** está lá: o rollback
   desfez a transação.

Quando terminar a aula: `docker compose down` (os dados ficam guardados e voltam
no próximo `docker compose up -d`).

## O que observar em cada parte do roteiro

| Parte do `main` | O que ela mostra | Onde está no código |
|---|---|---|
| 1. INSERT | o banco gera o id (`AUTO_INCREMENT`) | `inserir_paciente` / `inserirPaciente` |
| 2. INSERT repetido | o `UNIQUE` do CPF barra, e o código trata o erro pelo **código**, não pela mensagem | idem (bloco `except` / `catch`) |
| 3 e 4. SELECT | linhas viram dicionários/objetos; o `%` do `LIKE` vai no valor | `listar_pacientes`, `buscar_por_nome` |
| 5. UPDATE | `rowcount` / `affectedRows` diz quantas linhas mudaram | `atualizar_telefone` |
| 6 e 7. TRANSAÇÃO | dois `INSERT` que gravam juntos ou não gravam (commit/rollback) | `cadastrar_com_consulta` + `db` |
| 8. JOIN | junta `consultas` e `pacientes` pela chave estrangeira | `consultas_com_paciente` |
| 9. DELETE | o `ON DELETE CASCADE` apaga as consultas do paciente | `excluir_paciente` + `schema.sql` |

## Comandos do banco (Docker)

Todos rodam na pasta `tutorial-banco`.

| Quero... | Comando |
|---|---|
| Subir o banco | `docker compose up -d` |
| Ver se está no ar | `docker compose ps` |
| Ver o log do MySQL | `docker compose logs -f mysql` |
| Abrir o terminal SQL | `docker compose exec mysql mysql -ualuno -psenha123 hospital` |
| Abrir o terminal SQL como root | `docker compose exec mysql mysql -uroot -proot123` |
| "Desligar o MySQL" (para os exercícios) | `docker compose stop` — e `docker compose start` para religar |
| Parar (mantém os dados) | `docker compose down` |
| **Zerar tudo** e recriar do zero | `docker compose down -v` e depois `docker compose up -d` |

O `schema.sql` e o `seed.sql` só rodam quando o banco é criado pela **primeira
vez**. Se você mudar esses arquivos (ou a senha no `.env`), precisa zerar com
`docker compose down -v` para a mudança valer — isso apaga os dados cadastrados.

Para conectar por um programa como DBeaver ou MySQL Workbench: host `127.0.0.1`,
porta `3308`, usuário `aluno`, senha `senha123`, banco `hospital`.

### Diferenças entre os slides e o Docker

Os slides foram escritos pensando num MySQL instalado na máquina. Com Docker,
três coisas mudam:

- **Porta**: os slides falam em `3306`. Essa é a porta **dentro** do container; do
  lado de fora (no seu `.env`) é a `3308`. O `docker-compose.yml` faz a ponte.
- **Rodar os `.sql`**: nos slides aparece `mysql -u root -p < database/schema.sql`.
  Aqui o container faz isso sozinho na primeira subida.
- **Usuário `aluno`**: nos slides ele é criado com `CREATE USER` no fim do
  `schema.sql`, só com `SELECT, INSERT, UPDATE, DELETE`. Aqui quem cria é o Docker
  (variáveis `MYSQL_USER`/`MYSQL_PASSWORD`), e ele recebe todas as permissões
  **dentro do banco `hospital`**. A ideia continua valendo: o código nunca usa o `root`.

## Exercícios

Faça em Python **ou** em JavaScript (ou nos dois). Crie as funções novas no
arquivo do repo e chame-as no `main` para testar.

1. **Nova função** — crie `cancelar_consulta(id)`, que faz
   `UPDATE consultas SET status='cancelada'` e devolve se encontrou a consulta.
2. **Contagem** — crie uma função que devolve quantas consultas cada paciente tem
   (`GROUP BY` + `COUNT` + `LEFT JOIN`).
3. **Quebre de propósito** — troque a senha no `.env`; desligue o banco
   (`docker compose stop`); escreva um SQL errado. Anote o código de cada erro.
   Depois desfaça: senha de volta e `docker compose start`.
4. **Prove a FK** — tente inserir uma consulta com `paciente_id = 999`. Qual erro
   volta? Trate-o.
5. **Prove o rollback** — na transação, troque o segundo `INSERT` por um SQL
   errado. Confira no terminal SQL que o paciente não foi gravado.
6. **Prove o pool** — no JS, comente o `conn.release()` e chame a transação 6
   vezes. O que acontece na 6ª?

## Erros comuns

| Mensagem | Causa | Solução |
|---|---|---|
| `permission denied ... docker.sock` | seu usuário não está no grupo `docker` | `sudo usermod -aG docker $USER`, sair da sessão e entrar de novo (ou usar `sudo docker compose ...`) |
| `port is already allocated` ao subir o banco | a porta 3308 já está em uso | trocar `DB_PORT` no `.env` e rodar `docker compose up -d` de novo |
| `[ERRO] Servidor MySQL não está rodando ou porta errada` (`ECONNREFUSED` / `2003`) | container parado, ainda iniciando, ou `.env` não existe (o código cai na porta 3306) | `docker compose ps` até aparecer `(healthy)`; conferir se o `.env` existe e tem `DB_PORT=3308` |
| `[ERRO] Usuário ou senha errados` (`Access denied for user`) | o `.env` mudou depois que o banco já tinha sido criado, ou o código está conectando em outro MySQL (porta errada) | conferir `DB_PORT` e a senha; se preciso, zerar com `docker compose down -v` e subir de novo |
| `[ERRO] O banco não existe` (`Unknown database`) | `DB_NAME` do `.env` diferente de `hospital` | conferir o `.env` |
| `Table ... doesn't exist` / tabela vazia | os `.sql` não rodaram (o volume já existia) | `docker compose down -v` e `docker compose up -d` |
| `Duplicate entry ... for key 'cpf'` | violou o `UNIQUE` | tratar no código (já tratado no exemplo) |
| `ModuleNotFoundError: No module named 'mysql'` | venv não está ativa ou faltou o `pip install` | ativar a venv e rodar `pip install -r requirements.txt` |
| `Cannot find module 'mysql2'` | faltou instalar | `npm install` dentro de `javascript/` |
| Erro ao criar a venv no Ubuntu/Debian | falta o pacote da venv | `sudo apt install python3-venv` |
| Node não termina | pool aberto | `pool.end()` no final |
| Hora do `criado_em` diferente do relógio | o container usa o fuso UTC | normal; não é erro |

Testado com MySQL 8.0 (imagem Docker `mysql:8.0`), Python 3.12
(mysql-connector-python 9) e Node 18 (mysql2 3).

# Tutorial: conectando o banco de dados ao backend (Python e JavaScript)

Projeto de exemplo da aula. Mesmo banco (`hospital`, no MySQL), duas implementações
idênticas da camada de dados: uma em **Python** e outra em **Node.js**.

```
tutorial-banco/
├── .env.exemplo            ← credenciais (copie para .env)
├── database/
│   ├── schema.sql          ← cria banco, tabelas, índice e usuário
│   └── seed.sql            ← 3 pacientes de exemplo
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

## Passo a passo

1. **MySQL rodando** (MySQL 8 ou MariaDB). Teste: `mysql -u root -p -e "SELECT 1"`
2. **Criar a estrutura** (na pasta `tutorial-banco`):
   ```bash
   mysql -u root -p < database/schema.sql
   mysql -u root -p hospital < database/seed.sql
   ```
3. **Credenciais**: copie `.env.exemplo` para `.env` (ajuste se mudou usuário/senha).
4. **Python**
   ```bash
   cd python
   python -m venv .venv
   source .venv/bin/activate        # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   python main.py
   python demo_sql_injection.py
   ```
5. **JavaScript**
   ```bash
   cd javascript
   npm install
   node main.js
   ```

## Erros comuns

| Mensagem | Causa | Solução |
|---|---|---|
| `Access denied for user` | usuário/senha errados | conferir `.env` e o `CREATE USER` |
| `Unknown database 'hospital'` | schema não foi rodado | rodar `schema.sql` |
| `ECONNREFUSED` / `2003` | servidor desligado ou porta errada | ligar o MySQL, conferir `DB_PORT` |
| `Duplicate entry ... for key 'cpf'` | violou o `UNIQUE` | tratar no código (já tratado no exemplo) |
| `Table ... doesn't exist` | nome errado ou banco errado | conferir `DB_NAME` |
| Node não termina | pool aberto | `pool.end()` no final |

Testado com MariaDB 10.11, Python 3.13 (mysql-connector-python 9) e Node 22 (mysql2 3).

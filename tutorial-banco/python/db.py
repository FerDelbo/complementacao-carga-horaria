"""
db.py — CAMADA DE CONEXÃO (Python + MySQL)
==========================================
Este arquivo tem UMA responsabilidade: saber falar com o banco.
O resto do sistema só pede "me dá uma conexão" e não precisa saber
host, senha, porta etc.

Pipeline:  seu código -> driver (mysql-connector) -> TCP :3306 -> servidor MySQL
"""
import os
from pathlib import Path
from contextlib import contextmanager

import mysql.connector
from mysql.connector import pooling, errorcode
from dotenv import load_dotenv

# 1) LER AS CREDENCIAIS DO .env  ------------------------------------------
#    Senha no código = senha no GitHub. Por isso lemos de variáveis de ambiente.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

CONFIG = {
    "host":     os.getenv("DB_HOST", "localhost"),
    "port":     int(os.getenv("DB_PORT", "3306")),
    "user":     os.getenv("DB_USER", "aluno"),
    "password": os.getenv("DB_PASSWORD", ""),
    "database": os.getenv("DB_NAME", "hospital"),
    "charset":  "utf8mb4",
}

# 2) CRIAR O POOL DE CONEXÕES  --------------------------------------------
#    Abrir conexão é caro (TCP + login + escolher banco). O pool abre
#    algumas conexões uma vez e as EMPRESTA para quem pedir.
_pool = None


def get_pool():
    global _pool
    if _pool is None:
        _pool = pooling.MySQLConnectionPool(pool_name="hospital_pool",
                                            pool_size=5, **CONFIG)
    return _pool


# 3) EMPRESTAR UMA CONEXÃO COM SEGURANÇA  -----------------------------------
#    O "with" garante: se der certo -> COMMIT; se der erro -> ROLLBACK;
#    e no final SEMPRE devolve a conexão ao pool (close()).
@contextmanager
def conexao():
    conn = get_pool().get_connection()
    try:
        yield conn
        conn.commit()          # grava de verdade no disco
    except Exception:
        conn.rollback()        # desfaz tudo que foi feito nesta conexão
        raise
    finally:
        conn.close()           # num pool, close() = "devolver", não fechar


def testar_conexao():
    """Faz um 'ping' no banco e explica o erro, se houver."""
    try:
        with conexao() as conn:
            cur = conn.cursor()
            cur.execute("SELECT VERSION(), DATABASE()")
            versao, banco = cur.fetchone()
            print(f"[OK] Conectado ao banco '{banco}' (servidor {versao})")
            return True
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_ACCESS_DENIED_ERROR:
            print("[ERRO] Usuário ou senha errados (confira o .env)")
        elif err.errno == errorcode.ER_BAD_DB_ERROR:
            print("[ERRO] O banco não existe (rode database/schema.sql)")
        elif err.errno == 2003:
            print("[ERRO] Servidor MySQL não está rodando ou porta errada")
        else:
            print(f"[ERRO] {err}")
        return False

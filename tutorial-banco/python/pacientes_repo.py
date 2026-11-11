"""
pacientes_repo.py — FUNÇÕES QUE CONVERSAM COM AS TABELAS
=========================================================
Cada função = 1 operação SQL. Repare no padrão que se repete:

    with conexao() as conn:        # 1. pega conexão do pool
        cur = conn.cursor()        # 2. abre um cursor (o "mensageiro")
        cur.execute(SQL, valores)  # 3. envia o SQL + valores SEPARADOS
        cur.fetch...()             # 4. lê a resposta (só em SELECT)
                                   # 5. commit/close automáticos no "with"

REGRA DE OURO: valores entram por %s, NUNCA concatenados na string.
"""
import mysql.connector
from mysql.connector import errorcode

from db import conexao


# ---------------------------------------------------------------- CREATE
def inserir_paciente(nome, cpf, data_nascimento=None, telefone=None):
    sql = """INSERT INTO pacientes (nome, cpf, data_nascimento, telefone)
             VALUES (%s, %s, %s, %s)"""
    try:
        with conexao() as conn:
            cur = conn.cursor()
            cur.execute(sql, (nome, cpf, data_nascimento, telefone))
            return cur.lastrowid           # id gerado pelo AUTO_INCREMENT
    except mysql.connector.Error as err:
        if err.errno == errorcode.ER_DUP_ENTRY:   # violou o UNIQUE do cpf
            raise ValueError(f"CPF {cpf} já cadastrado") from err
        raise


# ---------------------------------------------------------------- READ
def listar_pacientes():
    with conexao() as conn:
        cur = conn.cursor(dictionary=True)   # linhas viram dicionários
        cur.execute("SELECT id, nome, cpf, data_nascimento FROM pacientes ORDER BY id")
        return cur.fetchall()                # lista de dicts


def buscar_por_id(paciente_id):
    with conexao() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT * FROM pacientes WHERE id = %s", (paciente_id,))
        return cur.fetchone()                # 1 dict ou None


def buscar_por_nome(trecho):
    with conexao() as conn:
        cur = conn.cursor(dictionary=True)
        # O % do LIKE vai no VALOR, não no SQL
        cur.execute("SELECT id, nome FROM pacientes WHERE nome LIKE %s",
                    (f"%{trecho}%",))
        return cur.fetchall()


# ---------------------------------------------------------------- UPDATE
def atualizar_telefone(paciente_id, telefone):
    with conexao() as conn:
        cur = conn.cursor()
        cur.execute("UPDATE pacientes SET telefone = %s WHERE id = %s",
                    (telefone, paciente_id))
        return cur.rowcount                  # quantas linhas mudaram


# ---------------------------------------------------------------- DELETE
def excluir_paciente(paciente_id):
    with conexao() as conn:
        cur = conn.cursor()
        cur.execute("DELETE FROM pacientes WHERE id = %s", (paciente_id,))
        return cur.rowcount


# ---------------------------------------------------------------- TRANSAÇÃO
def cadastrar_com_consulta(nome, cpf, medico, data_hora):
    """Paciente + 1ª consulta: OU grava os dois, OU nenhum (atomicidade)."""
    with conexao() as conn:                  # tudo dentro de UMA conexão
        cur = conn.cursor()
        cur.execute("INSERT INTO pacientes (nome, cpf) VALUES (%s, %s)", (nome, cpf))
        novo_id = cur.lastrowid
        cur.execute("""INSERT INTO consultas (paciente_id, medico, data_hora)
                       VALUES (%s, %s, %s)""", (novo_id, medico, data_hora))
        return novo_id                       # sem erro -> COMMIT dos dois


def consultas_com_paciente():
    """JOIN: junta as duas tabelas pela chave estrangeira."""
    with conexao() as conn:
        cur = conn.cursor(dictionary=True)
        cur.execute("""SELECT c.id, p.nome AS paciente, c.medico, c.data_hora, c.status
                       FROM consultas c
                       JOIN pacientes p ON p.id = c.paciente_id
                       ORDER BY c.data_hora""")
        return cur.fetchall()

"""
main.py — ROTEIRO PRÁTICO (rode: python main.py)
Executa cada operação e mostra o que o banco respondeu.
"""
import pacientes_repo as repo
from db import testar_conexao


def titulo(t):
    print(f"\n=== {t} ===")


if not testar_conexao():
    raise SystemExit(1)

titulo("1. INSERT")
novo_id = repo.inserir_paciente("Diego Rocha", "44455566677", "1995-07-20", "(44) 99901-0004")
print("Paciente criado com id =", novo_id)

titulo("2. INSERT repetido (CPF UNIQUE)")
try:
    repo.inserir_paciente("Diego Clone", "44455566677")
except ValueError as e:
    print("Banco recusou:", e)

titulo("3. SELECT (todos)")
for p in repo.listar_pacientes():
    print(p)

titulo("4. SELECT com LIKE")
print(repo.buscar_por_nome("Diego"))

titulo("5. UPDATE")
print("Linhas alteradas:", repo.atualizar_telefone(novo_id, "(44) 98888-7777"))
print(repo.buscar_por_id(novo_id))

titulo("6. TRANSAÇÃO que dá certo")
pid = repo.cadastrar_com_consulta("Elisa Prado", "55566677788", "Dra. Marta", "2026-11-20 14:30:00")
print("Paciente + consulta gravados, id =", pid)

titulo("7. TRANSAÇÃO que falha (CPF repetido -> ROLLBACK)")
try:
    repo.cadastrar_com_consulta("Elisa Clone", "55566677788", "Dr. João", "2026-11-21 09:00:00")
except Exception as e:
    print("Falhou e nada foi gravado:", type(e).__name__)

titulo("8. JOIN consultas + pacientes")
for c in repo.consultas_com_paciente():
    print(c)

titulo("9. DELETE (limpando o que o roteiro criou)")
print("Removidos:", repo.excluir_paciente(novo_id) + repo.excluir_paciente(pid))

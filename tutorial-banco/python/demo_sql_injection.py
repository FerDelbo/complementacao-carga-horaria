"""
demo_sql_injection.py — POR QUE NUNCA CONCATENAR SQL
Rode: python demo_sql_injection.py   (só faz SELECT, não estraga nada)
"""
from db import conexao

entrada_maliciosa = "' OR '1'='1"     # o que um "usuário" digitou no campo CPF

with conexao() as conn:
    cur = conn.cursor()

    # ERRADO: o texto do usuário vira PARTE do comando SQL
    sql_errado = f"SELECT nome FROM pacientes WHERE cpf = '{entrada_maliciosa}'"
    print("SQL montado na mão:\n ", sql_errado)
    cur.execute(sql_errado)
    print("Resultado ->", cur.fetchall(), "  <-- vazou a tabela inteira!\n")

    # CERTO: o texto do usuário viaja como VALOR, separado do comando
    cur.execute("SELECT nome FROM pacientes WHERE cpf = %s", (entrada_maliciosa,))
    print("Com placeholder %s:")
    print("Resultado ->", cur.fetchall(), "  <-- procurou um CPF com esse texto literal")

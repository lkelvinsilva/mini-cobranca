
from openpyxl import load_workbook
from connection import parcelas_collection
from datetime import date, datetime

arquivo = load_workbook("parcelas.xlsx")

planilha = arquivo.active

parcelas_novas = []

for linha in planilha.iter_rows(min_row=2, values_only=True):

    cliente = linha[0]
    valor = linha[1]
    vencimento = linha[2]

    # 1. Validar cliente
    if not isinstance(cliente, str) or not cliente.strip():
        print("Cliente inválido. Linha ignorada.")
        continue

    # 2. Validar valor
    if not isinstance(valor, (int, float)) or isinstance(valor, bool) or valor <= 0:
        print(f"Valor inválido para {cliente}. Linha ignorada.")
        continue

    # 3. Validar vencimento
    if not isinstance(vencimento, (date, datetime)):
        print(f"Vencimento inválido para {cliente}. Linha ignorada.")
        continue

    # 4. Verificar duplicidade
    parcela_existente = parcelas_collection.find_one({
        "cliente": cliente.strip(),
        "valor": valor,
        "vencimento": vencimento
    })

    if parcela_existente:
        print(f"Parcela de {cliente} já cadastrada.")
        continue

    # 5. Preparar parcela
    parcela = {
        "cliente": cliente.strip(),
        "valor": valor,
        "vencimento": vencimento,
        "status": "pendente"
    }

    parcelas_novas.append(parcela)


# 6. Inserir parcelas novas
if parcelas_novas:

    resultado = parcelas_collection.insert_many(parcelas_novas)

    print(f"{len(resultado.inserted_ids)} novas parcelas importadas!")

else:
    print("Nenhuma parcela nova para importar.")

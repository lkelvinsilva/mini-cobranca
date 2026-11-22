
from openpyxl import load_workbook
from connection import pagamentos_collection, parcelas_collection

arquivo = load_workbook("base_cobranca.xlsx", data_only=True)
planilha = arquivo["PAGAMENTOS"]

pagamentos_novos = []
ids_processados = set()
valores_acumulados = {}

for linha in planilha.iter_rows(min_row=2, values_only=True):

    id_pagamento = linha[0]
    id_parcela = linha[1]
    id_cliente = linha[2]
    nome_cliente = linha[3]
    id_colaborador = linha[4]
    nome_colaborador = linha[5]
    data_pagamento = linha[6]
    valor_pago = linha[7]
    forma_pagamento = linha[8]
    observacao = linha[9]

    # Validar campos obrigatórios
    if not id_pagamento or not id_parcela:
        print("Dados obrigatórios ausentes. Linha ignorada.")
        continue

    if id_pagamento in ids_processados:
        print(f"Pagamento duplicado na planilha: {id_pagamento}")
        continue

    existente = pagamentos_collection.find_one({
        "id_pagamento": id_pagamento
    })

    if existente:
        print(f"Pagamento {id_pagamento} já cadastrado.")
        continue

    # Validar valor
    if not isinstance(valor_pago, (int, float)) or isinstance(valor_pago, bool) or valor_pago <= 0:
        print(f"Valor inválido no pagamento {id_pagamento}.")
        continue

    # Verificar se a parcela existe
    parcela = parcelas_collection.find_one({
        "id_parcela": id_parcela
    })

    if not parcela:
        print(f"Parcela {id_parcela} não encontrada.")
        continue

    # Conferir os relacionamentos
    if (
        parcela["id_cliente"] != id_cliente
        or parcela["id_colaborador"] != id_colaborador
    ):
        print(f"Relacionamentos incorretos no pagamento {id_pagamento}.")
        continue

    # Somar pagamentos anteriores da parcela
    if id_parcela not in valores_acumulados:
        pagamentos_anteriores = pagamentos_collection.find({
            "id_parcela": id_parcela
        })

        valores_acumulados[id_parcela] = sum(
            p["valor_pago"] for p in pagamentos_anteriores
        )

    total_pago = valores_acumulados[id_parcela] + valor_pago

    if total_pago > parcela["valor_original"]:
        print(f"Pagamento excede o valor da parcela {id_parcela}.")
        continue

    pagamento = {
        "id_pagamento": id_pagamento,
        "id_parcela": id_parcela,
        "id_cliente": id_cliente,
        "nome_cliente": nome_cliente,
        "id_colaborador": id_colaborador,
        "nome_colaborador": nome_colaborador,
        "data_pagamento": data_pagamento,
        "valor_pago": valor_pago,
        "forma_pagamento": forma_pagamento,
        "observacao": observacao
    }

    pagamentos_novos.append(pagamento)
    ids_processados.add(id_pagamento)
    valores_acumulados[id_parcela] = total_pago

# Inserir pagamentos
if pagamentos_novos:
    resultado = pagamentos_collection.insert_many(pagamentos_novos)

    print(
        f"\n{len(resultado.inserted_ids)} pagamentos importados!"
    )
else:
    print("\nNenhum pagamento novo para importar.")

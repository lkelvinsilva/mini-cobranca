
from openpyxl import load_workbook
from connection import (
    parcelas_collection,
    clientes_collection,
    colaboradores_collection
)

# 1. Abrir planilha
arquivo = load_workbook("base_cobranca.xlsx", data_only=True)

# 2. Selecionar aba PARCELAS
planilha = arquivo["PARCELAS"]

parcelas_novas = []

# 3. Percorrer registros
for linha in planilha.iter_rows(min_row=2, values_only=True):

    id_parcela = linha[0]
    id_origem = linha[1]
    id_cliente = linha[2]
    nome_cliente = linha[3]
    valor_original = linha[4]
    vencimento = linha[5]
    id_colaborador = linha[6]
    nome_colaborador = linha[7]
    status = linha[8]
    data_importacao = linha[9]
    observacao = linha[10]

    # 4. Validar dados obrigatórios
    if not id_parcela or not id_cliente or not id_colaborador:
        print("Dados obrigatórios ausentes. Linha ignorada.")
        continue

    if not isinstance(valor_original, (int, float)) or valor_original <= 0:
        print(f"Valor inválido na parcela {id_parcela}.")
        continue

    # 5. Verificar se o cliente existe
    cliente = clientes_collection.find_one({
        "id_cliente": id_cliente
    })

    if not cliente:
        print(f"Cliente {id_cliente} não encontrado.")
        continue

    # 6. Verificar se o colaborador existe
    colaborador = colaboradores_collection.find_one({
        "id_colaborador": id_colaborador
    })

    if not colaborador:
        print(f"Colaborador {id_colaborador} não encontrado.")
        continue

    # 7. Verificar duplicidade
    existente = parcelas_collection.find_one({
        "id_parcela": id_parcela
    })

    if existente:
        print(f"Parcela {id_parcela} já cadastrada.")
        continue

    # 8. Montar documento
    parcela = {
        "id_parcela": id_parcela,
        "id_origem": id_origem,
        "id_cliente": id_cliente,
        "nome_cliente": nome_cliente,
        "valor_original": valor_original,
        "vencimento": vencimento,
        "id_colaborador": id_colaborador,
        "nome_colaborador": nome_colaborador,
        "status": status,
        "data_importacao": data_importacao,
        "observacao": observacao
    }

    parcelas_novas.append(parcela)

# 9. Inserir no MongoDB
if parcelas_novas:
    resultado = parcelas_collection.insert_many(parcelas_novas)

    print(
        f"\n{len(resultado.inserted_ids)} parcelas importadas com sucesso!"
    )
else:
    print("\nNenhuma parcela nova para importar.")

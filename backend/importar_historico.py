
from openpyxl import load_workbook
from connection import (
    historico_collection,
    parcelas_collection,
    clientes_collection,
    colaboradores_collection
)

arquivo = load_workbook("base_cobranca.xlsx", data_only=True)
planilha = arquivo["HISTORICO_COBRANCA"]

historicos_novos = []

for linha in planilha.iter_rows(min_row=2, values_only=True):

    id_historico = linha[0]
    id_parcela = linha[1]
    id_cliente = linha[2]
    id_colaborador = linha[3]
    data_contato = linha[4]
    canal = linha[5]
    resultado = linha[6]
    proxima_acao = linha[7]
    data_proxima_acao = linha[8]
    observacao = linha[9]

    # Validar campos obrigatórios
    if not id_historico or not id_parcela:
        print("Dados obrigatórios ausentes. Linha ignorada.")
        continue

    # Verificar duplicidade
    existente = historico_collection.find_one({
        "id_historico": id_historico
    })

    if existente:
        print(f"Histórico {id_historico} já cadastrado.")
        continue

    # Verificar se a parcela existe
    parcela = parcelas_collection.find_one({
        "id_parcela": id_parcela
    })

    if not parcela:
        print(f"Parcela {id_parcela} não encontrada.")
        continue

    # Verificar cliente
    cliente = clientes_collection.find_one({
        "id_cliente": id_cliente
    })

    if not cliente:
        print(f"Cliente {id_cliente} não encontrado.")
        continue

    # Verificar colaborador
    colaborador = colaboradores_collection.find_one({
        "id_colaborador": id_colaborador
    })

    if not colaborador:
        print(f"Colaborador {id_colaborador} não encontrado.")
        continue

    # Conferir relacionamentos
    if parcela["id_cliente"] != id_cliente:
        print(f"Cliente incorreto no histórico {id_historico}.")
        continue

    historico = {
        "id_historico": id_historico,
        "id_parcela": id_parcela,
        "id_cliente": id_cliente,
        "id_colaborador": id_colaborador,
        "data_contato": data_contato,
        "canal": canal,
        "resultado": resultado,
        "proxima_acao": proxima_acao,
        "data_proxima_acao": data_proxima_acao,
        "observacao": observacao
    }

    historicos_novos.append(historico)

# Inserir no MongoDB
if historicos_novos:
    resultado = historico_collection.insert_many(historicos_novos)

    print(
        f"\n{len(resultado.inserted_ids)} históricos importados com sucesso!"
    )
else:
    print("\nNenhum histórico novo para importar.")

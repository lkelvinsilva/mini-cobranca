
from connection import (
    colaboradores_collection,
    pagamentos_collection
)

# Buscar colaboradores cadastrados
colaboradores = list(colaboradores_collection.find())

# Buscar pagamentos registrados
pagamentos = list(pagamentos_collection.find())

# Dicionário para armazenar os resultados
relatorio = {}

# Inicializar os colaboradores
for colaborador in colaboradores:

    id_colaborador = colaborador["id_colaborador"]

    relatorio[id_colaborador] = {
        "nome": colaborador["nome"],
        "percentual": colaborador["percentual_comissao"],
        "total_recuperado": 0,
        "comissao": 0
    }

# Somar os pagamentos de cada colaborador
for pagamento in pagamentos:

    id_colaborador = pagamento["id_colaborador"]
    valor_pago = pagamento["valor_pago"]

    if id_colaborador in relatorio:
        relatorio[id_colaborador]["total_recuperado"] += valor_pago

    else:
        print(
            f"Atenção: colaborador não encontrado "
            f"para o pagamento {pagamento.get('id_pagamento')}"
        )

# Calcular comissão
for id_colaborador, dados in relatorio.items():

    total_recuperado = dados["total_recuperado"]
    percentual = dados["percentual"]

    comissao = total_recuperado * percentual

    dados["total_recuperado"] = round(total_recuperado, 2)
    dados["comissao"] = round(comissao, 2)

# Exibir relatório
print("\n===== RELATÓRIO DE COMISSÕES =====\n")

for id_colaborador, dados in relatorio.items():

    print(f"Colaborador: {dados['nome']}")
    print(f"ID: {id_colaborador}")
    print(f"Percentual: {dados['percentual'] * 100:.0f}%")
    print(f"Total recuperado: R$ {dados['total_recuperado']:.2f}")
    print(f"Comissão: R$ {dados['comissao']:.2f}")
    print("----------------------------------")

# Resumo geral
total_recuperado_geral = sum(
    dados["total_recuperado"]
    for dados in relatorio.values()
)

total_comissoes = sum(
    dados["comissao"]
    for dados in relatorio.values()
)

print("\n===== RESUMO GERAL =====")

print(f"Colaboradores: {len(relatorio)}")
print(f"Total recuperado: R$ {total_recuperado_geral:.2f}")
print(f"Total de comissões: R$ {total_comissoes:.2f}")

print("\n===== RELATÓRIO FINALIZADO =====")

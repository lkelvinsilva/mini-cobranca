
from connection import (
    clientes_collection,
    colaboradores_collection,
    parcelas_collection,
    pagamentos_collection,
    historico_collection,
    parametros_collection
)

colecoes = {
    "Clientes": clientes_collection,
    "Colaboradores": colaboradores_collection,
    "Parcelas": parcelas_collection,
    "Pagamentos": pagamentos_collection,
    "Histórico de cobranças": historico_collection,
    "Parâmetros": parametros_collection
}

print("\n===== AUDITORIA DO MINI COBRANÇA =====\n")

for nome, colecao in colecoes.items():

    quantidade = colecao.count_documents({})

    print(f"{nome}: {quantidade} registros")

print("\n===== AUDITORIA FINALIZADA =====")

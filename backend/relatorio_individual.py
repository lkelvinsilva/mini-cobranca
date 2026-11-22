from connection import (
    colaboradores_collection,
    parcelas_collection,
    pagamentos_collection
)

id_colaborador = input("Digite o ID do colaborador: ")

colaborador = colaboradores_collection.find_one({
    "id_colaborador": id_colaborador
})

if colaborador is None:
    print("Colaborador não encontrado!")

else:
    print("\n===== RELATÓRIO INDIVIDUAL =====")
    print(f"Colaborador: {colaborador['nome']}")
    print(f"ID: {colaborador['id_colaborador']}")
    print(f"Comissão: {colaborador['percentual_comissao'] * 100:.0f}%")

    parcelas = list(
        parcelas_collection.find({
            "id_colaborador": id_colaborador
        })
    )

    print(f"Total de parcelas atribuídas: {len(parcelas)}")

total_pagas = 0
total_pendentes = 0

for parcela in parcelas:

    pagamentos = list(
        pagamentos_collection.find({
            "id_parcela": parcela["id_parcela"]
        })
    )

    valor_pago = sum(
        pagamento["valor_pago"]
        for pagamento in pagamentos
    )

    saldo = parcela["valor_original"] - valor_pago

    if saldo <= 0:
        total_pagas += 1
    else:
        total_pendentes += 1

print(f"Parcelas pagas: {total_pagas}")
print(f"Parcelas pendentes: {total_pendentes}")

total_original = sum(
    parcela["valor_original"]
    for parcela in parcelas
)

total_recuperado = 0

for parcela in parcelas:

    pagamentos = pagamentos_collection.find({
        "id_parcela": parcela["id_parcela"]
    })

    for pagamento in pagamentos:
        total_recuperado += pagamento["valor_pago"]

saldo_aberto = total_original - total_recuperado

percentual = colaborador["percentual_comissao"]

comissao = total_recuperado * percentual

print("\n===== RESUMO FINANCEIRO =====")
print(f"Total original: R$ {total_original:.2f}")
print(f"Total recuperado: R$ {total_recuperado:.2f}")
print(f"Saldo em aberto: R$ {saldo_aberto:.2f}")
print(f"Comissão acumulada: R$ {comissao:.2f}")
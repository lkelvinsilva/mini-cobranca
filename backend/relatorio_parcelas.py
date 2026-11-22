
from datetime import datetime

from connection import (
    parcelas_collection,
    pagamentos_collection
)

# Buscar somente parcelas importadas no padrão atual
parcelas = list(
    parcelas_collection.find({
        "id_parcela": {"$exists": True}
    })
)

hoje = datetime.now()

# Contadores
total_parcelas = 0
total_pago = 0
total_pendente_em_dia = 0
total_parcial_em_dia = 0
total_pendente_atrasado = 0
total_parcial_atrasado = 0

# Valores financeiros
valor_total_original = 0
valor_total_recebido = 0
saldo_total_aberto = 0

print("\n===== RELATÓRIO DE PARCELAS =====\n")

for parcela in parcelas:

    total_parcelas += 1

    id_parcela = parcela["id_parcela"]
    nome_cliente = parcela["nome_cliente"]
    valor_original = parcela["valor_original"]
    vencimento = parcela["vencimento"]

    # Buscar pagamentos vinculados à parcela
    pagamentos = list(
        pagamentos_collection.find({
            "id_parcela": id_parcela
        })
    )

    # Somar todos os pagamentos da parcela
    valor_pago = sum(
        pagamento["valor_pago"]
        for pagamento in pagamentos
    )

    saldo = round(valor_original - valor_pago, 2)

    # Acumular valores financeiros
    valor_total_original += valor_original
    valor_total_recebido += valor_pago
    saldo_total_aberto += saldo

    # Classificar situação da parcela
    if saldo <= 0:

        situacao = "pago"
        total_pago += 1

    elif vencimento < hoje:

        if valor_pago > 0:
            situacao = "parcialmente pago e atrasado"
            total_parcial_atrasado += 1

        else:
            situacao = "atrasado"
            total_pendente_atrasado += 1

    else:

        if valor_pago > 0:
            situacao = "parcialmente pago"
            total_parcial_em_dia += 1

        else:
            situacao = "pendente"
            total_pendente_em_dia += 1

    # Exibir informações da parcela
    print(
        f"{id_parcela} | "
        f"{nome_cliente} | "
        f"Original: R$ {valor_original:.2f} | "
        f"Pago: R$ {valor_pago:.2f} | "
        f"Saldo: R$ {saldo:.2f} | "
        f"Situação: {situacao}"
    )


# Resumo financeiro
print("\n===== RESUMO FINANCEIRO =====")

print(f"Total de parcelas: {total_parcelas}")
print(f"Pagas integralmente: {total_pago}")
print(f"Pendentes em dia: {total_pendente_em_dia}")
print(f"Parcialmente pagas em dia: {total_parcial_em_dia}")
print(f"Pendentes atrasadas: {total_pendente_atrasado}")
print(f"Parcialmente pagas atrasadas: {total_parcial_atrasado}")

print("\n===== VALORES FINANCEIROS =====")

print(f"Valor original: R$ {valor_total_original:.2f}")
print(f"Total recebido: R$ {valor_total_recebido:.2f}")
print(f"Saldo em aberto: R$ {saldo_total_aberto:.2f}")

print("\n===== RELATÓRIO FINALIZADO =====")

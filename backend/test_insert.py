
from connection import parcelas_collection

parcela = {
    "cliente": "João Silva",
    "valor": 350.00,
    "vencimento": "2026-11-25",
    "status": "pendente"
}

resultado = parcelas_collection.insert_one(parcela)

print("Parcela cadastrada com sucesso!")
print("ID do documento:", resultado.inserted_id)

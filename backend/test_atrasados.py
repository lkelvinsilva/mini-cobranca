from datetime import datetime
from connection import parcelas_collection

hoje = datetime.now()

print("Data atual:", hoje)

parcelas = list(parcelas_collection.find({
    "vencimento": {"$lt": hoje},
    "status": {"$ne": "pago"}
}))

print("Quantidade encontrada:", len(parcelas))

for parcela in parcelas:
    print(parcela)
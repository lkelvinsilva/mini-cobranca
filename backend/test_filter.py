
from connection import parcelas_collection

parcelas = parcelas_collection.find({
    "status": "pendente"
})

for parcela in parcelas:
    print(parcela)

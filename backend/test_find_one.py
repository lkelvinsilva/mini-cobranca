
from connection import parcelas_collection

parcela = parcelas_collection.find_one({
    "cliente": "João Silva"
})

print(parcela)


from connection import parcelas_collection

parcelas = parcelas_collection.find()

for parcela in parcelas:
    print(parcela)

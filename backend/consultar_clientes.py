from connection import clientes_collection

clientes = list(clientes_collection.find())

print("Total de clientes:", len(clientes))

for cliente in clientes:
    print(
        cliente["id_cliente"],
        cliente["nome"],
        cliente["status"]
    )
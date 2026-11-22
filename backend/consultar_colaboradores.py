from connection import colaboradores_collection

colaboradores = list(colaboradores_collection.find())

print("Total de colaboradores:", len(colaboradores))

for colaborador in colaboradores:
    percentual = colaborador["percentual_comissao"] * 100

    print(
        colaborador["id_colaborador"],
        colaborador["nome"],
        f"{percentual:.0f}%"
    )
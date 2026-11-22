from connection import parcelas_collection

filtro = {
    "id_parcela": {"$exists": False}
}

quantidade = parcelas_collection.count_documents(filtro)

print(f"Documentos antigos encontrados: {quantidade}")

if quantidade == 6:
    resultado = parcelas_collection.delete_many(filtro)

    print(f"Documentos excluídos: {resultado.deleted_count}")
else:
    print("Quantidade diferente de 6. Exclusão cancelada.")
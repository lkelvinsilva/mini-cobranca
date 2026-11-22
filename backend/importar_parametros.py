
from openpyxl import load_workbook
from connection import parametros_collection

arquivo = load_workbook("base_cobranca.xlsx", data_only=True)
planilha = arquivo["PARAMETROS"]

parametros_novos = []

for linha in planilha.iter_rows(min_row=2, values_only=True):

    parametro = linha[0]
    valor = linha[1]
    descricao = linha[2]

    if not parametro:
        print("Parâmetro sem identificação. Linha ignorada.")
        continue

    existente = parametros_collection.find_one({
        "parametro": parametro
    })

    if existente:
        print(f"Parâmetro {parametro} já cadastrado.")
        continue

    documento = {
        "parametro": parametro,
        "valor": valor,
        "descricao": descricao
    }

    parametros_novos.append(documento)

if parametros_novos:
    resultado = parametros_collection.insert_many(parametros_novos)

    print(
        f"{len(resultado.inserted_ids)} parâmetros importados!"
    )
else:
    print("Nenhum parâmetro novo para importar.")

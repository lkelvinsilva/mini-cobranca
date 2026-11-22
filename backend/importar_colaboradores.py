
from openpyxl import load_workbook
from connection import colaboradores_collection

# Abrir a planilha
arquivo = load_workbook("base_cobranca.xlsx", data_only=True)

# Selecionar a aba COLABORADORES
planilha = arquivo["COLABORADORES"]

colaboradores_novos = []

# Percorrer os registros
for linha in planilha.iter_rows(min_row=2, values_only=True):

    id_colaborador = linha[0]
    nome = linha[1]
    telefone = linha[2]
    email = linha[3]
    percentual_comissao = linha[4]
    data_admissao = linha[5]
    status = linha[6]

    # Validar dados obrigatórios
    if not id_colaborador or not nome:
        print("Colaborador com dados obrigatórios ausentes. Linha ignorada.")
        continue

    # Validar comissão
    if not isinstance(percentual_comissao, (int, float)):
        print(f"Comissão inválida para {nome}. Linha ignorada.")
        continue

    if percentual_comissao < 0 or percentual_comissao > 1:
        print(f"Comissão fora do intervalo para {nome}. Linha ignorada.")
        continue

    # Verificar duplicidade
    existente = colaboradores_collection.find_one({
        "id_colaborador": id_colaborador
    })

    if existente:
        print(f"{nome} já está cadastrado. Ignorando.")
        continue

    # Criar documento
    colaborador = {
        "id_colaborador": id_colaborador,
        "nome": nome.strip(),
        "telefone": telefone,
        "email": email,
        "percentual_comissao": percentual_comissao,
        "data_admissao": data_admissao,
        "status": status
    }

    colaboradores_novos.append(colaborador)

# Inserir no MongoDB
if colaboradores_novos:
    resultado = colaboradores_collection.insert_many(colaboradores_novos)

    print(
        f"{len(resultado.inserted_ids)} colaboradores importados com sucesso!"
    )
else:
    print("Nenhum colaborador novo para importar.")

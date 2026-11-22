
from openpyxl import load_workbook
from connection import clientes_collection

# 1. Abrir a planilha
arquivo = load_workbook("base_cobranca.xlsx", data_only=True)

# 2. Selecionar a aba CLIENTES
planilha = arquivo["CLIENTES"]

clientes_novos = []

# 3. Percorrer os registros
for linha in planilha.iter_rows(min_row=2, values_only=True):

    id_cliente = linha[0]
    nome = linha[1]
    telefone = linha[2]
    email = linha[3]
    data_cadastro = linha[4]
    status = linha[5]

    # 4. Validar campos obrigatórios
    if not id_cliente or not nome or not telefone:
        print("Cliente com dados obrigatórios ausentes. Linha ignorada.")
        continue

    # 5. Verificar duplicidade pelo ID
    cliente_existente = clientes_collection.find_one({
        "id_cliente": id_cliente
    })

    if cliente_existente:
        print(f"Cliente {id_cliente} já cadastrado. Ignorando.")
        continue

    # 6. Montar documento
    cliente = {
        "id_cliente": id_cliente,
        "nome": nome.strip(),
        "telefone": telefone,
        "email": email,
        "data_cadastro": data_cadastro,
        "status": status
    }

    clientes_novos.append(cliente)

# 7. Inserir no MongoDB
if clientes_novos:

    resultado = clientes_collection.insert_many(clientes_novos)

    print(f"\n{len(resultado.inserted_ids)} clientes importados com sucesso!")

else:
    print("\nNenhum cliente novo para importar.")

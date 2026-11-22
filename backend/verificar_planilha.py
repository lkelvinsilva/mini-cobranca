
from openpyxl import load_workbook

arquivo = load_workbook("base_cobranca.xlsx", data_only=True)

print("Abas encontradas:", arquivo.sheetnames)

for planilha in arquivo.worksheets:
    print("\n----------------------")
    print("Aba:", planilha.title)

    colunas = [celula.value for celula in planilha[1]]

    print("Colunas:", colunas)
    print("Quantidade de registros:", planilha.max_row - 1)
    print("Primeiros registros:")

    for linha in planilha.iter_rows(
        min_row=2,
        max_row=min(planilha.max_row, 4),
        values_only=True
    ):
        print(linha)

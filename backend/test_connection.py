from connection import client

try:
    resultado = client.admin.command("ping")
    print("MongoDB conectado com sucesso!")
    print(resultado)

except Exception as erro:
    print("Erro ao conectar:")
    print(erro)
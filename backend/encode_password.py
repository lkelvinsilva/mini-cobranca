from urllib.parse import quote_plus

senha = input("Digite sua senha: ")

senha_codificada = quote_plus(senha)

print("Senha codificada:", senha_codificada)
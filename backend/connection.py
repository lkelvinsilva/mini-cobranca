import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)

db = client["mini_cobranca"]
parcelas_collection = db["parcelas"]
clientes_collection = db["clientes"]
colaboradores_collection = db["colaboradores"]
pagamentos_collection = db["pagamentos"]
historico_collection = db["historico_cobranca"]
parametros_collection = db["parametros"]

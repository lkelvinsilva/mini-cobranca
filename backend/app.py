from flask_cors import CORS
from datetime import datetime
from flask import Flask, jsonify, request
from openpyxl import load_workbook
from connection import (
    clientes_collection,
    colaboradores_collection,
    parcelas_collection,
    pagamentos_collection,
    historico_collection,
    parametros_collection
)
from uuid import uuid4
import os

app = Flask(__name__)

origens_permitidas = [
    "http://localhost:5173",
    os.getenv("FRONTEND_URL", "")
]

CORS(app, origins=origens_permitidas)

# Rota inicial
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "mensagem": "API Mini Cobranca funcionando!"
    })


# Rota de teste
@app.route("/teste", methods=["GET"])
def teste():
    resultado = parcelas_collection.insert_one({
        "cliente": "Luã",
        "valor": 350.00,
        "status": "pendente"
    })

    return jsonify({
        "mensagem": "Parcela cadastrada com sucesso!",
        "id": str(resultado.inserted_id)
    })


# Cadastro de parcelas

@app.route("/parcelas", methods=["POST"])
def cadastrar_parcela():

    dados = request.get_json()

    # Verificar se os campos obrigatórios existem
    if not dados or "cliente" not in dados or "valor" not in dados:
        return jsonify({
            "erro": "Informe o cliente e o valor da parcela."
        }), 400

    # Validar nome do cliente
    if not isinstance(dados["cliente"], str) or not dados["cliente"].strip():
        return jsonify({
            "erro": "O nome do cliente é obrigatório."
        }), 400

    # Validar valor
    if not isinstance(dados["valor"], (int, float)) or isinstance(dados["valor"], bool) or dados["valor"] <= 0:
        return jsonify({
            "erro": "O valor deve ser um número maior que zero."
        }), 400

    parcela = {
    "cliente": dados["cliente"].strip(),
    "valor": dados["valor"],
    "vencimento": dados["vencimento"],
    "status": "pendente",
    "colaborador": dados["colaborador"]
}

    resultado = parcelas_collection.insert_one(parcela)

    return jsonify({
        "mensagem": "Parcela cadastrada com sucesso!",
        "id": str(resultado.inserted_id)
    }), 201


@app.route("/parcelas", methods=["GET"])
def listar_parcelas():

    parcelas = list(parcelas_collection.find())

    for parcela in parcelas:
        parcela["_id"] = str(parcela["_id"])

    return jsonify(parcelas), 200


@app.route("/parcelas/status/<status>", methods=["GET"])
def filtrar_parcelas(status):

    parcelas = list(parcelas_collection.find({
        "status": status
    }))

    for parcela in parcelas:
        parcela["_id"] = str(parcela["_id"])

    return jsonify(parcelas), 200


@app.route("/parcelas/atrasadas", methods=["GET"])
def listar_parcelas_atrasadas():

    hoje = datetime.now()

    parcelas = list(parcelas_collection.find({
        "vencimento": {"$lt": hoje},
        "status": {"$ne": "pago"}
    }))

    for parcela in parcelas:
        parcela["_id"] = str(parcela["_id"])

    return jsonify(parcelas), 200

@app.route("/parcelas/total-atrasado", methods=["GET"])
def total_atrasado():

    hoje = datetime.now()

    parcelas = list(parcelas_collection.find({
        "vencimento": {"$lt": hoje},
        "status": {"$ne": "pago"}
    }))

    total = sum(parcela["valor"] for parcela in parcelas)

    return jsonify({
        "quantidade": len(parcelas),
        "total_atrasado": round(total, 2)
    }), 200

@app.route("/parcelas/pagar/<id>", methods=["PUT"])
def pagar_parcela(id):

    from bson import ObjectId
    from bson.errors import InvalidId

    try:
        resultado = parcelas_collection.update_one(
            {"_id": ObjectId(id)},
            {"$set": {"status": "pago"}}
        )

    except InvalidId:
        return jsonify({"erro": "ID inválido"}), 400

    if resultado.matched_count == 0:
        return jsonify({"erro": "Parcela não encontrada"}), 404

    return jsonify({
        "mensagem": "Parcela paga com sucesso!"
    }), 200

@app.route("/parcelas/comissao", methods=["GET"])
def calcular_comissao():

    parcelas_pagas = list(parcelas_collection.find({
        "status": "pago"
    }))

    total_recuperado = sum(
        parcela["valor"] for parcela in parcelas_pagas
    )

    percentual = 0.10

    comissao = total_recuperado * percentual

    return jsonify({
        "quantidade_parcelas_pagas": len(parcelas_pagas),
        "total_recuperado": round(total_recuperado, 2),
        "percentual_comissao": "10%",
        "comissao": round(comissao, 2)
    }), 200

@app.route("/parcelas/colaborador/<nome>", methods=["GET"])
def parcelas_por_colaborador(nome):

    parcelas = list(parcelas_collection.find({
        "colaborador": nome
    }))

    for parcela in parcelas:
        parcela["_id"] = str(parcela["_id"])

    return jsonify({
        "colaborador": nome,
        "quantidade": len(parcelas),
        "parcelas": parcelas
    }), 200

@app.route("/parcelas/colaborador/<nome>/relatorio", methods=["GET"])
def relatorio_colaborador(nome):

    parcelas_pagas = list(parcelas_collection.find({
        "colaborador": nome,
        "status": "pago"
    }))

    total_recuperado = sum(
        parcela["valor"] for parcela in parcelas_pagas
    )

    percentual = 0.10

    comissao = total_recuperado * percentual

    return jsonify({
        "colaborador": nome,
        "quantidade_pagamentos": len(parcelas_pagas),
        "total_recuperado": round(total_recuperado, 2),
        "percentual_comissao": "10%",
        "comissao": round(comissao, 2)
    }), 200


@app.route("/colaboradores/<id_colaborador>/relatorio", methods=["GET"])
def relatorio_individual_api(id_colaborador):

    # Buscar colaborador
    colaborador = colaboradores_collection.find_one({
        "id_colaborador": id_colaborador
    })

    if colaborador is None:
        return jsonify({
            "erro": "Colaborador não encontrado"
        }), 404

    # Buscar parcelas atribuídas
    parcelas = list(parcelas_collection.find({
        "id_colaborador": id_colaborador
    }))

    total_pagas = 0
    total_pendentes = 0
    total_original = 0
    total_recuperado = 0

    # Percorrer parcelas
    for parcela in parcelas:

        valor_original = parcela["valor_original"]
        total_original += valor_original

        # Buscar pagamentos da parcela
        pagamentos = pagamentos_collection.find({
            "id_parcela": parcela["id_parcela"]
        })

        valor_pago = sum(
            pagamento["valor_pago"]
            for pagamento in pagamentos
        )

        total_recuperado += valor_pago

        saldo = valor_original - valor_pago

        if saldo <= 0:
            total_pagas += 1
        else:
            total_pendentes += 1

    # Calcular valores
    saldo_aberto = total_original - total_recuperado

    percentual = colaborador["percentual_comissao"]

    comissao = total_recuperado * percentual

    return jsonify({
        "colaborador": colaborador["nome"],
        "id_colaborador": id_colaborador,
        "percentual_comissao": f"{percentual * 100:.0f}%",
        "total_parcelas": len(parcelas),
        "parcelas_pagas": total_pagas,
        "parcelas_pendentes": total_pendentes,
        "total_original": round(total_original, 2),
        "total_recuperado": round(total_recuperado, 2),
        "saldo_aberto": round(saldo_aberto, 2),
        "comissao": round(comissao, 2)
    }), 200

@app.route("/colaboradores", methods=["GET"])
def listar_colaboradores():

    colaboradores = list(colaboradores_collection.find())

    resultado = []

    for colaborador in colaboradores:

        resultado.append({
            "id_colaborador": colaborador["id_colaborador"],
            "nome": colaborador["nome"],
            "percentual_comissao": colaborador["percentual_comissao"] * 100,
            "status": colaborador["status"]
        })

    return jsonify({
        "quantidade": len(resultado),
        "colaboradores": resultado
    }), 200


@app.route("/colaboradores/<id_colaborador>/parcelas", methods=["GET"])
def listar_parcelas_colaborador(id_colaborador):

    colaborador = colaboradores_collection.find_one({
        "id_colaborador": id_colaborador
    })

    if colaborador is None:
        return jsonify({
            "erro": "Colaborador não encontrado"
        }), 404

    parcelas = list(parcelas_collection.find({
        "id_colaborador": id_colaborador
    }))

    resultado = []

    hoje = datetime.now().date()

    for parcela in parcelas:

        pagamentos = pagamentos_collection.find({
            "id_parcela": parcela["id_parcela"]
        })

        valor_pago = sum(
            pagamento["valor_pago"]
            for pagamento in pagamentos
        )

        valor_original = parcela["valor_original"]

        saldo = round(valor_original - valor_pago, 2)

        if saldo <= 0:
            situacao = "pago"
        elif valor_pago > 0:
            situacao = "parcialmente pago"
        elif parcela["vencimento"].date() < hoje:
            situacao = "atrasado"
        else:
            situacao = "pendente"

        resultado.append({
            "id_parcela": parcela["id_parcela"],
            "nome_cliente": parcela["nome_cliente"],
            "valor_original": valor_original,
            "valor_pago": round(valor_pago, 2),
            "saldo_aberto": saldo,
            "vencimento": parcela["vencimento"].strftime("%d/%m/%Y"),
            "situacao": situacao
        })

    return jsonify({
        "colaborador": colaborador["nome"],
        "quantidade": len(resultado),
        "parcelas": resultado
    }), 200


@app.route("/dashboard", methods=["GET"])
def dashboard():

    parcelas = list(parcelas_collection.find({
        "id_parcela": {"$exists": True}
    }))

    hoje = datetime.now().date()

    total_original = 0
    total_recuperado = 0

    parcelas_pagas = 0
    parcelas_pendentes = 0
    parcelas_atrasadas = 0

    for parcela in parcelas:

        valor_original = parcela["valor_original"]
        total_original += valor_original

        pagamentos = pagamentos_collection.find({
            "id_parcela": parcela["id_parcela"]
        })

        valor_pago = sum(
            pagamento["valor_pago"]
            for pagamento in pagamentos
        )

        total_recuperado += valor_pago

        saldo = valor_original - valor_pago

        if saldo <= 0:
            parcelas_pagas += 1

        elif parcela["vencimento"].date() < hoje:
            parcelas_atrasadas += 1

        else:
            parcelas_pendentes += 1

    colaboradores_ativos = colaboradores_collection.count_documents({
        "status": "ativo"
    })

    saldo_aberto = total_original - total_recuperado

    return jsonify({
        "total_parcelas": len(parcelas),
        "total_original": round(total_original, 2),
        "total_recuperado": round(total_recuperado, 2),
        "saldo_aberto": round(saldo_aberto, 2),
        "parcelas_pagas": parcelas_pagas,
        "parcelas_pendentes": parcelas_pendentes,
        "parcelas_atrasadas": parcelas_atrasadas,
        "colaboradores_ativos": colaboradores_ativos
    }), 200


@app.route("/pagamentos", methods=["GET"])
def listar_pagamentos():

    pagamentos = list(pagamentos_collection.find())

    resultado = []

    for pagamento in pagamentos:

        resultado.append({
            "id_pagamento": pagamento["id_pagamento"],
            "id_parcela": pagamento["id_parcela"],
            "nome_cliente": pagamento["nome_cliente"],
            "nome_colaborador": pagamento["nome_colaborador"],
            "valor_pago": pagamento["valor_pago"],
            "data_pagamento": pagamento["data_pagamento"].strftime("%d/%m/%Y"),
            "forma_pagamento": pagamento["forma_pagamento"]
        })

    return jsonify(resultado), 200


@app.route("/pagamentos/parcela/<id_parcela>", methods=["GET"])
def listar_pagamentos_parcela(id_parcela):

    pagamentos = list(
        pagamentos_collection.find({
            "id_parcela": id_parcela
        })
    )

    resultado = []

    for pagamento in pagamentos:

        resultado.append({
            "id_pagamento": pagamento["id_pagamento"],
            "id_parcela": pagamento["id_parcela"],
            "nome_cliente": pagamento["nome_cliente"],
            "valor_pago": pagamento["valor_pago"],
            "data_pagamento": pagamento["data_pagamento"].strftime("%d/%m/%Y"),
            "forma_pagamento": pagamento["forma_pagamento"]
        })

    return jsonify({
        "id_parcela": id_parcela,
        "quantidade_pagamentos": len(resultado),
        "pagamentos": resultado
    }), 200


@app.route("/pagamentos", methods=["POST"])
def cadastrar_pagamento():
    dados = request.get_json()

    id_parcela = dados.get("id_parcela")
    valor_pago = dados.get("valor_pago")
    forma_pagamento = dados.get("forma_pagamento")

    if not id_parcela or not valor_pago or not forma_pagamento:
        return jsonify({"erro": "Preencha todos os campos"}), 400

    if valor_pago <= 0:
        return jsonify({"erro": "O valor deve ser maior que zero"}), 400

    parcela = parcelas_collection.find_one({
        "id_parcela": id_parcela
    })

    if not parcela:
        return jsonify({"erro": "Parcela não encontrada"}), 404

    pagamentos = pagamentos_collection.find({
        "id_parcela": id_parcela
    })

    total_pago = sum(p["valor_pago"] for p in pagamentos)

    saldo_aberto = parcela["valor_original"] - total_pago

    if valor_pago > saldo_aberto:
        return jsonify({
            "erro": "Pagamento maior que o saldo aberto",
            "saldo_aberto": saldo_aberto
        }), 400

    novo_pagamento = {
        "id_pagamento": "PAG" + str(uuid4()).replace("-", "")[:8].upper(),
        "id_parcela": id_parcela,
        "id_cliente": parcela["id_cliente"],
        "nome_cliente": parcela["nome_cliente"],
        "id_colaborador": parcela["id_colaborador"],
        "nome_colaborador": parcela["nome_colaborador"],
        "data_pagamento": datetime.now(),
        "valor_pago": valor_pago,
        "forma_pagamento": forma_pagamento
    }

    pagamentos_collection.insert_one(novo_pagamento)

    return jsonify({
        "mensagem": "Pagamento registrado com sucesso",
        "saldo_restante": saldo_aberto - valor_pago
    }), 201


@app.route("/historico", methods=["POST"])
def cadastrar_historico():

    dados = request.get_json(silent=True)

    if not dados:
        return jsonify({"erro": "Envie os dados em JSON"}), 400

    id_parcela = dados.get("id_parcela")
    canal = dados.get("canal")
    resultado = dados.get("resultado")
    proxima_acao = dados.get("proxima_acao")

    if not all([id_parcela, canal, resultado, proxima_acao]):
        return jsonify({"erro": "Preencha os campos obrigatórios"}), 400

    parcela = parcelas_collection.find_one({
        "id_parcela": id_parcela
    })

    if not parcela:
        return jsonify({"erro": "Parcela não encontrada"}), 404

    novo_historico = {
        "id_historico": "HIST" + str(uuid4()).replace("-", "")[:8].upper(),
        "id_parcela": id_parcela,
        "id_cliente": parcela["id_cliente"],
        "id_colaborador": parcela["id_colaborador"],
        "data_contato": datetime.now(),
        "canal": canal,
        "resultado": resultado,
        "proxima_acao": proxima_acao,
        "data_proxima_acao": dados.get("data_proxima_acao"),
        "observacao": dados.get("observacao", "")
    }

    historico_collection.insert_one(novo_historico)

    return jsonify({
        "mensagem": "Histórico registrado com sucesso",
        "id_historico": novo_historico["id_historico"]
    }), 201


@app.route("/importar-excel", methods=["POST"])
def importar_excel():

    arquivo = request.files.get("arquivo")

    if not arquivo:
        return jsonify({"erro": "Nenhum arquivo enviado"}), 400

    if not arquivo.filename.lower().endswith(".xlsx"):
        return jsonify({"erro": "Envie um arquivo .xlsx"}), 400

    try:
        workbook = load_workbook(arquivo, data_only=True)

        configuracao = {
            "CLIENTES": (clientes_collection, "id_cliente"),
            "COLABORADORES": (colaboradores_collection, "id_colaborador"),
            "PARCELAS": (parcelas_collection, "id_parcela"),
            "PAGAMENTOS": (pagamentos_collection, "id_pagamento"),
            "HISTORICO_COBRANCA": (historico_collection, "id_historico"),
            "PARAMETROS": (parametros_collection, "parametro")
        }

        resultado = {}

        # Validar se todas as abas existem
        for aba in configuracao:
            if aba not in workbook.sheetnames:
                return jsonify({
                    "erro": f"A aba {aba} não foi encontrada"
                }), 400

        # Processar cada aba
        for nome_aba, (colecao, campo_id) in configuracao.items():

            planilha = workbook[nome_aba]

            cabecalhos = [
                str(celula.value).strip()
                if celula.value is not None else None
                for celula in planilha[1]
            ]

            if campo_id not in cabecalhos:
                return jsonify({
                    "erro": f"Coluna {campo_id} não encontrada na aba {nome_aba}"
                }), 400

            indice_id = cabecalhos.index(campo_id)

            quantidade = 0

            for linha in planilha.iter_rows(min_row=2, values_only=True):

                if not any(valor is not None for valor in linha):
                    continue

                documento = dict(zip(cabecalhos, linha))

                identificador = documento.get(campo_id)

                if identificador is None:
                    continue

                # Atualiza se já existir ou insere se for novo
                colecao.update_one(
                    {campo_id: identificador},
                    {"$set": documento},
                    upsert=True
                )

                quantidade += 1

            resultado[nome_aba] = quantidade

        return jsonify({
            "mensagem": "Importação concluída com sucesso",
            "registros_processados": resultado,
            "total": sum(resultado.values())
        }), 200

    except Exception as erro:
        return jsonify({
            "erro": "Erro ao processar planilha",
            "detalhes": str(erro)
        }), 500


@app.route("/historico", methods=["GET"])
def listar_historico():

    historicos = historico_collection.find().sort(
        "data_contato", -1
    )

    resultado = []

    for item in historicos:
        resultado.append({
            "id_historico": item.get("id_historico"),
            "id_parcela": item.get("id_parcela"),
            "id_cliente": item.get("id_cliente"),
            "id_colaborador": item.get("id_colaborador"),
            "data_contato": (
                item["data_contato"].strftime("%d/%m/%Y")
                if hasattr(item.get("data_contato"), "strftime")
                else item.get("data_contato")
            ),
            "canal": item.get("canal"),
            "resultado": item.get("resultado"),
            "proxima_acao": item.get("proxima_acao"),
            "data_proxima_acao": (
                item["data_proxima_acao"].strftime("%d/%m/%Y")
                if hasattr(item.get("data_proxima_acao"), "strftime")
                else item.get("data_proxima_acao")
            ),
            "observacao": item.get("observacao", "")
        })

    return jsonify({
        "quantidade": len(resultado),
        "historicos": resultado
    }), 200

# Inicialização do servidor
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)

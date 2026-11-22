import { g, arr } from './format';
export const nParcela = (r) => { const v = +g(r, 'valor_original', 'valor', 'valor_total') || 0, p = +g(r, 'valor_pago') || 0;
  return { ...r, id: g(r, 'id_parcela', 'id', '_id'), cliente: g(r, 'cliente', 'nome_cliente', 'cliente_nome'), valor: v, pago: p, saldo: +(g(r, 'saldo_aberto', 'saldo') ?? v - p), venc: g(r, 'vencimento', 'data_vencimento'), colab: g(r, 'colaborador', 'nome_colaborador', 'id_colaborador'), status: g(r, 'situacao', 'status') }; };
export const nPag = (r) => ({ ...r, id: g(r, 'id_pagamento', 'id', '_id'), parcela: g(r, 'id_parcela', 'parcela'), cliente: g(r, 'cliente', 'nome_cliente'), colab: g(r, 'colaborador', 'nome_colaborador', 'id_colaborador'), valor: +g(r, 'valor_pago', 'valor') || 0, data: g(r, 'data_pagamento', 'data'), forma: g(r, 'forma_pagamento', 'forma') });
export const nColab = (r) => { const t = +g(r, 'total_recuperado') || 0, c = +g(r, 'percentual_comissao', 'comissao_percentual', 'comissao') || 0;
  return { ...r, id: g(r, 'id_colaborador', 'id', '_id'), nome: g(r, 'nome'), tel: g(r, 'telefone'), email: g(r, 'email'), pct: c, total: t, comissao: +(g(r, 'comissao_calculada', 'valor_comissao') ?? t * c / 100), status: g(r, 'situacao', 'status', 'ativo') }; };
export const list = (d, f) => arr(d).map(f);

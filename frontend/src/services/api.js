const B = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
async function req(path, opt) {
  const r = await fetch(B + path, { headers: { 'Content-Type': 'application/json' }, ...opt });
  if (!r.ok) { let m = ''; try { m = (await r.json()).erro || ''; } catch {} throw new Error(m || `Erro ${r.status} em ${path}`); }
  return r.json();
}
const post = (p, b) => req(p, { method: 'POST', body: JSON.stringify(b) });
export const api = {
  dashboard: () => req('/dashboard'),
  colaboradores: () => req('/colaboradores'),
  colaboradorRelatorio: (id) => req(`/colaboradores/${id}/relatorio`),
  colaboradorParcelas: (id) => req(`/colaboradores/${id}/parcelas`),
  pagamentos: () => req('/pagamentos'),
  pagamentosParcela: (id) => req(`/pagamentos/parcela/${id}`),
  criarPagamento: (b) => post('/pagamentos', b),
  parcelas: () => req('/parcelas'),
  parcelasStatus: (s) => req(`/parcelas/status/${s}`),
  parcelasAtrasadas: () => req('/parcelas/atrasadas'),
  totalAtrasado: () => req('/parcelas/total-atrasado'),
  historico: () => req('/historico'),
  criarHistorico: (b) => post('/historico', b),
};

// ===== Importação de Excel =====
// Endpoint implementado no backend Flask.
// POST multipart/form-data, campo "arquivo".
export const IMPORT_ENDPOINT = '/importar-excel';

// Usa XMLHttpRequest (e não fetch) porque o fetch não informa o progresso de upload.
// Não define Content-Type: o navegador monta o multipart/form-data com o boundary correto.
export function importarExcel(file, onProgress) {
  return new Promise((resolve, reject) => {
    const x = new XMLHttpRequest();
    x.open('POST', B + IMPORT_ENDPOINT);
    x.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    x.onload = () => {
      if (x.status >= 200 && x.status < 300) {
        let body = {}; try { body = JSON.parse(x.responseText); } catch {}
        return resolve(body);
      }
      if (x.status === 404 || x.status === 405) return reject(new Error('ENDPOINT_AUSENTE'));
      let msg = ''; try { msg = JSON.parse(x.responseText).erro; } catch {}
      reject(new Error(msg || `Erro ${x.status} ao importar`));
    };
    x.onerror = () => reject(new Error('API_INDISPONIVEL'));
    const fd = new FormData();
    fd.append('arquivo', file);
    x.send(fd);
  });
}
import { useState } from 'react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Modal, Card } from '../components/ui'; import { nColab, nParcela, list } from '../utils/norm'; import { brl } from '../utils/format';
export default function Colaboradores() {
  const q = useFetch(() => api.colaboradores().then((d) => list(d, nColab))); const [sel, setSel] = useState(null);
  const r = useFetch(() => sel ? Promise.all([api.colaboradorRelatorio(sel.id), api.colaboradorParcelas(sel.id)]).then(([a, b]) => ({ a, p: list(b, nParcela) })) : Promise.resolve(null), [sel?.id]);
  return <><PageHead title="Colaboradores" sub="Desempenho e comissões da equipe" />
    <Card title="Equipe"><Async q={q}>{q.data && <DataTable rows={q.data} onRow={setSel} searchKeys={[['nome'], ['id']]}
      cols={[{ h: 'Nome', k: ['nome'] }, { h: 'ID', k: ['id'] }, { h: 'Telefone', k: ['tel'] }, { h: 'E-mail', k: ['email'] }, { h: 'Comissão', k: ['pct'], f: (v) => v + '%' }, { h: 'Recuperado', k: ['total'], f: brl }, { h: 'Comissão calculada', k: ['comissao'], f: brl }, { h: 'Situação', k: ['status'], f: (v) => v === false ? 'Inativo' : 'Ativo' }]} />}</Async></Card>
    {sel && <Modal title={sel.nome} onClose={() => setSel(null)}>{r.loading ? <p>Carregando…</p> : r.error ? <p className="muted">{r.error}</p> : <>
      <div className="kv">{Object.entries(r.data.a || {}).filter(([, v]) => typeof v !== 'object').map(([k, v]) => [<span key={k}>{k.replace(/_/g, ' ')}</span>, <b key={k + 'v'}>{typeof v === 'number' ? v.toLocaleString('pt-BR') : String(v)}</b>])}</div>
      <h4>Parcelas atribuídas ({r.data.p.length})</h4><ul className="feed">{r.data.p.map((p) => <li key={p.id}>{p.cliente} — {brl(p.saldo)}<small>{p.status}</small></li>)}</ul></>}</Modal>}</>;
}

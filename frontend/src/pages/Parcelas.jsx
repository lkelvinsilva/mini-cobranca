import { useState } from 'react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Modal, Card, Badge, Stat } from '../components/ui'; import { nParcela, nPag, list } from '../utils/norm'; import { brl, date, statusOf } from '../utils/format';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'; import { useNavigate } from 'react-router-dom';
export default function Parcelas() {
  const q = useFetch(() => api.parcelas().then((d) => list(d, nParcela))); const [sel, setSel] = useState(null); const nav = useNavigate();
  const h = useFetch(() => sel ? api.pagamentosParcela(sel.id).then((d) => list(d, nPag)) : Promise.resolve([]), [sel?.id]);
  const n = (s) => (q.data || []).filter((x) => statusOf(x.status) === s).length;
  return <><PageHead title="Parcelas" sub="Acompanhe vencimentos, pagamentos e saldos" />
    <div className="grid3"><Stat icon={CheckCircle2} label="Pagas" value={n('ok')} tone="ok" /><Stat icon={Clock} label="Pendentes" value={n('wait')} /><Stat icon={AlertCircle} label="Atrasadas" value={n('late')} tone="late" /></div>
    <Card title="Todas as parcelas"><Async q={q}>{q.data && <DataTable rows={q.data} onRow={setSel} searchKeys={[['cliente'], ['id']]} filters={[{ name: 'Situação', k: ['status'] }, { name: 'Colaborador', k: ['colab'] }]}
      cols={[{ h: 'ID', k: ['id'] }, { h: 'Cliente', k: ['cliente'] }, { h: 'Original', k: ['valor'], f: brl }, { h: 'Pago', k: ['pago'], f: brl }, { h: 'Saldo aberto', k: ['saldo'], f: brl }, { h: 'Vencimento', k: ['venc'], f: date }, { h: 'Colaborador', k: ['colab'] }, { h: 'Situação', k: ['status'], badge: true }]} />}</Async></Card>
    {sel && <Modal title={`Parcela ${sel.id}`} onClose={() => setSel(null)}>
      <div className="kv"><span>Cliente</span><b>{sel.cliente}</b><span>Saldo aberto</span><b>{brl(sel.saldo)}</b><span>Vencimento</span><b>{date(sel.venc)}</b><span>Situação</span><Badge>{sel.status}</Badge></div>
      <h4>Histórico de pagamentos</h4>{h.loading ? <p>Carregando…</p> : h.error ? <p className="muted">{h.error}</p> : (h.data || []).length ? <ul className="feed">{h.data.map((x, i) => <li key={i}><b>{brl(x.valor)}</b><small>{date(x.data)} · {x.forma || '—'}</small></li>)}</ul> : <p className="muted">Nenhum pagamento registrado.</p>}
      <button className="btn" onClick={() => nav('/pagamentos?parcela=' + sel.id)}>Registrar pagamento</button></Modal>}</>;
}

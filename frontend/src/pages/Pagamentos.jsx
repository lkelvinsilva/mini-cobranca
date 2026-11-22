import { useState } from 'react';
import { useSearchParams } from 'react-router-dom'; import { Plus } from 'lucide-react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api'; import { useToast } from '../context/Toast';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Modal, Card, Field } from '../components/ui'; import { nPag, nParcela, list } from '../utils/norm'; import { brl, date } from '../utils/format';
export default function Pagamentos() {
  const [sp] = useSearchParams(); const toast = useToast();
  const q = useFetch(() => api.pagamentos().then((d) => list(d, nPag))); const ps = useFetch(() => api.parcelas().then((d) => list(d, nParcela)));
  const [open, setOpen] = useState(!!sp.get('parcela')); const [f, setF] = useState({ id_parcela: sp.get('parcela') || '', valor: '', forma_pagamento: 'PIX' }); const [busy, setBusy] = useState(false); const [ask, setAsk] = useState(false);
  const par = (ps.data || []).find((p) => String(p.id) === String(f.id_parcela)); const restante = par ? par.saldo - (+f.valor || 0) : null;
  const save = async () => { setBusy(true); try { await api.criarPagamento({ id_parcela: f.id_parcela, valor_pago: +f.valor, forma_pagamento: f.forma_pagamento }); toast('Pagamento registrado'); setOpen(false); setAsk(false); q.reload(); ps.reload(); } catch (e) { toast(e.message, 'err'); setAsk(false); } setBusy(false); };
  return <><PageHead title="Pagamentos" sub="Recebimentos registrados"><button className="btn" onClick={() => setOpen(true)}><Plus size={16} />Novo pagamento</button></PageHead>
    <Card title="Pagamentos"><Async q={q}>{q.data && <DataTable rows={q.data} searchKeys={[['cliente'], ['parcela'], ['id']]} filters={[{ name: 'Forma', k: ['forma'] }]}
      cols={[{ h: 'ID', k: ['id'] }, { h: 'Cliente', k: ['cliente'] }, { h: 'Parcela', k: ['parcela'] }, { h: 'Colaborador', k: ['colab'] }, { h: 'Valor', k: ['valor'], f: brl }, { h: 'Data', k: ['data'], f: date }, { h: 'Forma', k: ['forma'] }]} />}</Async></Card>
    {open && <Modal title="Novo pagamento" onClose={() => setOpen(false)}>
      <Field label="Parcela"><select value={f.id_parcela} onChange={(e) => setF({ ...f, id_parcela: e.target.value })}><option value="">Selecione…</option>{(ps.data || []).filter((p) => p.saldo > 0).map((p) => <option key={p.id} value={p.id}>{p.id} · {p.cliente} · {brl(p.saldo)}</option>)}</select></Field>
      <Field label="Valor"><input type="number" step="0.01" value={f.valor} onChange={(e) => setF({ ...f, valor: e.target.value })} /></Field>
      <Field label="Forma de pagamento"><select value={f.forma_pagamento} onChange={(e) => setF({ ...f, forma_pagamento: e.target.value })}>{['PIX', 'Boleto', 'Dinheiro', 'Cartão', 'Transferência'].map((x) => <option key={x}>{x}</option>)}</select></Field>
      {par && <div className={'note ' + (restante < 0 ? 'err' : '')}>Saldo atual {brl(par.saldo)} → restante após pagamento: <b>{brl(restante)}</b></div>}
      {!ask ? <button className="btn" disabled={!par || !(+f.valor > 0) || restante < 0} onClick={() => setAsk(true)}>Revisar</button>
        : <div className="note">Confirmar pagamento de <b>{brl(+f.valor)}</b> na parcela {f.id_parcela}? <button className="btn" disabled={busy} onClick={save}>{busy ? 'Salvando…' : 'Confirmar'}</button></div>}</Modal>}</>;
}

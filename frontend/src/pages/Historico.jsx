import { useState } from 'react'; import { Plus } from 'lucide-react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api'; import { useToast } from '../context/Toast';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Modal, Card, Field } from '../components/ui'; import { nParcela, list } from '../utils/norm'; import { g, date } from '../utils/format';
const T = [['Cliente'], ['Colaborador']];
export default function Historico() {
  const toast = useToast(); const q = useFetch(() => api.historico().then((d) => list(d, (r) => r))); const ps = useFetch(() => api.parcelas().then((d) => list(d, nParcela)));
  const [open, setOpen] = useState(false); const e0 = { id_parcela: '', canal: 'WhatsApp', resultado: '', proxima_acao: '', data_proxima_acao: '', observacao: '' }; const [f, setF] = useState(e0);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async () => { try { await api.criarHistorico(f); toast('Histórico adicionado'); setOpen(false); setF(e0); q.reload(); } catch (e) { toast(e.message, 'err'); } };
  return <><PageHead title="Histórico de cobrança" sub="Contatos realizados e próximas ações"><button className="btn" onClick={() => setOpen(true)}><Plus size={16} />Novo contato</button></PageHead>
    <Card title="Contatos"><Async q={q}>{q.data && <DataTable rows={q.data} searchKeys={[['cliente', 'nome_cliente'], ['id_parcela'], ['observacao']]} filters={[{ name: 'Canal', k: ['canal'] }, { name: 'Resultado', k: ['resultado'] }]}
      cols={[{ h: 'ID', k: ['id_historico', 'id', '_id'] }, { h: 'Parcela', k: ['id_parcela'] }, { h: 'Cliente', k: ['cliente', 'nome_cliente'] }, { h: 'Colaborador', k: ['colaborador', 'id_colaborador'] }, { h: 'Contato', k: ['data_contato', 'data'], f: date }, { h: 'Canal', k: ['canal'] }, { h: 'Resultado', k: ['resultado'] }, { h: 'Próxima ação', k: ['proxima_acao'] }, { h: 'Data', k: ['data_proxima_acao'], f: date }, { h: 'Observação', k: ['observacao'] }]} />}</Async></Card>
    {open && <Modal title="Novo contato" onClose={() => setOpen(false)}>
      <Field label="Parcela"><select value={f.id_parcela} onChange={set('id_parcela')}><option value="">Selecione…</option>{(ps.data || []).map((p) => <option key={p.id} value={p.id}>{p.id} · {p.cliente}</option>)}</select></Field>
      <Field label="Canal"><select value={f.canal} onChange={set('canal')}>{['WhatsApp', 'Ligação', 'E-mail', 'SMS', 'Presencial'].map((x) => <option key={x}>{x}</option>)}</select></Field>
      <Field label="Resultado"><input value={f.resultado} onChange={set('resultado')} placeholder="Ex.: Promessa de pagamento" /></Field>
      <Field label="Próxima ação"><input value={f.proxima_acao} onChange={set('proxima_acao')} /></Field>
      <Field label="Data da próxima ação"><input type="date" value={f.data_proxima_acao} onChange={set('data_proxima_acao')} /></Field>
      <Field label="Observação"><textarea rows="3" value={f.observacao} onChange={set('observacao')} /></Field>
      <button className="btn" disabled={!f.id_parcela || !f.resultado} onClick={save}>Salvar contato</button></Modal>}</>;
}

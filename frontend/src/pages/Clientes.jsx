import { useState } from 'react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Modal, Card, MockTag } from '../components/ui'; import { nParcela, list } from '../utils/norm'; import { brl, statusOf, g } from '../utils/format';
// Não existe endpoint /clientes: clientes são derivados de /parcelas. Telefone/e-mail só aparecem se a API os enviar.
export default function Clientes() {
  const q = useFetch(() => api.parcelas().then((d) => { const m = {}; list(d, nParcela).forEach((p) => { const c = m[p.cliente] ||= { nome: p.cliente, tel: g(p, 'telefone', 'telefone_cliente'), email: g(p, 'email', 'email_cliente'), qtd: 0, saldo: 0, atraso: false, parcelas: [] }; c.qtd++; c.saldo += p.saldo; c.atraso ||= statusOf(p.status) === 'late'; c.parcelas.push(p); }); return Object.values(m).map((c) => ({ ...c, status: c.atraso ? 'Atrasado' : c.saldo > 0 ? 'Pendente' : 'Quitado' })); }));
  const [sel, setSel] = useState(null);
  return <><PageHead title="Clientes" sub="Derivados das parcelas (a API não possui endpoint de clientes)" />
    <Card title="Carteira de clientes"><Async q={q}>{q.data && <DataTable rows={q.data} onRow={setSel} searchKeys={[['nome'], ['email']]} filters={[{ name: 'Situação', k: ['status'] }]}
      cols={[{ h: 'Nome', k: ['nome'] }, { h: 'Telefone', k: ['tel'] }, { h: 'E-mail', k: ['email'] }, { h: 'Parcelas', k: ['qtd'] }, { h: 'Saldo em aberto', k: ['saldo'], f: brl }, { h: 'Situação', k: ['status'], badge: true }]} />}</Async></Card>
    {sel && <Modal title={sel.nome} onClose={() => setSel(null)}><p className="muted">Saldo em aberto: <b>{brl(sel.saldo)}</b> · {sel.qtd} parcela(s)</p>
      <ul className="feed">{sel.parcelas.map((p) => <li key={p.id}>Parcela {p.id} — {brl(p.saldo)}<small>{p.status}</small></li>)}</ul></Modal>}</>;
}

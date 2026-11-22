import { useState } from 'react';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api';
import DataTable from '../components/DataTable'; import Async from '../components/Async'; import PageHead from '../components/PageHead';
import { Card, Stat } from '../components/ui'; import { nPag, nColab, nParcela, list } from '../utils/norm'; import { brl, date, statusOf } from '../utils/format';
import { TrendingUp, CircleDollarSign, Percent, AlertCircle } from 'lucide-react';
export default function Relatorios() {
  const q = useFetch(async () => { const [p, pg, c, at] = await Promise.all([api.parcelas(), api.pagamentos(), api.colaboradores(), api.totalAtrasado().catch(() => null)]); return { p: list(p, nParcela), pg: list(pg, nPag), c: list(c, nColab), at }; });
  const [de, setDe] = useState(''); const [ate, setAte] = useState(''); const [col, setCol] = useState('');
  return <><PageHead title="Relatórios" sub="Filtre por período e colaborador" />
    <div className="toolbar"><input type="date" value={de} onChange={(e) => setDe(e.target.value)} /><input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
      <select value={col} onChange={(e) => setCol(e.target.value)}><option value="">Todos os colaboradores</option>{(q.data?.c || []).map((c) => <option key={c.id} value={c.nome}>{c.nome}</option>)}</select></div>
    <Async q={q}>{q.data && (() => { const ok = (x, d) => (!col || x.colab === col || x.colab === q.data.c.find((c) => c.nome === col)?.id) && (!de || new Date(d) >= new Date(de)) && (!ate || new Date(d) <= new Date(ate));
      const pg = q.data.pg.filter((x) => ok(x, x.data)); const p = q.data.p.filter((x) => ok(x, x.venc)); const late = p.filter((x) => statusOf(x.status) === 'late');
      const rec = pg.reduce((a, x) => a + x.valor, 0); const cs = q.data.c.filter((c) => !col || c.nome === col);
      return <><div className="grid4"><Stat icon={TrendingUp} label="Total recuperado" value={brl(rec)} tone="ok" /><Stat icon={CircleDollarSign} label="Total em aberto" value={brl(p.reduce((a, x) => a + x.saldo, 0))} /><Stat icon={Percent} label="Comissões" value={brl(cs.reduce((a, c) => a + c.comissao, 0))} /><Stat icon={AlertCircle} label="Total atrasado" value={brl(late.reduce((a, x) => a + x.saldo, 0))} tone="late" /></div>
        <div className="grid2"><Card title="Recuperação e comissões"><DataTable rows={cs} per={5} cols={[{ h: 'Colaborador', k: ['nome'] }, { h: 'Recuperado', k: ['total'], f: brl }, { h: 'Comissão', k: ['comissao'], f: brl }]} /></Card>
          <Card title="Parcelas atrasadas"><DataTable rows={late} per={5} cols={[{ h: 'ID', k: ['id'] }, { h: 'Cliente', k: ['cliente'] }, { h: 'Saldo', k: ['saldo'], f: brl }, { h: 'Venc.', k: ['venc'], f: date }]} /></Card></div>
        <Card title="Histórico de pagamentos"><DataTable rows={pg} cols={[{ h: 'Parcela', k: ['parcela'] }, { h: 'Cliente', k: ['cliente'] }, { h: 'Valor', k: ['valor'], f: brl }, { h: 'Data', k: ['data'], f: date }, { h: 'Forma', k: ['forma'] }]} /></Card></>; })()}</Async></>;
}

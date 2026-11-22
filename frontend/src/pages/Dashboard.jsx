import { Receipt, TrendingUp, CircleDollarSign, CheckCircle2, AlertCircle, Clock, UserCheck, ArrowDownLeft } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import useFetch from '../hooks/useFetch'; import { api } from '../services/api';
import { Card, Empty } from '../components/ui'; import Async from '../components/Async';
import { nParcela, nPag, nColab, list } from '../utils/norm'; import { brl, date } from '../utils/format';

const COR = { ok: '#16a34a', wait: '#f59e0b', late: '#e11d48' };
const NOME = { ok: 'Pagas', wait: 'Pendentes', late: 'Atrasadas' };
const compact = (v) => Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 }).format(v);
const tip = { borderRadius: 12, border: '1px solid #e4ebf5', boxShadow: '0 10px 30px -12px #0a47a044', fontSize: 13 };

// Deduz a situação pelo saldo, pelo texto e pelo vencimento (não depende só do texto da API).
function situacao(p) {
  if (p.valor > 0 && p.saldo <= 0) return 'ok';
  const t = String(p.status || '').toLowerCase();
  if (/atras|venc|inadimpl/.test(t)) return 'late';
  if (p.venc && new Date(p.venc) < new Date(new Date().toDateString())) return 'late';
  return 'wait';
}

const Kpi = ({ icon: I, label, value, tone = 'blue' }) => (
  <div className={'kpi ' + tone}><div className="kpi-ico"><I size={18} /></div><small>{label}</small><strong>{value}</strong></div>
);

export default function Dashboard() {
  const q = useFetch(async () => {
    const [p, pg, c] = await Promise.all([api.parcelas(), api.pagamentos(), api.colaboradores()]);
    return { p: list(p, nParcela), pg: list(pg, nPag), c: list(c, nColab) };
  });
  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });

  return <Async q={q}>{q.data && (() => {
    const { p, pg, c } = q.data;
    const cont = { ok: 0, wait: 0, late: 0 }; p.forEach((x) => cont[situacao(x)]++);
    const rec = pg.reduce((a, x) => a + x.valor, 0), aberto = p.reduce((a, x) => a + Math.max(x.saldo, 0), 0);
    const taxa = rec + aberto > 0 ? Math.round((rec / (rec + aberto)) * 100) : 0;
    const ev = Object.entries(pg.reduce((m, x) => { const d = date(x.data); m[d] = (m[d] || 0) + x.valor; return m; }, {})).map(([d, v]) => ({ d, v }));
    const pie = Object.keys(NOME).map((k) => ({ k, name: NOME[k], value: cont[k] })).filter((x) => x.value > 0);
    const col = c.map((x) => ({ n: x.nome || String(x.id), v: x.total })).sort((a, b) => b.v - a.v);

    return <>
      <div className="dash-hero">
        <div><span className="dash-date">{hoje}</span><h1>Olá, Admin</h1><p>Total recuperado até agora</p><div className="dash-big">{brl(rec)}</div></div>
        <div className="dash-rate"><div className="ring" style={{ '--p': taxa }}><b>{taxa}%</b></div><span>taxa de recuperação</span></div>
      </div>

      <div className="kpis">
        <Kpi icon={Receipt} label="Total de parcelas" value={p.length} />
        <Kpi icon={CircleDollarSign} label="Saldo em aberto" value={brl(aberto)} />
        <Kpi icon={CheckCircle2} label="Parcelas pagas" value={cont.ok} tone="green" />
        <Kpi icon={Clock} label="Parcelas pendentes" value={cont.wait} tone="amber" />
        <Kpi icon={AlertCircle} label="Parcelas atrasadas" value={cont.late} tone="red" />
        <Kpi icon={UserCheck} label="Colaboradores ativos" value={c.length} />
      </div>

      <div className="grid2">
        <Card title="Evolução de valores recuperados">{ev.length
          ? <ResponsiveContainer width="100%" height={260}><AreaChart data={ev} margin={{ left: -8, right: 8, top: 8 }}>
            <defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0a47a0" stopOpacity=".28" /><stop offset="1" stopColor="#38a6ff" stopOpacity="0" /></linearGradient></defs>
            <CartesianGrid stroke="#eaf0f8" vertical={false} /><XAxis dataKey="d" fontSize={11} tickLine={false} axisLine={false} /><YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} />
            <Tooltip formatter={(v) => [brl(v), 'Recuperado']} contentStyle={tip} /><Area dataKey="v" stroke="#0a47a0" strokeWidth={2.5} fill="url(#ga)" dot={{ r: 3, fill: '#0a47a0' }} /></AreaChart></ResponsiveContainer>
          : <Empty text="Nenhum pagamento registrado ainda." />}</Card>

        <Card title="Parcelas por situação">{pie.length
          ? <div className="donut-wrap"><div className="donut"><ResponsiveContainer width="100%" height={220}><PieChart>
            <Pie data={pie} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={3} cornerRadius={6} stroke="none" isAnimationActive={false}>{pie.map((x) => <Cell key={x.k} fill={COR[x.k]} />)}</Pie>
            <Tooltip contentStyle={tip} formatter={(v, n) => [v + ' parcelas', n]} /></PieChart></ResponsiveContainer>
            <div className="donut-c"><b>{p.length}</b><small>parcelas</small></div></div>
            <ul className="legend">{Object.keys(NOME).map((k) => <li key={k}><i style={{ background: COR[k] }} /><span>{NOME[k]}</span><b>{cont[k]}</b><em>{p.length ? Math.round((cont[k] / p.length) * 100) : 0}%</em></li>)}</ul></div>
          : <Empty text="Nenhuma parcela encontrada." />}</Card>
      </div>

      <div className="grid2">
        <Card title="Recuperação por colaborador">{col.length
          ? <ResponsiveContainer width="100%" height={Math.max(200, col.length * 46)}><BarChart data={col} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid stroke="#eaf0f8" horizontal={false} /><XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tickFormatter={compact} /><YAxis type="category" dataKey="n" fontSize={12} width={90} tickLine={false} axisLine={false} />
            <Tooltip formatter={(v) => [brl(v), 'Recuperado']} contentStyle={tip} cursor={{ fill: '#eef4fc' }} /><Bar dataKey="v" fill="#0a47a0" radius={[0, 8, 8, 0]} barSize={18} /></BarChart></ResponsiveContainer>
          : <Empty text="Nenhum colaborador encontrado." />}</Card>

        <Card title="Atividades recentes">{pg.length
          ? <ul className="acts">{pg.slice(-6).reverse().map((x, i) => <li key={i}><div className="act-ico"><ArrowDownLeft size={16} /></div>
            <div><b>{brl(x.valor)}</b><span>Parcela {x.parcela ?? '—'}{x.cliente ? ' · ' + x.cliente : ''}</span></div><small>{date(x.data)}<br />{x.forma || ''}</small></li>)}</ul>
          : <Empty text="Nenhuma atividade ainda." />}</Card>
      </div>
    </>;
  })()}</Async>;
}
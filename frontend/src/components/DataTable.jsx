import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Badge, Empty } from './ui';
import { g } from '../utils/format';
export default function DataTable({ rows, cols, searchKeys = [], filters = [], onRow, per = 8 }) {
  const [q, setQ] = useState(''); const [pg, setPg] = useState(0); const [fv, setFv] = useState({});
  const list = useMemo(() => rows.filter((r) => {
    const hit = !q || searchKeys.some((k) => String(g(r, ...k) ?? '').toLowerCase().includes(q.toLowerCase()));
    return hit && filters.every((f) => !fv[f.name] || String(g(r, ...f.k)) === fv[f.name]);
  }), [rows, q, fv]);
  const pages = Math.max(1, Math.ceil(list.length / per)); const cur = Math.min(pg, pages - 1);
  return <>
    <div className="toolbar">
      <div className="search"><Search size={16} /><input placeholder="Buscar…" value={q} onChange={(e) => { setQ(e.target.value); setPg(0); }} /></div>
      {filters.map((f) => <select key={f.name} value={fv[f.name] || ''} onChange={(e) => { setFv({ ...fv, [f.name]: e.target.value }); setPg(0); }}>
        <option value="">{f.name}: todos</option>{[...new Set(rows.map((r) => g(r, ...f.k)).filter(Boolean))].map((o) => <option key={o}>{o}</option>)}</select>)}
    </div>
    {!list.length ? <Empty text="Nenhum registro encontrado com esses filtros." /> :
      <div className="tw"><table><thead><tr>{cols.map((c) => <th key={c.h}>{c.h}</th>)}</tr></thead><tbody>
        {list.slice(cur * per, cur * per + per).map((r, i) => <tr key={i} onClick={() => onRow?.(r)} className={onRow ? 'click' : ''}>
          {cols.map((c) => { const v = g(r, ...c.k); return <td key={c.h}>{c.badge ? <Badge>{v}</Badge> : c.f ? c.f(v, r) : v ?? '—'}</td>; })}</tr>)}
      </tbody></table></div>}
    <div className="pager"><span>{list.length} registros</span><div>
      <button className="btn ghost" disabled={cur === 0} onClick={() => setPg(cur - 1)}>Anterior</button>
      <span> {cur + 1}/{pages} </span>
      <button className="btn ghost" disabled={cur >= pages - 1} onClick={() => setPg(cur + 1)}>Próxima</button></div></div>
  </>;
}

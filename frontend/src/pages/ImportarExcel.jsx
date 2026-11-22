import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { FileSpreadsheet, UploadCloud, CheckCircle2, AlertTriangle, XCircle, Info, RotateCcw } from 'lucide-react';
import PageHead from '../components/PageHead';
import { Card } from '../components/ui';
import { useToast } from '../context/Toast';
import { importarExcel, IMPORT_ENDPOINT } from '../services/api';

const ABAS = ['CLIENTES', 'COLABORADORES', 'PARCELAS', 'PAGAMENTOS', 'HISTORICO_COBRANCA', 'PARAMETROS'];
const MAX_MB = 10;

// Preencha com os nomes reais das colunas quando você os definir.
// Exemplo: PARCELAS: ['id_parcela', 'cliente', 'valor_original', 'vencimento']
// Enquanto estiver vazio, a validação confere apenas a estrutura (abas, cabeçalhos e linhas).
const COLUNAS_OBRIGATORIAS = { CLIENTES: [], COLABORADORES: [], PARCELAS: [], PAGAMENTOS: [], HISTORICO_COBRANCA: [], PARAMETROS: [] };

const norm = (s) => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase().replace(/\s+/g, '_');

async function lerArquivo(file) {
  const wb = XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const abas = {}; const extras = [];
  wb.SheetNames.forEach((nome) => {
    const k = norm(nome);
    const m = XLSX.utils.sheet_to_json(wb.Sheets[nome], { header: 1, defval: '', raw: false, blankrows: false });
    if (!ABAS.includes(k)) { extras.push(nome); return; }
    const headers = (m[0] || []).map((h) => String(h).trim());
    const rows = m.slice(1).filter((r) => r.some((c) => String(c).trim() !== ''));
    abas[k] = { nome, headers, rows };
  });
  return { abas, extras };
}

function validar({ abas, extras }) {
  const out = [];
  ABAS.forEach((k) => {
    const a = abas[k];
    if (!a) { out.push({ nivel: 'erro', aba: k, msg: 'Aba não encontrada na planilha.' }); return; }
    const hs = a.headers.filter((h) => h !== '');
    if (!hs.length) { out.push({ nivel: 'erro', aba: k, msg: 'Cabeçalho da primeira linha está vazio.' }); return; }
    if (a.headers.some((h, i) => h === '' && i < a.headers.length - 1)) out.push({ nivel: 'aviso', aba: k, msg: 'Há colunas sem nome no cabeçalho.' });
    const dup = hs.filter((h, i) => hs.findIndex((x) => norm(x) === norm(h)) !== i);
    if (dup.length) out.push({ nivel: 'erro', aba: k, msg: `Colunas repetidas: ${[...new Set(dup)].join(', ')}.` });
    const falta = (COLUNAS_OBRIGATORIAS[k] || []).filter((c) => !hs.some((h) => norm(h) === norm(c)));
    if (falta.length) out.push({ nivel: 'erro', aba: k, msg: `Colunas obrigatórias ausentes: ${falta.join(', ')}.` });
    if (!a.rows.length) out.push({ nivel: k === 'PARAMETROS' ? 'aviso' : 'erro', aba: k, msg: 'Nenhum registro encontrado.' });
  });
  extras.forEach((n) => out.push({ nivel: 'aviso', aba: n, msg: 'Aba não reconhecida; será ignorada.' }));
  return out;
}

export default function ImportarExcel() {
  const toast = useToast(); const inp = useRef();
  const [file, setFile] = useState(null); const [parsed, setParsed] = useState(null); const [issues, setIssues] = useState([]);
  const [active, setActive] = useState(ABAS[0]); const [over, setOver] = useState(false);
  const [busy, setBusy] = useState(''); const [prog, setProg] = useState(0); const [msg, setMsg] = useState(null); const [confirm, setConfirm] = useState(false);

  const limpar = () => { setFile(null); setParsed(null); setIssues([]); setMsg(null); setProg(0); setConfirm(false); if (inp.current) inp.current.value = ''; };

  const escolher = async (f) => {
    if (!f) return;
    limpar();
    if (!/\.xlsx$/i.test(f.name)) return setMsg({ tipo: 'err', txt: 'Formato inválido. Envie um arquivo .xlsx.' });
    if (f.size > MAX_MB * 1048576) return setMsg({ tipo: 'err', txt: `Arquivo maior que ${MAX_MB} MB.` });
    setFile(f); setBusy('lendo');
    try {
      const p = await lerArquivo(f); setParsed(p); setIssues(validar(p)); setActive(ABAS.find((a) => p.abas[a]) || ABAS[0]);
    } catch { setFile(null); setMsg({ tipo: 'err', txt: 'Não foi possível ler o arquivo. Ele pode estar corrompido ou protegido por senha.' }); }
    setBusy('');
  };

  const enviar = async () => {
    setConfirm(false); setBusy('enviando'); setProg(0); setMsg(null);
    try {
      const r = await importarExcel(file, setProg); setProg(100);
      setMsg({ tipo: 'ok', txt: r.mensagem || r.message || 'A API confirmou o recebimento do arquivo.' }); toast('Importação concluída');
    } catch (e) {
      setProg(0);
      const txt = e.message === 'ENDPOINT_AUSENTE' ? `A API ainda não possui o endpoint POST ${IMPORT_ENDPOINT}. Nenhum dado foi importado. Ele precisa ser implementado no backend Flask.`
        : e.message === 'API_INDISPONIVEL' ? 'Não foi possível conectar à API. Verifique se o Flask está rodando. Nenhum dado foi importado.' : e.message;
      setMsg({ tipo: 'err', txt }); toast('Importação não realizada', 'err');
    }
    setBusy('');
  };

  const erros = issues.filter((i) => i.nivel === 'erro').length; const avisos = issues.length - erros;
  const pode = parsed && !erros && !busy; const a = parsed?.abas[active];

  return <><PageHead title="Importar Excel" sub="Envie a planilha com as seis abas do sistema" />
    <div className="imp-banner"><Info size={18} /><div><b>Backend pendente.</b> A API Flask ainda precisa implementar <code>POST {IMPORT_ENDPOINT}</code> (multipart/form-data, campo <code>arquivo</code>). Leitura, pré-visualização e validação funcionam aqui no navegador, mas o botão “Importar dados” só terá efeito depois que esse endpoint existir.</div></div>

    <Card title="Arquivo">
      <div className={'imp-drop ' + (over ? 'over ' : '') + (file ? 'has-file' : '')} onClick={() => inp.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); escolher(e.dataTransfer.files[0]); }}>
        {file ? <FileSpreadsheet size={34} /> : <UploadCloud size={34} />}
        <strong>{file ? file.name : 'Arraste a planilha aqui'}</strong>
        <span>{file ? `${(file.size / 1024).toFixed(0)} KB` : `ou clique para selecionar · .xlsx até ${MAX_MB} MB`}</span>
        <input ref={inp} type="file" accept=".xlsx" hidden onChange={(e) => escolher(e.target.files[0])} />
      </div>
      <div className="imp-actions"><button className="btn ghost" onClick={() => inp.current.click()}><FileSpreadsheet size={16} />Selecionar arquivo .xlsx</button>
        {file && <button className="btn ghost" onClick={limpar} disabled={busy === 'enviando'}><RotateCcw size={16} />Trocar arquivo</button>}</div>
      {busy === 'lendo' && <p className="muted">Lendo planilha…</p>}
    </Card>

    {parsed && <>
      <Card title="Registros por aba"><div className="imp-sheets">{ABAS.map((k) => { const s = parsed.abas[k]; const bad = issues.some((i) => i.aba === k && i.nivel === 'erro');
        return <button key={k} className={'imp-sheet ' + (bad ? 'bad ' : 'ok ') + (active === k ? 'active' : '')} onClick={() => s && setActive(k)} disabled={!s}>
          {bad ? <XCircle size={16} /> : <CheckCircle2 size={16} />}<span>{k}</span><b>{s ? s.rows.length : '—'}</b><small>{s ? 'registros' : 'ausente'}</small></button>; })}</div></Card>

      <Card title="Validação" right={<span className="muted">{erros} erro(s) · {avisos} aviso(s)</span>}>
        {issues.length ? <ul className="imp-issues">{issues.map((i, n) => <li key={n} className={'imp-issue ' + i.nivel}>{i.nivel === 'erro' ? <XCircle size={16} /> : <AlertTriangle size={16} />}<b>{i.aba}</b> {i.msg}</li>)}</ul>
          : <p className="imp-issue ok"><CheckCircle2 size={16} />Estrutura válida: seis abas encontradas, com cabeçalho e registros.</p>}
        <p className="muted imp-note">Esta validação confere só a estrutura da planilha. Regras de negócio (cliente inexistente, parcela duplicada etc.) precisam ser validadas também pelo backend.</p>
      </Card>

      {a && <Card title={`Pré-visualização · ${active}`} right={<span className="muted">primeiras {Math.min(8, a.rows.length)} de {a.rows.length} linhas</span>}>
        <div className="tw"><table><thead><tr>{a.headers.map((h, i) => <th key={i}>{h || '(sem nome)'}</th>)}</tr></thead>
          <tbody>{a.rows.slice(0, 8).map((r, i) => <tr key={i}>{a.headers.map((_, j) => <td key={j}>{String(r[j] ?? '') || '—'}</td>)}</tr>)}</tbody></table></div></Card>}

      <Card title="Importação">
        {busy === 'enviando' && <div className="imp-progress"><div><i style={{ width: prog + '%' }} /></div><span>Enviando… {prog}%</span></div>}
        {!confirm ? <button className="btn" disabled={!pode} onClick={() => setConfirm(true)}><UploadCloud size={16} />Importar dados</button>
          : <div className="note">Enviar <b>{file.name}</b> para a API? <button className="btn" onClick={enviar}>Confirmar envio</button><button className="btn ghost" onClick={() => setConfirm(false)}>Cancelar</button></div>}
        {erros > 0 && <p className="muted imp-note">Corrija os erros de validação para liberar a importação.</p>}
      </Card></>}

    {msg && <div className={'imp-result ' + msg.tipo}>{msg.tipo === 'ok' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}<p>{msg.txt}</p></div>}
  </>;
}
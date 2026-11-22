export const arr = (d) => Array.isArray(d) ? d : (Object.values(d || {}).find(Array.isArray) || []);
export const g = (o, ...k) => { for (const x of k) if (o?.[x] !== undefined && o[x] !== null) return o[x]; return undefined; };
export const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const date = (v) => { if (!v) return '—'; const d = new Date(v); return isNaN(d) ? String(v) : d.toLocaleDateString('pt-BR'); };
export const statusOf = (s = '') => { s = String(s).toLowerCase(); return s.includes('atras') ? 'late' : s.includes('pag') || s.includes('quit') ? 'ok' : s.includes('pend') || s.includes('abert') ? 'wait' : 'idle'; };

import { X, Inbox, AlertTriangle } from 'lucide-react';
import { statusOf } from '../utils/format';

const imgs = import.meta.glob('../assets/logo.{png,svg,webp,jpg}', { eager: true, import: 'default' });
const img = Object.values(imgs)[0];

export const Logo = ({ light }) => img ? <img className="logo-img" src={img} alt="Mini Cobrança" /> : (
  <div className={'logo ' + (light ? 'light' : '')}>
    <svg viewBox="0 0 120 22" width="96"><path d="M2 14C30 2 70 0 118 12C74 6 36 8 2 14Z" fill="currentColor" /></svg>
    <b>MINI</b><span>Cobrança</span>
  </div>
);
export const Badge = ({ children }) => <span className={'badge ' + statusOf(children)}>{children || '—'}</span>;
export const Stat = ({ icon: I, label, value, tone = '' }) => (
  <div className={'card stat ' + tone}><div className="ico"><I size={18} /></div><div><small>{label}</small><strong>{value}</strong></div></div>
);
export const Card = ({ title, children, right }) => <section className="card"><div className="card-h"><h3>{title}</h3>{right}</div>{children}</section>;
export const Loading = () => <div className="skel"><i /><i /><i /></div>;
export const ErrorBox = ({ msg, retry }) => (
  <div className="empty err"><AlertTriangle size={28} /><p>{msg}</p>{retry && <button className="btn" onClick={retry}>Tentar novamente</button>}</div>
);
export const Empty = ({ text = 'Nada por aqui ainda.' }) => <div className="empty"><Inbox size={28} /><p>{text}</p></div>;
export const MockTag = () => <span className="mock">DADOS FICTÍCIOS · MOCK</span>;
export function Modal({ title, onClose, children }) {
  return <div className="overlay" onClick={onClose}><div className="modal" onClick={(e) => e.stopPropagation()}>
    <div className="card-h"><h3>{title}</h3><button className="icon" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
export const Field = ({ label, children }) => <label className="field"><span>{label}</span>{children}</label>;
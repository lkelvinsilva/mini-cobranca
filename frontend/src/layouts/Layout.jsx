import { NavLink, Outlet } from 'react-router-dom';
import { useState } from 'react';
import { LayoutDashboard, Receipt, Users, UserCheck, Wallet, History, FileSpreadsheet, BarChart3, Settings, Search, Bell, Menu } from 'lucide-react';
import { Logo } from '../components/ui';
const nav = [['/', 'Dashboard', LayoutDashboard], ['/parcelas', 'Parcelas', Receipt], ['/clientes', 'Clientes', Users], ['/colaboradores', 'Colaboradores', UserCheck], ['/pagamentos', 'Pagamentos', Wallet], ['/historico', 'Histórico de cobrança', History], ['/importar', 'Importar Excel', FileSpreadsheet], ['/relatorios', 'Relatórios', BarChart3], ['/configuracoes', 'Configurações', Settings]];
export default function Layout() {
  const [open, setOpen] = useState(false);
  return <div className="shell">
    <aside className={open ? 'open' : ''}><Logo light />
      <nav>{nav.map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setOpen(false)}><I size={18} />{l}</NavLink>)}</nav>
      <div className="side-f">Protótipo demonstrativo</div></aside>
    <div className="main"><header>
      <button className="icon mob" onClick={() => setOpen(!open)}><Menu /></button>
      <strong className="sys">Sistema Simplo de Cobrança</strong>
      <div className="search top"><Search size={16} /><input placeholder="Pesquisar no sistema…" /></div>
      <span className="env">PROTÓTIPO</span><button className="icon"><Bell size={18} /><i className="dot" /></button>
      <div className="user"><span>AD</span><div><b>Admin</b><small>Demonstração</small></div></div></header>
      <main><Outlet /></main></div></div>;
}
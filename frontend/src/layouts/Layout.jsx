import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LayoutDashboard, Receipt, Users, UserCheck, Wallet, History, FileSpreadsheet, BarChart3, Settings, Search, Bell, Menu, X } from 'lucide-react';
import { Logo } from '../components/ui';

const nav = [['/', 'Dashboard', LayoutDashboard], ['/parcelas', 'Parcelas', Receipt], ['/clientes', 'Clientes', Users], ['/colaboradores', 'Colaboradores', UserCheck], ['/pagamentos', 'Pagamentos', Wallet], ['/historico', 'Histórico de cobrança', History], ['/importar', 'Importar Excel', FileSpreadsheet], ['/relatorios', 'Relatórios', BarChart3], ['/configuracoes', 'Configurações', Settings]];

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); window.scrollTo(0, 0); }, [pathname]);
  useEffect(() => { document.body.style.overflow = open ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [open]);

  return <div className="shell">
    <div className={'backdrop ' + (open ? 'show' : '')} onClick={() => setOpen(false)} />
    <aside className={open ? 'open' : ''}>
      <div className="aside-top"><Logo light /><button className="icon close-menu" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={20} /></button></div>
      <nav>{nav.map(([to, l, I]) => <NavLink key={to} to={to} end={to === '/'}><I size={18} />{l}</NavLink>)}</nav>
      <div className="side-f">Protótipo demonstrativo</div>
    </aside>
    <div className="main">
      <header>
        <button className="icon mob" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu /></button>
        <strong className="sys text-sm">
  Sistema Simplo de Cobrança
</strong>
        <div className="search top"><Search size={16} /><input placeholder="Pesquisar no sistema…" /></div>
        <span className="env">PROTÓTIPO</span>
        <button className="icon" aria-label="Notificações"><Bell size={18} /><i className="dot" /></button>
        <div className="user"><span>AD</span><div><b>Admin</b><small>Demonstração</small></div></div>
      </header>
      <main><Outlet /></main>
    </div>
  </div>;
}
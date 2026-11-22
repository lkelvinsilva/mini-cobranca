import React from 'react'; import ReactDOM from 'react-dom/client'; import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'; import { ToastProvider } from './context/Toast'; import Layout from './layouts/Layout';
import Dashboard from './pages/Dashboard'; import Parcelas from './pages/Parcelas'; import Clientes from './pages/Clientes'; import Colaboradores from './pages/Colaboradores';
import Pagamentos from './pages/Pagamentos'; import Historico from './pages/Historico'; import Relatorios from './pages/Relatorios'; import Configuracoes from './pages/Configuracoes'; import Login from './pages/Login';
import ImportarExcel from './pages/ImportarExcel';
ReactDOM.createRoot(document.getElementById('root')).render(<ToastProvider><BrowserRouter><Routes><Route path="/login" element={<Login />} />
  <Route element={<Layout />}><Route index element={<Dashboard />} /><Route path="parcelas" element={<Parcelas />} /><Route path="clientes" element={<Clientes />} /><Route path="colaboradores" element={<Colaboradores />} />
    <Route path="pagamentos" element={<Pagamentos />} /><Route path="historico" element={<Historico />} /><Route path="importar" element={<ImportarExcel />} /><Route path="relatorios" element={<Relatorios />} /><Route path="configuracoes" element={<Configuracoes />} /></Route></Routes></BrowserRouter></ToastProvider>);
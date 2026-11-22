import { useNavigate } from 'react-router-dom'; import { Logo } from '../components/ui';
export default function Login() {
  const nav = useNavigate();
  return <div className="login"><div className="login-card"><Logo /><h1>Entrar no Mini Cobrança</h1><p>Acesso demonstrativo, sem autenticação real.</p>
    <input placeholder="E-mail" defaultValue="admin@demo.com" /><input type="password" placeholder="Senha" defaultValue="demo1234" /><button className="btn" onClick={() => nav('/')}>Entrar</button></div></div>;
}

import PageHead from '../components/PageHead'; import { Card, MockTag } from '../components/ui';
export default function Configuracoes() {
  return <><PageHead title="Configurações" sub="Preferências do sistema"><MockTag /></PageHead>
    <Card title="Conexão com a API"><div className="kv"><span>URL da API</span><b>{import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'}</b><span>Ambiente</span><b>Protótipo</b></div></Card>
    <Card title="Preferências (demonstrativo)"><div className="kv"><span>Idioma</span><b>Português (Brasil)</b><span>Moeda</span><b>BRL</b><span>Notificações por e-mail</span><b>Ativadas</b></div></Card></>;
}

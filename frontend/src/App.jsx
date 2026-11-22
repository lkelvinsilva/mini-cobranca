
import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados");
        return res.json();
      })
      .then((dados) => setDashboard(dados))
      .catch(() => setErro("Não foi possível conectar à API Flask"));
  }, []);

  if (erro) return <h2>{erro}</h2>;
  if (!dashboard) return <h2>Carregando dashboard...</h2>;

  const indicadores = [
    ["Total de parcelas", dashboard.total_parcelas],
    ["Parcelas pagas", dashboard.parcelas_pagas],
    ["Parcelas atrasadas", dashboard.parcelas_atrasadas],
    ["Parcelas pendentes", dashboard.parcelas_pendentes],
    ["Total recuperado", dashboard.total_recuperado],
    ["Saldo em aberto", dashboard.saldo_aberto],
  ];

  return (
    <div className="app">
      <aside className="sidebar">
        <h2>Prototipo Sistema Simplo de Cobrança</h2>
        <p>Dashboard</p>
        <p>Parcelas</p>
        <p>Colaboradores</p>
        <p>Pagamentos</p>
        <p>Histórico</p>
      </aside>

      <main className="content">
        <h1>Dashboard</h1>
        <p>Visão geral da gestão de cobrança</p>

        <div className="cards">
          {indicadores.map(([titulo, valor]) => (
            <div className="card" key={titulo}>
              <h3>{titulo}</h3>
              <strong>
                {titulo.includes("Total recuperado") ||
                titulo.includes("Saldo em aberto")
                  ? `R$ ${Number(valor).toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}`
                  : valor}
              </strong>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;

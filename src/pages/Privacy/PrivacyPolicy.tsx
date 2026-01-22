import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
  return (
    <main style={{ maxWidth: 860, margin: "0 auto", padding: 24 }}>
      <h1>Política de Privacidade</h1>

      <p>
        Este sistema foi projetado para permitir o envio de denúncias <strong>sem identificação do usuário</strong>.
      </p>

      <h2>1) Quais dados são coletados</h2>
      <ul>
        <li>Tipo da denúncia</li>
        <li>Descrição da denúncia</li>
        <li>Data/hora automática de registro</li>
      </ul>

      <h2>2) O que não coletamos</h2>
      <ul>
        <li>Nome, e-mail, CPF, telefone</li>
        <li>Endereço, dados bancários</li>
        <li>Qualquer identificador pessoal</li>
      </ul>

      <h2>3) Onde os dados ficam armazenados</h2>
      <p>As denúncias ficam armazenadas localmente no navegador (localStorage). Não há envio para servidor.</p>

      <h2>4) Retenção</h2>
      <p>As denúncias são mantidas por até <strong>30 dias</strong> e removidas automaticamente.</p>

      <h2>5) Prevenção de dados sensíveis</h2>
      <p>
        O formulário bloqueia o envio quando identifica possíveis dados pessoais (ex.: e-mail, telefone, CPF) para evitar
        coleta acidental.
      </p>

      <p style={{ marginTop: 16 }}>
        <Link to="/">Voltar</Link>
      </p>
    </main>
  );
}
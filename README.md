## Envio de denuncia por e-mail com anexo

O projeto usa backend proprio com Nodemailer para enviar a denuncia para o e-mail do orgao responsavel, com suporte a anexo sem depender do plano pago do EmailJS.

### 1) Configurar variaveis de ambiente

Crie um arquivo `.env` na raiz usando como base o `.env.example`:

```
VITE_REPORT_API_URL=http://localhost:8787/api/reports/email

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
MAIL_FROM="Sistema de Denuncia Anonima <your_email@gmail.com>"
```

### 2) Sobre a senha do Gmail

Para Gmail, use senha de app (Google Account > Seguranca > Senhas de app), nao a senha normal da conta.

### 3) Rodar frontend e backend

Em um terminal:

```
npm run server
```

Em outro terminal:

```
npm run dev
```

### 4) Fluxo de envio

- Destino do e-mail: definido por categoria em `src/data/categories.json`
- Assunto: `Denuncia <numero_da_denuncia>`
- Conteudo: categoria, local, descricao e contato de resposta
- Anexo: arquivo selecionado no formulario

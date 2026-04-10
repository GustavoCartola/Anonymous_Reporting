import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import pg from "pg";

const app = express();
const port = Number(process.env.PORTA_SERVIDOR || process.env.SERVER_PORT || 8787);
const { Pool } = pg;

const pool = new Pool({
  host: process.env.BANCO_HOST || process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.BANCO_PORTA || process.env.DATABASE_PORT || 5432),
  database: process.env.BANCO_NOME || process.env.DATABASE_NAME || "Denux",
  user: process.env.BANCO_USUARIO || process.env.DATABASE_USER || "postgres",
  password: process.env.BANCO_SENHA || process.env.DATABASE_PASSWORD || "",
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true }));
app.use(express.json());

const CATEGORIAS_INICIAIS = [
  { chave: "mlr", rotulo: "Violência contra a mulher", email: "amumugranada@gmail.com" },
  { chave: "frt", rotulo: "Furto/Roubo", email: "amumugranada@gmail.com" },
  { chave: "cns", rotulo: "Violação dos direitos do consumidor", email: "amumugranada@gmail.com" },
];

async function tabelaExiste(nomeTabela) {
  const resultado = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS existe`,
    [nomeTabela]
  );

  return resultado.rows[0]?.existe === true;
}

async function colunaExiste(nomeTabela, nomeColuna) {
  const resultado = await pool.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS existe`,
    [nomeTabela, nomeColuna]
  );

  return resultado.rows[0]?.existe === true;
}

async function renomearTabelaSeNecessario(nomeAntigo, nomeNovo) {
  const antigaExiste = await tabelaExiste(nomeAntigo);
  const novaExiste = await tabelaExiste(nomeNovo);
  if (antigaExiste && !novaExiste) {
    await pool.query(`ALTER TABLE ${nomeAntigo} RENAME TO ${nomeNovo};`);
  }
}

async function renomearColunaSeNecessario(nomeTabela, colunaAntiga, colunaNova) {
  const antigaExiste = await colunaExiste(nomeTabela, colunaAntiga);
  const novaExiste = await colunaExiste(nomeTabela, colunaNova);
  if (antigaExiste && !novaExiste) {
    await pool.query(`ALTER TABLE ${nomeTabela} RENAME COLUMN ${colunaAntiga} TO ${colunaNova};`);
  }
}

async function inicializarBancoDeDados() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

  await renomearTabelaSeNecessario("categories", "categorias");
  await renomearTabelaSeNecessario("reports", "denuncias");
  await renomearTabelaSeNecessario("report_attachments", "anexos_denuncia");

  await renomearColunaSeNecessario("categorias", "key", "chave");
  await renomearColunaSeNecessario("categorias", "label", "rotulo");
  await renomearColunaSeNecessario("denuncias", "category", "categoria");
  await renomearColunaSeNecessario("denuncias", "description", "descricao");
  await renomearColunaSeNecessario("denuncias", "location", "localizacao");
  await renomearColunaSeNecessario("denuncias", "created_at", "criado_em");
  await renomearColunaSeNecessario("anexos_denuncia", "report_id", "denuncia_id");
  await renomearColunaSeNecessario("anexos_denuncia", "attachment_name", "nome_anexo");
  await renomearColunaSeNecessario("anexos_denuncia", "attachment_type", "tipo_anexo");
  await renomearColunaSeNecessario("anexos_denuncia", "attachment_data", "dados_anexo");
  await renomearColunaSeNecessario("anexos_denuncia", "created_at", "criado_em");

  // Tabela 1: categorias
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categorias (
      chave  VARCHAR(20)  PRIMARY KEY,
      rotulo VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `);

  for (const categoria of CATEGORIAS_INICIAIS) {
    await pool.query(
      `INSERT INTO categorias (chave, rotulo, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (chave) DO NOTHING;`,
      [categoria.chave, categoria.rotulo, categoria.email]
    );
  }

  // Tabela 2: denuncias
  await pool.query(`
    CREATE TABLE IF NOT EXISTS denuncias (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      categoria   VARCHAR(20)  NOT NULL,
      descricao   TEXT         NOT NULL,
      localizacao VARCHAR(255),
      criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
    );
  `);

  // Tabela 3: anexos_denuncia
  await pool.query(`
    CREATE TABLE IF NOT EXISTS anexos_denuncia (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      denuncia_id UUID         NOT NULL REFERENCES denuncias(id) ON DELETE CASCADE,
      nome_anexo  VARCHAR(255) NOT NULL,
      tipo_anexo  VARCHAR(120) NOT NULL,
      dados_anexo BYTEA        NOT NULL,
      criado_em   TIMESTAMP    NOT NULL DEFAULT NOW()
    );
  `);

  // Migração: mover anexos antigos embutidos em denuncias para anexos_denuncia
  const possuiColunasAnexo = await pool.query(`
    SELECT COUNT(*) AS n FROM information_schema.columns
    WHERE table_name = 'denuncias' AND column_name = 'dados_anexo';
  `);
  if (Number(possuiColunasAnexo.rows[0].n) > 0) {
    await pool.query(`
      INSERT INTO anexos_denuncia (denuncia_id, nome_anexo, tipo_anexo, dados_anexo, criado_em)
      SELECT id, nome_anexo, tipo_anexo, dados_anexo, criado_em
      FROM denuncias
      WHERE nome_anexo IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM anexos_denuncia ad WHERE ad.denuncia_id = denuncias.id
        );
    `);
    await pool.query("ALTER TABLE denuncias DROP COLUMN IF EXISTS nome_anexo;");
    await pool.query("ALTER TABLE denuncias DROP COLUMN IF EXISTS tipo_anexo;");
    await pool.query("ALTER TABLE denuncias DROP COLUMN IF EXISTS dados_anexo;");
  }

  // FK: denuncias.categoria → categorias.chave
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_denuncias_categoria' AND table_name = 'denuncias'
      ) THEN
        ALTER TABLE denuncias
          ADD CONSTRAINT fk_denuncias_categoria
          FOREIGN KEY (categoria) REFERENCES categorias(chave);
      END IF;
    END $$;
  `);

  await pool.query("CREATE INDEX IF NOT EXISTS idx_denuncias_criado_em ON denuncias(criado_em DESC);");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_denuncias_categoria ON denuncias(categoria);");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_anexos_denuncia_id ON anexos_denuncia(denuncia_id);");
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

async function criarDenuncia(req, res) {
  const cliente = await pool.connect();
  try {
    const { categoria, descricao, localizacao } = req.body;

    if (!categoria || !descricao) {
      return res.status(400).json({ message: "Campos obrigatorios ausentes para salvar denuncia." });
    }

    await cliente.query("BEGIN");

    const resultadoDenuncia = await cliente.query(
      `INSERT INTO denuncias (categoria, descricao, localizacao)
       VALUES ($1, $2, $3)
       RETURNING id, categoria, descricao, localizacao, criado_em`,
      [
        String(categoria).trim(),
        String(descricao).trim(),
        localizacao ? String(localizacao).trim() : null,
      ]
    );
    const denuncia = resultadoDenuncia.rows[0];

    let nomeAnexo = null;
    let tipoAnexo = null;
    if (req.file) {
      const resultadoAnexo = await cliente.query(
        `INSERT INTO anexos_denuncia (denuncia_id, nome_anexo, tipo_anexo, dados_anexo)
         VALUES ($1, $2, $3, $4)
         RETURNING nome_anexo, tipo_anexo`,
        [denuncia.id, req.file.originalname, req.file.mimetype, req.file.buffer]
      );
      nomeAnexo = resultadoAnexo.rows[0].nome_anexo;
      tipoAnexo = resultadoAnexo.rows[0].tipo_anexo;
    }

    await cliente.query("COMMIT");

    return res.status(201).json({
      id: denuncia.id,
      categoria: denuncia.categoria,
      descricao: denuncia.descricao,
      localizacao: denuncia.localizacao,
      nomeAnexo,
      tipoAnexo,
      possuiAnexo: Boolean(nomeAnexo),
      criadoEm: denuncia.criado_em,
    });
  } catch (error) {
    await cliente.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Erro inesperado ao salvar denuncia.";
    return res.status(500).json({ message });
  } finally {
    cliente.release();
  }
}

async function listarDenuncias(req, res) {
  try {
    const limite = Math.min(Number(req.query.limit || 20), 100);
    const resultado = await pool.query(
      `SELECT d.id,
              d.categoria,
              c.rotulo AS rotulo_categoria,
              c.email AS email_categoria,
              d.descricao,
              d.localizacao,
              d.criado_em,
              ad.nome_anexo,
              ad.tipo_anexo
       FROM denuncias d
       JOIN categorias c ON c.chave = d.categoria
       LEFT JOIN anexos_denuncia ad ON ad.denuncia_id = d.id
       ORDER BY d.criado_em DESC
       LIMIT $1`,
      [Number.isFinite(limite) && limite > 0 ? limite : 20]
    );

    const denuncias = resultado.rows.map((row) => ({
      id: row.id,
      categoria: row.categoria,
      rotuloCategoria: row.rotulo_categoria,
      emailCategoria: row.email_categoria,
      descricao: row.descricao,
      localizacao: row.localizacao,
      nomeAnexo: row.nome_anexo,
      tipoAnexo: row.tipo_anexo,
      possuiAnexo: Boolean(row.nome_anexo),
      criadoEm: row.criado_em,
    }));

    return res.json({ denuncias });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao listar denuncias.";
    return res.status(500).json({ message });
  }
}

app.post("/api/denuncias", upload.single("anexo"), criarDenuncia);
app.post("/api/reports", upload.single("attachment"), (req, res, next) => {
  req.body.categoria = req.body.categoria || req.body.category;
  req.body.descricao = req.body.descricao || req.body.description;
  req.body.localizacao = req.body.localizacao || req.body.location;
  next();
}, criarDenuncia);

app.get("/api/denuncias", listarDenuncias);
app.get("/api/reports", listarDenuncias);

async function enviarDenunciaPorEmail(req, res) {
  try {
    const hostSmtp = process.env.EMAIL_SMTP_HOST || process.env.SMTP_HOST;
    const portaSmtp = Number(process.env.EMAIL_SMTP_PORTA || process.env.SMTP_PORT || 587);
    const usuarioSmtp = process.env.EMAIL_SMTP_USUARIO || process.env.SMTP_USER;
    const senhaSmtp = process.env.EMAIL_SMTP_SENHA || process.env.SMTP_PASS;
    const smtpSeguro = (process.env.EMAIL_SMTP_SEGURO || process.env.SMTP_SECURE) === "true";
    const remetenteEmail = process.env.EMAIL_REMETENTE || process.env.MAIL_FROM || usuarioSmtp;

    if (!hostSmtp || !usuarioSmtp || !senhaSmtp) {
      return res.status(500).json({
        message: "Variaveis SMTP ausentes. Configure SMTP_HOST, SMTP_USER e SMTP_PASS.",
      });
    }

    const {
      emailDestino,
      emailRemetente,
      respostaPara,
      numeroDenuncia,
      chaveCategoria,
      rotuloCategoria,
      localizacao,
      descricao,
    } = req.body;

    if (!emailDestino || !numeroDenuncia || !descricao) {
      return res.status(400).json({ message: "Campos obrigatorios ausentes para envio." });
    }

    const transportador = nodemailer.createTransport({
      host: hostSmtp,
      port: portaSmtp,
      secure: smtpSeguro,
      auth: {
        user: usuarioSmtp,
        pass: senhaSmtp,
      },
    });

    const corpoTexto = [
      `Denuncia ${numeroDenuncia}`,
      "",
      `Categoria: ${rotuloCategoria || "Nao informado"} (${chaveCategoria || "-"})`,
      `Local: ${localizacao || "Nao informado"}`,
      "",
      "Descricao:",
      descricao,
      "",
      `Contato de resposta: ${respostaPara || emailRemetente || "Nao informado"}`,
    ].join("\n");

    const corpoHtml = `
      <div style="margin:0;padding:24px;background:#f4f6f8;font-family:Segoe UI,Arial,sans-serif;color:#1f2937;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="background:#0f766e;padding:18px 24px;">
              <h1 style="margin:0;font-size:20px;line-height:1.3;color:#ffffff;">Nova Denuncia Recebida</h1>
              <p style="margin:6px 0 0 0;font-size:13px;color:#ccfbf1;">Sistema de Denuncia Anonima</p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <div style="display:inline-block;background:#ecfeff;color:#155e75;border:1px solid #a5f3fc;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:600;">
                Denuncia ${numeroDenuncia}
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:180px;font-weight:600;color:#334155;">Categoria</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${rotuloCategoria || "Nao informado"} (${chaveCategoria || "-"})</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#334155;">Local</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${localizacao || "Nao informado"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#334155;">Contato para retorno</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${respostaPara || emailRemetente || "Nao informado"}</td>
                </tr>
              </table>
              <div style="margin-top:20px;">
                <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#111827;">Descricao</p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;white-space:pre-line;line-height:1.5;">
                  ${descricao}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const anexos = req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ]
      : [];

    await transportador.sendMail({
      from: remetenteEmail,
      to: emailDestino,
      subject: `Denuncia ${numeroDenuncia}`,
      text: corpoTexto,
      html: corpoHtml,
      replyTo: respostaPara || emailRemetente || undefined,
      attachments: anexos,
    });

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao enviar e-mail.";
    res.status(500).json({ message });
  }
}

app.post("/api/denuncias/email", upload.single("anexo"), enviarDenunciaPorEmail);
app.post("/api/reports/email", upload.single("attachment"), (req, _res, next) => {
  req.body.emailDestino = req.body.emailDestino || req.body.toEmail;
  req.body.emailRemetente = req.body.emailRemetente || req.body.fromEmail;
  req.body.respostaPara = req.body.respostaPara || req.body.replyTo;
  req.body.numeroDenuncia = req.body.numeroDenuncia || req.body.reportNumber;
  req.body.chaveCategoria = req.body.chaveCategoria || req.body.categoryKey;
  req.body.rotuloCategoria = req.body.rotuloCategoria || req.body.categoryLabel;
  req.body.localizacao = req.body.localizacao || req.body.location;
  req.body.descricao = req.body.descricao || req.body.description;
  next();
}, enviarDenunciaPorEmail);

inicializarBancoDeDados()
  .then(() => {
    app.listen(port, () => {
      console.log(`Servidor API ativo em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    const message = error instanceof Error ? error.message : "Erro inesperado na inicializacao do banco.";
    console.error(`Falha ao inicializar banco de dados: ${message}`);
    process.exit(1);
  });

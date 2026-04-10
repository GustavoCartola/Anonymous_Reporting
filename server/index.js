import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";
import pg from "pg";

const app = express();
const port = Number(process.env.SERVER_PORT || 8787);
const { Pool } = pg;

const pool = new Pool({
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 5432),
  database: process.env.DATABASE_NAME || "Denux",
  user: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASSWORD || "",
});

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true }));
app.use(express.json());

const CATEGORIES_SEED = [
  { key: "mlr", label: "Violência contra a mulher", email: "amumugranada@gmail.com" },
  { key: "frt", label: "Furto/Roubo", email: "amumugranada@gmail.com" },
  { key: "cns", label: "Violação dos direitos do consumidor", email: "amumugranada@gmail.com" },
];

async function initializeDatabase() {
  await pool.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");

  // Tabela 1: categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS categories (
      key   VARCHAR(20)  PRIMARY KEY,
      label VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL
    );
  `);

  for (const cat of CATEGORIES_SEED) {
    await pool.query(
      `INSERT INTO categories (key, label, email)
       VALUES ($1, $2, $3)
       ON CONFLICT (key) DO NOTHING;`,
      [cat.key, cat.label, cat.email]
    );
  }

  // Tabela 2: reports (sem colunas de anexo)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category    VARCHAR(20)  NOT NULL,
      description TEXT         NOT NULL,
      location    VARCHAR(255),
      created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
    );
  `);

  // Tabela 3: report_attachments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS report_attachments (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      report_id       UUID         NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
      attachment_name VARCHAR(255) NOT NULL,
      attachment_type VARCHAR(120) NOT NULL,
      attachment_data BYTEA        NOT NULL,
      created_at      TIMESTAMP    NOT NULL DEFAULT NOW()
    );
  `);

  // Migração: mover anexos existentes da tabela reports para report_attachments
  const hasCols = await pool.query(`
    SELECT COUNT(*) AS n FROM information_schema.columns
    WHERE table_name = 'reports' AND column_name = 'attachment_data';
  `);
  if (Number(hasCols.rows[0].n) > 0) {
    await pool.query(`
      INSERT INTO report_attachments (report_id, attachment_name, attachment_type, attachment_data, created_at)
      SELECT id, attachment_name, attachment_type, attachment_data, created_at
      FROM reports
      WHERE attachment_name IS NOT NULL
        AND NOT EXISTS (
          SELECT 1 FROM report_attachments ra WHERE ra.report_id = reports.id
        );
    `);
    await pool.query("ALTER TABLE reports DROP COLUMN IF EXISTS attachment_name;");
    await pool.query("ALTER TABLE reports DROP COLUMN IF EXISTS attachment_type;");
    await pool.query("ALTER TABLE reports DROP COLUMN IF EXISTS attachment_data;");
  }

  // FK: reports.category → categories.key (apenas se ainda não existir)
  await pool.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_reports_category' AND table_name = 'reports'
      ) THEN
        ALTER TABLE reports
          ADD CONSTRAINT fk_reports_category
          FOREIGN KEY (category) REFERENCES categories(key);
      END IF;
    END $$;
  `);

  await pool.query("CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);");
  await pool.query("CREATE INDEX IF NOT EXISTS idx_attachments_report_id ON report_attachments(report_id);");
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/reports", upload.single("attachment"), async (req, res) => {
  const client = await pool.connect();
  try {
    const { category, description, location } = req.body;

    if (!category || !description) {
      return res.status(400).json({ message: "Campos obrigatorios ausentes para salvar denuncia." });
    }

    await client.query("BEGIN");

    const reportResult = await client.query(
      `INSERT INTO reports (category, description, location)
       VALUES ($1, $2, $3)
       RETURNING id, category, description, location, created_at`,
      [
        String(category).trim(),
        String(description).trim(),
        location ? String(location).trim() : null,
      ]
    );
    const report = reportResult.rows[0];

    let attachmentName = null;
    let attachmentType = null;
    if (req.file) {
      const attResult = await client.query(
        `INSERT INTO report_attachments (report_id, attachment_name, attachment_type, attachment_data)
         VALUES ($1, $2, $3, $4)
         RETURNING attachment_name, attachment_type`,
        [report.id, req.file.originalname, req.file.mimetype, req.file.buffer]
      );
      attachmentName = attResult.rows[0].attachment_name;
      attachmentType = attResult.rows[0].attachment_type;
    }

    await client.query("COMMIT");

    return res.status(201).json({
      id: report.id,
      category: report.category,
      description: report.description,
      location: report.location,
      attachmentName,
      attachmentType,
      hasAttachment: Boolean(attachmentName),
      createdAt: report.created_at,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "Erro inesperado ao salvar denuncia.";
    return res.status(500).json({ message });
  } finally {
    client.release();
  }
});

app.get("/api/reports", async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit || 20), 100);
    const result = await pool.query(
      `SELECT r.id,
              r.category,
              c.label  AS category_label,
              c.email  AS category_email,
              r.description,
              r.location,
              r.created_at,
              ra.attachment_name,
              ra.attachment_type
       FROM reports r
       JOIN categories c ON c.key = r.category
       LEFT JOIN report_attachments ra ON ra.report_id = r.id
       ORDER BY r.created_at DESC
       LIMIT $1`,
      [Number.isFinite(limit) && limit > 0 ? limit : 20]
    );

    const reports = result.rows.map((row) => ({
      id: row.id,
      category: row.category,
      categoryLabel: row.category_label,
      categoryEmail: row.category_email,
      description: row.description,
      location: row.location,
      attachmentName: row.attachment_name,
      attachmentType: row.attachment_type,
      hasAttachment: Boolean(row.attachment_name),
      createdAt: row.created_at,
    }));

    return res.json({ reports });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao listar denuncias.";
    return res.status(500).json({ message });
  }
});

app.post("/api/reports/email", upload.single("attachment"), async (req, res) => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpSecure = process.env.SMTP_SECURE === "true";
    const mailFrom = process.env.MAIL_FROM || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(500).json({
        message: "Variaveis SMTP ausentes. Configure SMTP_HOST, SMTP_USER e SMTP_PASS.",
      });
    }

    const {
      toEmail,
      fromEmail,
      replyTo,
      reportNumber,
      categoryKey,
      categoryLabel,
      location,
      description,
    } = req.body;

    if (!toEmail || !reportNumber || !description) {
      return res.status(400).json({ message: "Campos obrigatorios ausentes para envio." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const textBody = [
      `Denuncia ${reportNumber}`,
      "",
      `Categoria: ${categoryLabel || "Nao informado"} (${categoryKey || "-"})`,
      `Local: ${location || "Nao informado"}`,
      "",
      "Descricao:",
      description,
      "",
      `Contato de resposta: ${replyTo || fromEmail || "Nao informado"}`,
    ].join("\n");

    const htmlBody = `
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
                Denuncia ${reportNumber}
              </div>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:18px;border-collapse:collapse;">
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;width:180px;font-weight:600;color:#334155;">Categoria</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${categoryLabel || "Nao informado"} (${categoryKey || "-"})</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#334155;">Local</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${location || "Nao informado"}</td>
                </tr>
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;font-weight:600;color:#334155;">Contato para retorno</td>
                  <td style="padding:10px 0;border-bottom:1px solid #f1f5f9;">${replyTo || fromEmail || "Nao informado"}</td>
                </tr>
              </table>
              <div style="margin-top:20px;">
                <p style="margin:0 0 8px 0;font-size:14px;font-weight:700;color:#111827;">Descricao</p>
                <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;white-space:pre-line;line-height:1.5;">
                  ${description}
                </div>
              </div>
            </td>
          </tr>
        </table>
      </div>
    `;

    const attachments = req.file
      ? [
          {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: req.file.mimetype,
          },
        ]
      : [];

    await transporter.sendMail({
      from: mailFrom,
      to: toEmail,
      subject: `Denuncia ${reportNumber}`,
      text: textBody,
      html: htmlBody,
      replyTo: replyTo || fromEmail || undefined,
      attachments,
    });

    res.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro inesperado ao enviar e-mail.";
    res.status(500).json({ message });
  }
});

initializeDatabase()
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

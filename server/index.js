import "dotenv/config";
import cors from "cors";
import express from "express";
import multer from "multer";
import nodemailer from "nodemailer";

const app = express();
const port = Number(process.env.SERVER_PORT || 8787);

const upload = multer({ storage: multer.memoryStorage() });

app.use(cors({ origin: true }));
app.get("/health", (_req, res) => {
  res.json({ ok: true });
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

app.listen(port, () => {
  console.log(`Servidor de e-mail ativo em http://localhost:${port}`);
});

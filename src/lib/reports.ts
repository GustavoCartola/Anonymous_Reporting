const REPORTS_API_URL = import.meta.env.VITE_REPORTS_API_URL || "http://localhost:8787/api/reports";

export type AnonymousReport = {
  id: string;
  category: string; // tipo da denúncia
  description: string; // descrição
  location?: string | null; // local aproximado (opcional)
  attachmentName?: string | null;
  attachmentType?: string | null;
  hasAttachment?: boolean;
  createdAt: string; // ISO
};

export type SaveAnonymousReportInput = {
  category: string;
  description: string;
  location?: string | null;
  attachment?: File | null;
};

export async function getReports(limit = 20): Promise<AnonymousReport[]> {
  const response = await fetch(`${REPORTS_API_URL}?limit=${Math.max(1, Math.min(limit, 100))}`);
  if (!response.ok) {
    throw new Error("Nao foi possivel listar as denuncias.");
  }

  const payload = await response.json();
  const reports = payload?.reports;
  return Array.isArray(reports) ? (reports as AnonymousReport[]) : [];
}

export function containsPersonalData(text: string): string | null {
  const t = text ?? "";

  // e-mail
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(t)) {
    return "Não inclua e-mail na denúncia.";
  }

  // CPF (com ou sem pontuação) - checagem simples por padrão de 11 dígitos
  const digits = t.replace(/\D/g, "");
  if (digits.length >= 11 && /\b\d{11}\b/.test(digits)) {
    return "Não inclua CPF/identificadores numéricos na denúncia.";
  }

  // telefone (padrões comuns BR)
  if (/\b(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/.test(t)) {
    return "Não inclua telefone na denúncia.";
  }

  // incentivo para não inserir nome (heurística leve)
  if (/\b(meu nome é|sou o|sou a|eu,\s*[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])/i.test(t)) {
    return "Evite inserir nomes/identificação pessoal na denúncia.";
  }

  return null;
}

export async function saveReport(input: SaveAnonymousReportInput): Promise<AnonymousReport> {
  const payload = new FormData();
  payload.append("category", input.category.trim());
  payload.append("description", input.description.trim());
  payload.append("location", input.location?.trim() || "");
  if (input.attachment) {
    payload.append("attachment", input.attachment);
  }

  const response = await fetch(REPORTS_API_URL, {
    method: "POST",
    body: payload,
  });

  if (!response.ok) {
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse?.message || "Falha ao registrar denuncia no banco.");
  }

  const savedReport = (await response.json()) as AnonymousReport;
  return savedReport;
}

export const retentionInfo = {
  storage: "banco de dados PostgreSQL",
};
const STORAGE_KEY = "anonymous_reports_v1";
const RETENTION_DAYS = 30;
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

export type AnonymousReport = {
  id: string;
  category: string; // tipo da denúncia
  description: string; // descrição
  createdAt: string; // ISO
};

function nowIso() {
  return new Date().toISOString();
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getReports(): AnonymousReport[] {
  const data = safeParse<AnonymousReport[]>(localStorage.getItem(STORAGE_KEY));
  return Array.isArray(data) ? data : [];
}

export function purgeOldReports(): void {
  const reports = getReports();
  const cutoff = Date.now() - RETENTION_MS;

  const kept = reports.filter((r) => {
    const t = Date.parse(r.createdAt);
    return Number.isFinite(t) && t >= cutoff;
  });

  if (kept.length !== reports.length) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
  }
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

export function saveReport(input: Omit<AnonymousReport, "id" | "createdAt">): AnonymousReport {
  purgeOldReports();

  const report: AnonymousReport = {
    id: crypto.randomUUID(),
    category: input.category.trim(),
    description: input.description.trim(),
    createdAt: nowIso(),
  };

  const all = getReports();
  all.unshift(report);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));

  return report;
}

export const retentionInfo = {
  days: RETENTION_DAYS,
  storage: "armazenamento local do navegador (localStorage)",
};
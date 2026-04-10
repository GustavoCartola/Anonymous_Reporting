const API_DENUNCIAS_URL =
  import.meta.env.VITE_API_DENUNCIAS_URL ||
  import.meta.env.VITE_REPORTS_API_URL ||
  "http://localhost:8787/api/denuncias";

export type DenunciaAnonima = {
  id: string;
  categoria: string;
  descricao: string;
  localizacao?: string | null;
  nomeAnexo?: string | null;
  tipoAnexo?: string | null;
  possuiAnexo?: boolean;
  criadoEm: string;
};

export type EntradaSalvarDenuncia = {
  categoria: string;
  descricao: string;
  localizacao?: string | null;
  anexo?: File | null;
};

export async function listarDenuncias(limit = 20): Promise<DenunciaAnonima[]> {
  const response = await fetch(`${API_DENUNCIAS_URL}?limit=${Math.max(1, Math.min(limit, 100))}`);
  if (!response.ok) {
    throw new Error("Nao foi possivel listar as denuncias.");
  }

  const payload = await response.json();
  const denuncias = payload?.denuncias;
  return Array.isArray(denuncias) ? (denuncias as DenunciaAnonima[]) : [];
}

export function contemDadosPessoais(texto: string): string | null {
  const textoNormalizado = texto ?? "";

  // e-mail
  if (/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(textoNormalizado)) {
    return "Não inclua e-mail na denúncia.";
  }

  // CPF (com ou sem pontuação) - checagem simples por padrão de 11 dígitos
  const digitos = textoNormalizado.replace(/\D/g, "");
  if (digitos.length >= 11 && /\b\d{11}\b/.test(digitos)) {
    return "Não inclua CPF/identificadores numéricos na denúncia.";
  }

  // telefone (padrões comuns BR)
  if (/\b(\+?55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}\b/.test(textoNormalizado)) {
    return "Não inclua telefone na denúncia.";
  }

  // incentivo para não inserir nome (heurística leve)
  if (/\b(meu nome é|sou o|sou a|eu,\s*[A-ZÁÀÂÃÉÈÊÍÌÎÓÒÔÕÚÙÛÇ])/i.test(textoNormalizado)) {
    return "Evite inserir nomes/identificação pessoal na denúncia.";
  }

  return null;
}

export async function salvarDenuncia(input: EntradaSalvarDenuncia): Promise<DenunciaAnonima> {
  const formulario = new FormData();
  formulario.append("categoria", input.categoria.trim());
  formulario.append("descricao", input.descricao.trim());
  formulario.append("localizacao", input.localizacao?.trim() || "");
  if (input.anexo) {
    formulario.append("anexo", input.anexo);
  }

  const response = await fetch(API_DENUNCIAS_URL, {
    method: "POST",
    body: formulario,
  });

  if (!response.ok) {
    const errorResponse = await response.json().catch(() => ({}));
    throw new Error(errorResponse?.message || "Falha ao registrar denuncia no banco.");
  }

  const denunciaSalva = (await response.json()) as DenunciaAnonima;
  return denunciaSalva;
}

export const informacoesRetencao = {
  armazenamento: "banco de dados PostgreSQL",
};
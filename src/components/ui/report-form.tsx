import { useMemo, useState } from "react";
import { containsPersonalData, retentionInfo, saveReport } from "../../lib/reports";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import { Input } from "./input";
import { FileText, Send, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ReportForm() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const privacyNotice = useMemo(() => {
    return "Nenhum dado pessoal é coletado. Todas as denúncias são anônimas.";
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Minimização: só categoria + descrição (sem nome, email, cpf, etc.)
    if (!category.trim()) {
      setError("Selecione o tipo da denúncia.");
      return;
    }
    if (!description.trim() || description.trim().length < 10) {
      setError("Descreva a denúncia com um pouco mais de detalhes (mín. 10 caracteres).");
      return;
    }

    // LGPD: bloqueio de dados sensíveis (coleta acidental)
    const piiMsg = containsPersonalData(description);
    if (piiMsg) {
      setError(piiMsg);
      return;
    }

    saveReport({ category, description });

    setCategory("");
    setDescription("");
    setSuccess(
      `Denúncia registrada localmente. Retenção: ${retentionInfo.days} dias (${retentionInfo.storage}).`
    );
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-primary/10 rounded-full">
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Faça sua Denúncia
            </h2>
            <p className="text-muted-foreground text-lg">
              Preencha o formulário abaixo de forma detalhada. 
              Todas as informações são criptografadas e sua identidade permanece protegida.
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Formulário Anônimo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-6">
                {/* Aviso de anonimato */}
                <div style={{ padding: 12, border: "1px solid #ddd", borderRadius: 8, marginBottom: 12 }}>
                  <strong>Anonimato:</strong> {privacyNotice}
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
                    Retenção: denúncias armazenadas localmente por {retentionInfo.days} dias e removidas automaticamente.
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Categoria da Denúncia</Label>
                  <Select 
                    value={category} 
                    onValueChange={(value) => setCategory(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corruption">Corrupção</SelectItem>
                      <SelectItem value="harassment">Assédio</SelectItem>
                      <SelectItem value="violence">Violência</SelectItem>
                      <SelectItem value="environmental">Crime Ambiental</SelectItem>
                      <SelectItem value="discrimination">Discriminação</SelectItem>
                      <SelectItem value="fraud">Fraude</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Descrição detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os fatos de forma detalhada, incluindo datas, pessoas envolvidas e circunstâncias..."
                    className="min-h-[120px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="evidence">Evidências (Opcional)</Label>
                  <Textarea
                    id="evidence"
                    placeholder="Descreva qualquer evidência que possa ajudar na investigação (documentos, fotos, vídeos, testemunhas, etc.)"
                    className="min-h-[80px]"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> Este sistema garante total anonimato. 
                    Não colete dados pessoais e utiliza criptografia de ponta a ponta. 
                    Após o envio, você receberá um código para acompanhar o caso.
                  </p>
                </div>

                {error && <div style={{ marginTop: 12, color: "crimson" }}>{error}</div>}
                {success && <div style={{ marginTop: 12, color: "green" }}>{success}</div>}

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!description || !category}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Denúncia Anônima
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
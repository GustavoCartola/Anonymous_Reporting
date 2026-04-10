import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-security.jpg";
import styles from './ReportPage.module.css';
import categories from "@/data/categories.json";
import { containsPersonalData, retentionInfo, saveReport } from "@/lib/reports";

type CategoryOption = {
  key: string;
  label: string;
  email: string;
};

const typedCategories = categories as CategoryOption[];
const sortedCategories = [...typedCategories].sort((a, b) =>
  a.label.localeCompare(b.label, "pt-BR", { sensitivity: "base" })
);
const TEST_SENDER_EMAIL = "gustacartola@gmail.com";
 
export const ReportPage = () => {
  const [formData, setFormData] = useState({
    category: "",
    email: "",
    description: "",
    location: "",
    image: null as File | null
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, image: file});
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const apiUrl = import.meta.env.VITE_REPORT_API_URL || "http://localhost:8787/api/reports/email";

    if (!formData.category.trim()) {
      setError("Selecione o tipo da denúncia.");
      return;
    }

    if (!formData.description.trim() || formData.description.trim().length < 100) {
      setError("Descreva a denúncia com mais detalhes (mín. 100 caracteres).");
      return;
    }

    const piiMsg = containsPersonalData(formData.description);
    if (piiMsg) {
      setError(piiMsg);
      return;
    }

    const selectedCategory = typedCategories.find((c) => c.key === formData.category);
    const selectedEmail = selectedCategory?.email || formData.email;
    if (!selectedEmail) {
      setError("Nao foi possivel determinar o e-mail do orgao responsavel para a categoria escolhida.");
      return;
    }

    const generatedReportNumber = Date.now().toString();

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("toEmail", selectedEmail);
      payload.append("fromEmail", TEST_SENDER_EMAIL);
      payload.append("replyTo", TEST_SENDER_EMAIL);
      payload.append("reportNumber", generatedReportNumber);
      payload.append("categoryLabel", selectedCategory?.label || "Nao informado");
      payload.append("location", formData.location);
      payload.append("description", formData.description);
      if (formData.image) {
        payload.append("attachment", formData.image);
      }

      const response = await fetch(apiUrl, {
        method: "POST",
        body: payload,
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse?.message || "Falha no servidor de e-mail.");
      }

      await saveReport({
        category: formData.category,
        description: formData.description,
        location: formData.location,
        attachment: formData.image,
      });

      toast({
        title: "Denuncia enviada com sucesso!",
        description: `Denuncia ${generatedReportNumber} encaminhada para ${selectedEmail}.`,
        duration: 5000,
      });

      setSuccess(
        `Denuncia ${generatedReportNumber} enviada para ${selectedEmail} e registrada em ${retentionInfo.storage}.`
      );

      setFormData({
        category: "",
        email: "",
        description: "",
        location: "",
        image: null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Falha ao encaminhar o e-mail da denuncia.";
      setError(`${msg} Verifique a configuracao do servidor SMTP e tente novamente.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.wrapper}>
        <div className={styles.maxWidth}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <FileText className={styles.fileIcon} />
                Formulário de Denúncia Anônima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                  <Label htmlFor="category">
                    Categoria <span className={styles.required}>*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      const cat = typedCategories.find((c) => c.key === value);
                      setFormData({ 
                        ...formData, 
                        category: value,
                        email: cat ? cat.email : ""
                      });
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedCategories.map((c) => (
                        <SelectItem key={c.key} value={c.key}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="location">
                    Local (Opcional)
                  </Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Cidade, bairro ou endereço aproximado"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">
                    Descrição detalhada <span className={styles.required}>*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Descreva os fatos de forma detalhada, incluindo datas, pessoas envolvidas e circunstâncias..."
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                    minLength={100}
                  />
                  <div
                    className={`${styles.charCount}`}
                    aria-live="polite"
                  >
                    {formData.description.length}/100 mínimo
                  </div>
                </div>

                <div>
                  <Label htmlFor="image">
                    Anexar Imagem (Opcional)
                  </Label>
                  <div className={styles.fileInputWrapper}>
                    <Input
                      id="image"
                      name="attachment"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className={styles.fileInput}
                    />
                    {formData.image && (
                      <p className={styles.fileSelected}>
                        Arquivo selecionado: {formData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                

                <div className={styles.infoBox}>
                  <p className={styles.infoText}>
                    Os dados informados serão utilizados exclusivamente para registro e apuração da denúncia.
                  </p>
                </div>

                {error && <div className={styles.errorText}>{error}</div>}
                {success && <div className={styles.successText}>{success}</div>}

                <Button 
                  type="submit" 
                  className={styles.submitButton}
                  size="lg"
                  disabled={isSubmitting || formData.description.length < 100 || !formData.category}
                >
                  <Send className={styles.sendIcon} />
                  {isSubmitting ? "Enviando..." : "Enviar Denuncia Anonima"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportPage;
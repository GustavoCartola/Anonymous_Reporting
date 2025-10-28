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
 
export const ReportPage = () => {
  const [formData, setFormData] = useState({
    category: "",
    email: "",
    description: "",
    location: "",
    image: null as File | null
  });
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, image: file});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedEmail = formData.email || "nao-disponivel@exemplo.com";
    toast({
      title: "Denúncia enviada com sucesso!",
      description: `Sua denúncia foi registrada. Categoria: ${formData.category} — e-mail de destino (fictício): ${selectedEmail}`,
      duration: 5000,
    });
    
    // Reset form
    setFormData({
      category: "",
      email: "",
      description: "",
      location: "",
      image: null
    });
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
                      const cat = categories.find((c: any) => c.key === value);
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
                      {categories.map((c: any) => (
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
                    placeholder="Descreva os fatos de forma detalhada, incluindo datas, pessoas envolvidas e circunstâncias..."
                    className={styles.textarea}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="image">
                    Anexar Imagem (Opcional)
                  </Label>
                  <div className={styles.fileInputWrapper}>
                    <Input
                      id="image"
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
                    <strong>Importante:</strong> Este sistema garante total anonimato e segue as diretrizes da LGPD. 
                    Não coletamos dados pessoais e utilizamos criptografia de ponta a ponta.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className={styles.submitButton}
                  size="lg"
                  disabled={!formData.description || !formData.category}
                >
                  <Send className={styles.sendIcon} />
                  Enviar Denúncia Anônima
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
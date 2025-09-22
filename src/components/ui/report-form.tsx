import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Label } from "./label";
import { Input } from "./input";
import { FileText, Send, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ReportForm = () => {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    location: "",
    evidence: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate form submission
    const trackingCode = `DN${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    toast({
      title: "Denúncia enviada com sucesso!",
      description: `Seu código de acompanhamento: ${trackingCode}`,
      duration: 5000,
    });
    
    // Reset form
    setFormData({
      category: "",
      description: "",
      location: "",
      evidence: ""
    });
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
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="category">Categoria da Denúncia</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
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
                  <Label htmlFor="location">Local (Opcional)</Label>
                  <Input
                    id="location"
                    placeholder="Cidade, bairro ou endereço aproximado"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descrição detalhada *</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva os fatos de forma detalhada, incluindo datas, pessoas envolvidas e circunstâncias..."
                    className="min-h-[120px]"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="evidence">Evidências (Opcional)</Label>
                  <Textarea
                    id="evidence"
                    placeholder="Descreva qualquer evidência que possa ajudar na investigação (documentos, fotos, vídeos, testemunhas, etc.)"
                    className="min-h-[80px]"
                    value={formData.evidence}
                    onChange={(e) => setFormData({...formData, evidence: e.target.value})}
                  />
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> Este sistema garante total anonimato. 
                    Não colete dados pessoais e utiliza criptografia de ponta a ponta. 
                    Após o envio, você receberá um código para acompanhar o caso.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!formData.description || !formData.category}
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
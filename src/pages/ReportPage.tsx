import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Send, Upload, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const ReportPage = () => {
  const [formData, setFormData] = useState({
    category: "",
    description: "",
    location: "",
    image: null as File | null
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, image: file});
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Denúncia enviada com sucesso!",
      description: "Sua denúncia foi registrada e será analisada pelas autoridades competentes.",
      duration: 5000,
    });
    
    // Reset form
    setFormData({
      category: "",
      description: "",
      location: "",
      image: null
    });
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="mr-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-2xl font-bold">Nova Denúncia</h1>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Formulário de Denúncia Anônima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="category">Categoria da Denúncia *</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData({...formData, category: value})}
                    required
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
                      <SelectItem value="theft">Roubo</SelectItem>
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
                  <Label htmlFor="image">Anexar Imagem (Opcional)</Label>
                  <div className="mt-2">
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-primary file:text-primary-foreground"
                    />
                    {formData.image && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Arquivo selecionado: {formData.image.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Importante:</strong> Este sistema garante total anonimato e segue as diretrizes da LGPD. 
                    Não coletamos dados pessoais e utilizamos criptografia de ponta a ponta.
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
    </div>
  );
};

export default ReportPage;
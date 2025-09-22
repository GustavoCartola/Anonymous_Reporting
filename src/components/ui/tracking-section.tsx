import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Input } from "./input";
import { Label } from "./label";
import { Badge } from "./badge";
import { Search, Clock, CheckCircle, AlertCircle, FileSearch } from "lucide-react";

export const TrackingSection = () => {
  const [trackingCode, setTrackingCode] = useState("");
  const [caseData, setCaseData] = useState<any>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulate tracking data
    if (trackingCode.length >= 6) {
      setCaseData({
        code: trackingCode,
        status: "in_progress",
        createdAt: "2024-01-15",
        category: "Corrupção",
        lastUpdate: "2024-01-20",
        updates: [
          { date: "2024-01-15", status: "Denúncia recebida", description: "Sua denúncia foi registrada no sistema" },
          { date: "2024-01-18", status: "Em análise", description: "O caso está sendo analisado pela equipe responsável" },
          { date: "2024-01-20", status: "Investigação iniciada", description: "Investigação formal foi iniciada" }
        ]
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "received": return "bg-primary text-primary-foreground";
      case "in_progress": return "bg-warning text-warning-foreground";
      case "completed": return "bg-success text-success-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "received": return <Clock className="w-4 h-4" />;
      case "in_progress": return <AlertCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      default: return <FileSearch className="w-4 h-4" />;
    }
  };

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="p-3 bg-accent/10 rounded-full">
                <Search className="w-8 h-8 text-accent" />
              </div>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Acompanhe seu Caso
            </h2>
            <p className="text-muted-foreground text-lg">
              Digite o código que você recebeu após fazer a denúncia 
              para acompanhar o andamento do processo.
            </p>
          </div>

          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSearch className="w-5 h-5 text-accent" />
                Buscar Caso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="space-y-4">
                <div>
                  <Label htmlFor="tracking">Código de Acompanhamento</Label>
                  <Input
                    id="tracking"
                    placeholder="Digite seu código (ex: DN8X9M2K1)"
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                    className="font-mono"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={trackingCode.length < 6}>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Caso
                </Button>
              </form>
            </CardContent>
          </Card>

          {caseData && (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Caso: {caseData.code}</span>
                  <Badge className={getStatusColor(caseData.status)}>
                    {getStatusIcon(caseData.status)}
                    <span className="ml-1">Em Andamento</span>
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Data da Denúncia</Label>
                    <p className="font-medium">{caseData.createdAt}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Categoria</Label>
                    <p className="font-medium">{caseData.category}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-lg font-semibold mb-4 block">Histórico de Atualizações</Label>
                  <div className="space-y-4">
                    {caseData.updates.map((update: any, index: number) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-card rounded-lg border">
                        <div className="p-2 bg-primary/10 rounded-full">
                          <CheckCircle className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium">{update.status}</h4>
                            <span className="text-sm text-muted-foreground">{update.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{update.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Lembre-se:</strong> Este sistema preserva seu anonimato. 
                    Mantenha seu código de acompanhamento em local seguro para futuras consultas.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
};
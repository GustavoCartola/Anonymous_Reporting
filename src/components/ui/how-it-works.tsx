import { Shield, FileText, Search, Users } from "lucide-react";
import { Card, CardContent } from "./card";

export const HowItWorks = () => {
  const steps = [
    {
      icon: FileText,
      title: "1. Faça sua denúncia",
      description: "Preencha o formulário anônimo com detalhes sobre a irregularidade ou crime que deseja reportar."
    },
    {
      icon: Shield,
      title: "2. Receba seu código",
      description: "Após o envio, você receberá um código único para acompanhar o andamento do seu caso."
    },
    {
      icon: Search,
      title: "3. Acompanhe o processo",
      description: "Use seu código para verificar atualizações e o progresso da investigação a qualquer momento."
    },
    {
      icon: Users,
      title: "4. Contribua para a sociedade",
      description: "Sua denúncia ajuda a combater irregularidades e promove transparência na comunidade."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Como Funciona o Sistema
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Um processo simples e seguro que garante seu anonimato 
            e contribui para uma sociedade mais justa e transparente.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8">
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 rounded-full">
                    <step.icon className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="flex items-start gap-6">
                <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4">Garantia de Anonimato</h3>
                  <div className="grid md:grid-cols-2 gap-6 text-muted-foreground">
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Segurança Total</h4>
                      <p className="text-sm">
                        Utilizamos criptografia de ponta a ponta e não coletamos 
                        dados pessoais que possam identificar o denunciante.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Processo Transparente</h4>
                      <p className="text-sm">
                        Acompanhe cada etapa da investigação através do seu código 
                        exclusivo, mantendo total privacidade.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
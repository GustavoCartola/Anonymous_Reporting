import { Shield, Lock, Users } from "lucide-react";
import { Button } from "./button";
import heroImage from "@/assets/hero-security.jpg";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-accent/90" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center text-white">
          <div className="flex justify-center mb-8">
            <div className="p-4 bg-white/10 rounded-full backdrop-blur-sm">
              <Shield className="w-12 h-12" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Sistema de
            <span className="block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              Denúncia Anônima
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl mb-8 text-white/90 max-w-3xl mx-auto">
            Plataforma segura e sigilosa para reportar irregularidades, 
            crimes e abusos de forma completamente anônima.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
              Fazer Denúncia
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-white/30 text-white hover:bg-white/10">
              Acompanhar Caso
            </Button>
          </div>
          
          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Anônimo</h3>
              <p className="text-white/80 text-sm">
                Sua identidade permanece protegida durante todo o processo
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Seguro</h3>
              <p className="text-white/80 text-sm">
                Criptografia de ponta a ponta para garantir total segurança
              </p>
            </div>
            
            <div className="flex flex-col items-center text-center">
              <div className="p-3 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Transparente</h3>
              <p className="text-white/80 text-sm">
                Acompanhe o andamento do seu caso com código exclusivo
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
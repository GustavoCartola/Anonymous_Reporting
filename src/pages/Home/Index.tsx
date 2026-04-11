import { Shield, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-security.jpg";
import styles from './Index.module.css';

const Inicio = () => {
  const navegar = useNavigate();

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.heroSection}>
        {/* Background Image */}
        <div 
          className={styles.backgroundImage}
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className={styles.overlay} />
        </div>
        
        {/* Content */}
        <div className={styles.content}>
          <div className={styles.contentWrapper}>
            <div className={styles.iconWrapper}>
              <div className={styles.iconContainer}>
                <Shield className={styles.mainIcon} />
              </div>
            </div>
            
            <h1 className={styles.title}>
              Sistema de
              <span className={styles.titleSpan}>
                Denúncia Anônima
              </span>
            </h1>
            
            <p className={styles.description}>
              Plataforma segura e sigilosa para reportar irregularidades, 
              crimes e abusos de forma completamente anônima.
            </p>
            
            <div className={styles.buttonWrapper}>
              <Button 
                size="lg" 
                variant="secondary" 
                className={styles.button}
                onClick={() => navegar('/denuncia')}
              >
                Realizar Denúncia
              </Button>
            </div>
            
            {/* Features */}
            <div className={styles.features}>
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Lock className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>Canal Anônimo</h3>
                <p className={styles.featureDescription}>
                  Registro de denúncias sem identificação pessoal obrigatória.
                </p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>Privacidade em Primeiro Lugar</h3>
                <p className={styles.featureDescription}>
                  Coleta apenas das informações essenciais para análise do caso.
                </p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>Uso Fácil e Intuitivo</h3>
                <p className={styles.featureDescription}>
                  Navegação clara e etapas simplificadas para facilitar o uso por qualquer pessoa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Inicio;

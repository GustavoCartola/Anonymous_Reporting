import { Shield, Lock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-security.jpg";
import styles from './Index.module.css';

const Index = () => {
  const navigate = useNavigate();

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
                onClick={() => navigate('/denuncia')}
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
                <h3 className={styles.featureTitle}>100% Anônimo</h3>
                <p className={styles.featureDescription}>
                  Sua identidade permanece protegida durante todo o processo
                </p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Shield className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>Seguro</h3>
                <p className={styles.featureDescription}>
                  Criptografia de ponta a ponta para garantir total segurança
                </p>
              </div>
              
              <div className={styles.feature}>
                <div className={styles.featureIcon}>
                  <Users className={styles.icon} />
                </div>
                <h3 className={styles.featureTitle}>LGPD</h3>
                <p className={styles.featureDescription}>
                  Sistema em conformidade com a Lei Geral de Proteção de Dados
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;

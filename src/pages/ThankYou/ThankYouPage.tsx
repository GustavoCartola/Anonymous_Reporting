import { Button } from "@/components/ui/button";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroImage from "@/assets/hero-security.jpg";
import styles from "./ThankYouPage.module.css";

const PaginaAgradecimento = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.backgroundImage} style={{ backgroundImage: `url(${heroImage})` }}>
        <div className={styles.overlay} />
      </div>

      <main className={styles.content}>
        <section className={styles.card}>
          <div className={styles.iconGroup}>
            <div className={styles.mainIconWrap}>
              <CheckCircle2 className={styles.mainIcon} />
            </div>
            <ShieldCheck className={styles.secondaryIcon} />
          </div>

          <h1 className={styles.title}>Denuncia enviada com sucesso</h1>

          <p className={styles.text}>
            Obrigado por ter tido coragem de denunciar e por confiar no nosso canal.
            Sua identidade permanece protegida durante todo o processo.
          </p>

          <p className={styles.textSecondary}>
            Cada denuncia registrada contribui para uma sociedade mais justa, segura e melhor para todos.
          </p>

          <div className={styles.actions}>
            <Button className={styles.secondaryButton} onClick={() => navigate("/")}>
              Voltar para Tela Inicial
            </Button>
            <Button className={styles.primaryButton} onClick={() => navigate("/denuncia")}>
              Realizar Nova Denuncia
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PaginaAgradecimento;

import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import heroImage from "@/assets/hero-security.jpg";
import styles from './NotFound.module.css';

const NaoEncontrada = () => {
  const localizacao = useLocation();
  const navegar = useNavigate();

  useEffect(() => {
    console.error("Erro 404: usuário tentou acessar rota inexistente:", localizacao.pathname);
    // Redireciona automaticamente para a página inicial
    navegar("/", { replace: true });
  }, [localizacao.pathname, navegar]);

  return (
    <div className={styles.container}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.overlay} />
      </div>
      
      {/* Content */}
      <div className={styles.content}>
        <div className={styles.textCenter}>
          <h1 className={styles.title}>404</h1>
          <p className={styles.subtitle}>Oops! Página não encontrada — redirecionando...</p>
          <a href="/" className={styles.link}>
            Voltar para o início
          </a>
        </div>
      </div>
    </div>
  );
};

export default NaoEncontrada;

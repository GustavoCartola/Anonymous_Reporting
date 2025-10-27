import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import heroImage from "@/assets/hero-security.jpg";
import styles from './NotFound.module.css';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    // Redireciona automaticamente para a página inicial
    navigate("/", { replace: true });
  }, [location.pathname, navigate]);

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

export default NotFound;

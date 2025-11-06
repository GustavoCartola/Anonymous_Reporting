import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import styles from "./AdminPage.module.css";

type Props = {
  onLogout?: () => void;
  title?: string;
};

const AdminHeader: React.FC<Props> = ({ onLogout, title = "Painel Administrativo" }) => {
  return (
    <header className={styles.header} role="banner">
      <div className={styles.headerTitle}>
        <Settings className={styles.settingsIcon} aria-hidden="true" />
        <h1 className={styles.title}>{title}</h1>
      </div>

      <div>
        <Button variant="outline" onClick={() => onLogout && onLogout()} aria-label="Sair do painel">
          Sair
        </Button>
      </div>
    </header>
  );
};

export default AdminHeader;
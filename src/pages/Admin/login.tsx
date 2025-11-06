import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import styles from "./AdminPage.module.css";

type Props = {
  onLoginSuccess: () => void;
};

const Login: React.FC<Props> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // placeholder auth — substituir por integração real
    if (username.trim() === "admin" && password === "admin123") {
      toast({ title: "Login realizado", description: "Bem-vindo ao painel." });
      onLoginSuccess();
    } else {
      toast({ title: "Erro de autenticação", description: "Usuário ou senha incorretos.", variant: "destructive" });
    }
  };

  return (
    <div className={styles.loginContainer}>
      <Card className={styles.loginCard}>
        <CardHeader className={styles.loginHeader}>
          <div className={styles.iconWrapper}>
            <div className={styles.iconContainer}>
              <Shield className={styles.shieldIcon} />
            </div>
          </div>
          <CardTitle>Acesso Administrativo</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className={styles.loginForm} aria-label="Formulário de login administrativo">
            <div>
              <Label htmlFor="admin-username">Usuário</Label>
              <Input id="admin-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
            </div>

            <div>
              <Label htmlFor="admin-password">Senha</Label>
              <Input id="admin-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
            </div>

            <Button type="submit" className={styles.loginButton}>Entrar</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
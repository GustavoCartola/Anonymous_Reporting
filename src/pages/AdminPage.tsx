import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-security.jpg";
import styles from './AdminPage.module.css';

interface CategoryEmail {
  id: string;
  category: string;
  email: string;
}

export const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [categoryEmails, setCategoryEmails] = useState<CategoryEmail[]>([]);
  const [newMapping, setNewMapping] = useState({ category: "", email: "" });
  const { toast } = useToast();

  useEffect(() => {
    const saved = localStorage.getItem('categoryEmails');
    if (saved) {
      setCategoryEmails(JSON.parse(saved));
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsAuthenticated(true);
      toast({
        title: "Login realizado com sucesso!",
        description: "Bem-vindo ao painel administrativo.",
      });
    } else {
      toast({
        title: "Erro de autenticação",
        description: "Usuário ou senha incorretos.",
        variant: "destructive",
      });
    }
  };

  const handleAddMapping = () => {
    if (!newMapping.category || !newMapping.email) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const newCategoryEmail: CategoryEmail = {
      id: Date.now().toString(),
      category: newMapping.category,
      email: newMapping.email
    };

    const updated = [...categoryEmails, newCategoryEmail];
    setCategoryEmails(updated);
    localStorage.setItem('categoryEmails', JSON.stringify(updated));
    
    setNewMapping({ category: "", email: "" });
    
    toast({
      title: "Vinculação criada!",
      description: `Email ${newMapping.email} vinculado à categoria ${getCategoryName(newMapping.category)}.`,
    });
  };

  const handleDeleteMapping = (id: string) => {
    const updated = categoryEmails.filter(item => item.id !== id);
    setCategoryEmails(updated);
    localStorage.setItem('categoryEmails', JSON.stringify(updated));
    
    toast({
      title: "Vinculação removida!",
      description: "A vinculação foi removida com sucesso.",
    });
  };

  const getCategoryName = (value: string) => {
    const categories: Record<string, string> = {
      corruption: "Corrupção",
      harassment: "Assédio",
      violence: "Violência",
      environmental: "Crime Ambiental",
      discrimination: "Discriminação",
      fraud: "Fraude",
      theft: "Roubo",
      other: "Outros"
    };
    return categories[value] || value;
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer}>
        {/* Background Image */}
        <div 
          className={styles.backgroundImage}
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className={styles.overlay} />
        </div>
        
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
            <form onSubmit={handleLogin} className={styles.loginForm}>
              <div>
                <Label htmlFor="username">Usuário</Label>
                <Input
                  id="username"
                  value={credentials.username}
                  onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                  required
                />
              </div>
              <Button type="submit" className={styles.loginButton}>
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.adminContainer}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.container}>
        <div className={styles.maxWidth}>
          <div className={styles.header}>
            <div className={styles.headerTitle}>
              <Settings className={styles.settingsIcon} />
              <h1 className={styles.title}>Painel Administrativo</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAuthenticated(false);
                setCredentials({ username: "", password: "" });
              }}
            >
              Sair
            </Button>
          </div>

          {/* Add New Mapping */}
          <Card className={styles.addMappingCard}>
            <CardHeader>
              <CardTitle className={styles.cardTitleWithIcon}>
                <Plus className={styles.plusIcon} />
                Vincular Email à Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.formGrid}>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select 
                    value={newMapping.category} 
                    onValueChange={(value) => setNewMapping({...newMapping, category: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="corruption">Corrupção</SelectItem>
                      <SelectItem value="harassment">Assédio</SelectItem>
                      <SelectItem value="violence">Violência</SelectItem>
                      <SelectItem value="environmental">Crime Ambiental</SelectItem>
                      <SelectItem value="discrimination">Discriminação</SelectItem>
                      <SelectItem value="fraud">Fraude</SelectItem>
                      <SelectItem value="theft">Roubo</SelectItem>
                      <SelectItem value="other">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemplo@email.com"
                    value={newMapping.email}
                    onChange={(e) => setNewMapping({...newMapping, email: e.target.value})}
                  />
                </div>
                <div className={styles.buttonWrapper}>
                  <Button onClick={handleAddMapping} className={styles.addButton}>
                    <Plus className={styles.buttonIcon} />
                    Adicionar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Mappings */}
          <Card>
            <CardHeader>
              <CardTitle>Vinculações Ativas</CardTitle>
            </CardHeader>
            <CardContent>
              {categoryEmails.length === 0 ? (
                <p className={styles.emptyMessage}>
                  Nenhuma vinculação configurada ainda.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryEmails.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{getCategoryName(item.category)}</TableCell>
                        <TableCell>{item.email}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteMapping(item.id)}
                          >
                            <Trash2 className={styles.trashIcon} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
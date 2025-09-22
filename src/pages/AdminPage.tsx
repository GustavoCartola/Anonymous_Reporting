import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Plus, Trash2, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    // Load saved category emails from localStorage
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Shield className="w-8 h-8 text-primary" />
              </div>
            </div>
            <CardTitle>Acesso Administrativo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
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
              <Button type="submit" className="w-full">
                Entrar
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Settings className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Painel Administrativo</h1>
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
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Vincular Email à Categoria
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
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
                <div className="flex items-end">
                  <Button onClick={handleAddMapping} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
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
                <p className="text-muted-foreground text-center py-8">
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
                            <Trash2 className="w-4 h-4" />
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
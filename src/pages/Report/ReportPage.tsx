import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/hero-security.jpg";
import styles from './ReportPage.module.css';
import categorias from "@/data/categories.json";
import { contemDadosPessoais, informacoesRetencao, salvarDenuncia } from "@/lib/reports";

type OpcaoCategoria = {
  chave: string;
  rotulo: string;
  email: string;
};

const categoriasTipadas = categorias as OpcaoCategoria[];
const categoriasOrdenadas = [...categoriasTipadas].sort((a, b) =>
  a.rotulo.localeCompare(b.rotulo, "pt-BR", { sensitivity: "base" })
);
const EMAIL_REMETENTE_TESTE = "gustacartola@gmail.com";
 
export const PaginaDenuncia = () => {
  const [dadosFormulario, setDadosFormulario] = useState({
    categoria: "",
    email: "",
    descricao: "",
    localizacao: "",
    imagem: null as File | null
  });
  const [erro, setErro] = useState<string | null>(null);
  const [sucesso, setSucesso] = useState<string | null>(null);
  const [estaEnviando, setEstaEnviando] = useState(false);
  const { toast } = useToast();

  const handleMudancaImagem = (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      setDadosFormulario({ ...dadosFormulario, imagem: arquivo });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setSucesso(null);

    const urlApiEmail =
      import.meta.env.VITE_API_DENUNCIAS_EMAIL_URL ||
      import.meta.env.VITE_REPORT_API_URL ||
      "http://localhost:8787/api/denuncias/email";

    if (!dadosFormulario.categoria.trim()) {
      setErro("Selecione o tipo da denúncia.");
      return;
    }

    if (!dadosFormulario.descricao.trim() || dadosFormulario.descricao.trim().length < 100) {
      setErro("Descreva a denúncia com mais detalhes (mín. 100 caracteres).");
      return;
    }

    const mensagemDadosPessoais = contemDadosPessoais(dadosFormulario.descricao);
    if (mensagemDadosPessoais) {
      setErro(mensagemDadosPessoais);
      return;
    }

    const categoriaSelecionada = categoriasTipadas.find((categoria) => categoria.chave === dadosFormulario.categoria);
    const emailSelecionado = categoriaSelecionada?.email || dadosFormulario.email;
    if (!emailSelecionado) {
      setErro("Nao foi possivel determinar o e-mail do orgao responsavel para a categoria escolhida.");
      return;
    }

    const numeroDenunciaGerado = Date.now().toString();

    setEstaEnviando(true);

    try {
      const formularioEmail = new FormData();
      formularioEmail.append("emailDestino", emailSelecionado);
      formularioEmail.append("emailRemetente", EMAIL_REMETENTE_TESTE);
      formularioEmail.append("respostaPara", EMAIL_REMETENTE_TESTE);
      formularioEmail.append("numeroDenuncia", numeroDenunciaGerado);
      formularioEmail.append("rotuloCategoria", categoriaSelecionada?.rotulo || "Nao informado");
      formularioEmail.append("chaveCategoria", categoriaSelecionada?.chave || "");
      formularioEmail.append("localizacao", dadosFormulario.localizacao);
      formularioEmail.append("descricao", dadosFormulario.descricao);
      if (dadosFormulario.imagem) {
        formularioEmail.append("anexo", dadosFormulario.imagem);
      }

      const response = await fetch(urlApiEmail, {
        method: "POST",
        body: formularioEmail,
      });

      if (!response.ok) {
        const errorResponse = await response.json().catch(() => ({}));
        throw new Error(errorResponse?.message || "Falha no servidor de e-mail.");
      }

      await salvarDenuncia({
        categoria: dadosFormulario.categoria,
        descricao: dadosFormulario.descricao,
        localizacao: dadosFormulario.localizacao,
        anexo: dadosFormulario.imagem,
      });

      toast({
        title: "Denúncia enviada com sucesso!",
        description: `Denúncia ${numeroDenunciaGerado} encaminhada para ${emailSelecionado}.`,
        duration: 5000,
      });

      setSucesso(
        `Denúncia ${numeroDenunciaGerado} enviada para ${emailSelecionado} e registrada em ${informacoesRetencao.armazenamento}.`
      );

      setDadosFormulario({
        categoria: "",
        email: "",
        descricao: "",
        localizacao: "",
        imagem: null,
      });
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Falha ao encaminhar o e-mail da denuncia.";
      setErro(`${mensagem} Verifique a configuracao do servidor SMTP e tente novamente.`);
    } finally {
      setEstaEnviando(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Image */}
      <div 
        className={styles.backgroundImage}
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className={styles.overlay} />
      </div>
      
      <div className={styles.wrapper}>
        <div className={styles.maxWidth}>
          <Card className={styles.card}>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                <FileText className={styles.fileIcon} />
                Formulário de Denúncia Anônima
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div>
                  <Label htmlFor="category" className={styles.label}>
                    Categoria <span className={styles.required}>*</span>
                  </Label>
                  <Select
                    value={dadosFormulario.categoria}
                    onValueChange={(value) => {
                      const categoria = categoriasTipadas.find((item) => item.chave === value);
                      setDadosFormulario({ 
                        ...dadosFormulario, 
                        categoria: value,
                        email: categoria ? categoria.email : ""
                      });
                    }}
                    required
                  >
                    <SelectTrigger className={styles.field}>
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContent}>
                      {categoriasOrdenadas.map((categoria) => (
                        <SelectItem key={categoria.chave} value={categoria.chave}>
                          {categoria.rotulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="localizacao" className={styles.label}>
                    Local (Opcional)
                  </Label>
                  <Input
                    id="localizacao"
                    name="localizacao"
                    placeholder="Cidade, bairro ou endereço aproximado"
                    className={styles.field}
                    value={dadosFormulario.localizacao}
                    onChange={(e) => setDadosFormulario({ ...dadosFormulario, localizacao: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="descricao" className={styles.label}>
                    Descrição detalhada <span className={styles.required}>*</span>
                  </Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    placeholder="Descreva os fatos de forma detalhada, incluindo datas, pessoas envolvidas e circunstâncias..."
                    className={`${styles.textarea} ${styles.field}`}
                    value={dadosFormulario.descricao}
                    onChange={(e) =>
                      setDadosFormulario({ ...dadosFormulario, descricao: e.target.value })
                    }
                    required
                    minLength={100}
                  />
                  <div
                    className={`${styles.charCount}`}
                    aria-live="polite"
                  >
                    {dadosFormulario.descricao.length}/100 mínimo
                  </div>
                </div>

                <div>
                  <Label htmlFor="imagem" className={styles.label}>
                    Anexar Imagem (Opcional)
                  </Label>
                  <div className={styles.fileInputWrapper}>
                    <Input
                      id="imagem"
                      name="anexo"
                      type="file"
                      accept="image/*"
                      onChange={handleMudancaImagem}
                      className={`${styles.fileInput} ${styles.field}`}
                    />
                    {dadosFormulario.imagem && (
                      <p className={styles.fileSelected}>
                        Arquivo selecionado: {dadosFormulario.imagem.name}
                      </p>
                    )}
                  </div>
                </div>

                

                <div className={styles.infoBox}>
                  <p className={styles.infoText}>
                    Os dados informados serão utilizados exclusivamente para registro e apuração da denúncia.
                  </p>
                </div>

                {erro && <div className={styles.errorText}>{erro}</div>}
                {sucesso && <div className={styles.successText}>{sucesso}</div>}

                <Button 
                  type="submit" 
                  className={styles.submitButton}
                  size="lg"
                  disabled={estaEnviando || dadosFormulario.descricao.length < 100 || !dadosFormulario.categoria}
                >
                  <Send className={styles.sendIcon} />
                  {estaEnviando ? "Enviando..." : "Enviar Denúncia Anônima"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaginaDenuncia;
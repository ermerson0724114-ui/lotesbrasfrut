import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, ArrowRight, UserCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ username, password });
      toast({ title: "Bem-vindo de volta!" });
      setLocation("/");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/50 to-primary/5 px-4 relative overflow-hidden">
      
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

      <Card className="w-full max-w-md shadow-2xl border-white/20 glass relative z-10 p-2 sm:p-4">
        <CardHeader className="space-y-3 pb-6 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-inner mb-2">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display text-foreground">Acesso ao Sistema</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Gestão de Liberação de Lotes
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input 
                id="username" 
                placeholder="Ex: admin" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded-xl h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl h-12 bg-background/50 border-border/50 focus:bg-background transition-colors"
                required 
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all text-base mt-2" 
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Autenticando..." : "Entrar"}
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/60"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-semibold">Ou</span>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              className="w-full h-12 rounded-xl font-bold border-border/80 hover:bg-secondary/50 text-muted-foreground"
              onClick={() => setLocation("/")}
            >
              <UserCircle className="w-5 h-5 mr-2 opacity-70" />
              Entrar como Visitante
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

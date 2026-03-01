import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <Layout title="Ops!">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
          <AlertCircle className="h-10 w-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-display font-bold text-foreground mb-2">404</h1>
        <p className="text-muted-foreground mb-8 text-balance">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Link href="/">
          <Button className="rounded-xl h-12 px-8 font-bold shadow-lg">
            Voltar para o Início
          </Button>
        </Link>
      </div>
    </Layout>
  );
}
